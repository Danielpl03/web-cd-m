import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import type { Request } from 'express';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

/** URL absoluta del request (incl. Vercel rewrites / proxies). */
function resolveRequestUrl(req: Request): string {
  const xfProtoRaw = req.headers['x-forwarded-proto'];
  const proto =
    typeof xfProtoRaw === 'string'
      ? xfProtoRaw.split(',')[0].trim()
      : req.protocol === 'https'
        ? 'https'
        : 'http';

  const host =
    (typeof req.headers['x-forwarded-host'] === 'string' && req.headers['x-forwarded-host']) ||
    (typeof req.headers['host'] === 'string' && req.headers['host']) ||
    'localhost';

  const raw =
    (typeof req.headers['x-vercel-original-url'] === 'string' && req.headers['x-vercel-original-url']) ||
    (typeof req.headers['x-invoke-path'] === 'string' && req.headers['x-invoke-path']) ||
    req.originalUrl ||
    req.url ||
    '/';

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  const pathAndQuery = raw.startsWith('/') ? raw : `/${raw}`;
  return `${proto}://${host}${pathAndQuery}`;
}

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  server.set('trust proxy', 1);

  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Archivos estáticos del build del navegador (JS, CSS, imágenes…)
  server.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
    })
  );

  // Rutas SPA: renderizado Angular en el servidor
  server.get('*', (req, res, next) => {
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: resolveRequestUrl(req),
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl || '/' }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/** Arrancar Node solo en local (`serve:ssr`); en Vercel se importa `app` sin escuchar puerto. */
if (!process.env['VERCEL']) {
  const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
  if (entry && import.meta.url === entry) {
    run();
  }
}
