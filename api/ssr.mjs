/**
 * Punto de entrada serverless en Vercel: delega en la app Express generada por Angular SSR.
 * Los estáticos los sirve Vercel desde `outputDirectory`; el resto llega aquí vía rewrite.
 */
import serverless from 'serverless-http';
import { app } from '../dist/web-cd-m/server/server.mjs';

export default serverless(app());
