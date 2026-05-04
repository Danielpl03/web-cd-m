import { Injectable, computed, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartLineItem, ProductDetail } from '../models/store.models';

const STORAGE_KEY = 'cd-marquez-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly items = signal<CartLineItem[]>([]);

  readonly totalQuantity = computed(() =>
    this.items().reduce((sum, line) => sum + line.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this.items().reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFromStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartLineItem[];
      if (Array.isArray(parsed)) {
        this.items.set(parsed.filter(this.isValidLine));
      }
    } catch {
      /* ignore corrupt storage */
    }
  }

  private isValidLine(line: unknown): line is CartLineItem {
    if (!line || typeof line !== 'object') return false;
    const l = line as CartLineItem;
    return (
      typeof l.id_producto === 'number' &&
      typeof l.descripcion === 'string' &&
      typeof l.imageUrl === 'string' &&
      typeof l.unitPrice === 'number' &&
      typeof l.quantity === 'number' &&
      l.quantity > 0
    );
  }

  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
    } catch {
      /* quota or private mode */
    }
  }

  addProduct(product: ProductDetail, quantity = 1): void {
    const q = Math.max(1, Math.floor(quantity));
    const unitPrice = product.precioUSD ?? product.precio ?? 0;
    this.items.update((lines) => {
      const idx = lines.findIndex((l) => l.id_producto === product.id_producto);
      if (idx === -1) {
        return [
          ...lines,
          {
            id_producto: product.id_producto,
            descripcion: product.descripcion,
            codigo: product.codigo,
            imageUrl: product.imageUrl,
            unitPrice,
            quantity: q,
          },
        ];
      }
      const next = [...lines];
      const line = next[idx];
      next[idx] = { ...line, quantity: line.quantity + q };
      return next;
    });
    this.persist();
  }

  setQuantity(idProducto: number, quantity: number): void {
    const q = Math.floor(quantity);
    if (!Number.isFinite(q) || q <= 0) {
      this.removeLine(idProducto);
      return;
    }
    this.items.update((lines) =>
      lines.map((l) => (l.id_producto === idProducto ? { ...l, quantity: q } : l))
    );
    this.persist();
  }

  removeLine(idProducto: number): void {
    this.items.update((lines) => lines.filter((l) => l.id_producto !== idProducto));
    this.persist();
  }

  clear(): void {
    this.items.set([]);
    this.persist();
  }
}
