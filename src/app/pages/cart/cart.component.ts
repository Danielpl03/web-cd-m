import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { environment } from '../../environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, EmptyStateComponent],
  template: `
    <div class="cart-page">
      <nav class="breadcrumb">
        <a routerLink="/">Inicio</a>
        <span class="separator">/</span>
        <span class="current">Carrito</span>
      </nav>

      <header class="page-header">
        <h1>Carrito de compras</h1>
      </header>

      @if (cart.items().length === 0) {
        <app-empty-state
          title="Tu carrito está vacío"
          message="Añade productos desde la ficha de cada artículo para verlos aquí."
        />
        <div class="actions-empty">
          <a routerLink="/" class="btn-primary">Seguir comprando</a>
        </div>
      } @else {
        <div class="cart-layout">
          <ul class="cart-list" aria-label="Productos en el carrito">
            @for (line of cart.items(); track line.id_producto) {
              <li class="cart-row">
                <a [routerLink]="['/producto', line.id_producto]" class="thumb-link">
                  <img
                    [src]="line.imageUrl"
                    [alt]="line.descripcion"
                    class="thumb"
                    (error)="onImageError($event)"
                  />
                </a>
                <div class="line-body">
                  <a [routerLink]="['/producto', line.id_producto]" class="title-link">
                    {{ line.descripcion }}
                  </a>
                  @if (line.codigo) {
                    <p class="code">Código: {{ line.codigo }}</p>
                  }
                  <p class="unit-price">{{ line.unitPrice | currency: 'USD' : 'symbol' : '1.2-2' }} c/u</p>
                </div>
                <div class="qty-block">
                  <label class="sr-only" [attr.for]="'qty-' + line.id_producto">Cantidad</label>
                  <div class="qty-controls">
                    <button
                      type="button"
                      class="qty-btn"
                      (click)="decrement(line.id_producto)"
                      [attr.aria-label]="'Reducir cantidad de ' + line.descripcion">
                      −
                    </button>
                    <input
                      [id]="'qty-' + line.id_producto"
                      class="qty-input"
                      type="number"
                      min="1"
                      [value]="line.quantity"
                      (change)="onQuantityInput(line.id_producto, $event)"
                    />
                    <button
                      type="button"
                      class="qty-btn"
                      (click)="increment(line.id_producto)"
                      [attr.aria-label]="'Aumentar cantidad de ' + line.descripcion">
                      +
                    </button>
                  </div>
                </div>
                <div class="line-total">
                  {{ lineTotal(line) | currency: 'USD' : 'symbol' : '1.2-2' }}
                </div>
                <button
                  type="button"
                  class="remove-btn"
                  (click)="remove(line.id_producto)"
                  [attr.aria-label]="'Quitar del carrito: ' + line.descripcion">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    <line x1="10" x2="10" y1="11" y2="17"/>
                    <line x1="14" x2="14" y1="11" y2="17"/>
                  </svg>
                </button>
              </li>
            }
          </ul>

          <aside class="cart-summary">
            <h2>Resumen</h2>
            <div class="summary-row">
              <span>Subtotal ({{ cart.totalQuantity() }} artículos)</span>
              <span>{{ cart.subtotal() | currency: 'USD' : 'symbol' : '1.2-2' }}</span>
            </div>
            <p class="hint">Al finalizar se abrirá WhatsApp con el detalle del pedido listo para enviar.</p>
            <div class="summary-actions">
              <a routerLink="/" class="btn-secondary">Seguir comprando</a>
              <button
                type="button"
                class="btn-primary btn-whatsapp"
                (click)="finishViaWhatsApp()"
                aria-label="Enviar el pedido por WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.883 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Finalizar pedido (WhatsApp)
              </button>
            </div>
            <button type="button" class="btn-text" (click)="clearCart()">Vaciar carrito</button>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-page {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .breadcrumb {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    .breadcrumb a {
      color: var(--accent);
      text-decoration: none;
    }

    .breadcrumb a:hover {
      opacity: 0.85;
    }

    .breadcrumb .separator,
    .breadcrumb .current {
      color: var(--text-muted);
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .actions-empty {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr minmax(260px, 320px);
      gap: 2rem;
      align-items: start;
    }

    @media (max-width: 900px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }
    }

    .cart-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-row {
      display: grid;
      grid-template-columns: 88px 1fr auto auto auto;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
      background: var(--surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    @media (max-width: 640px) {
      .cart-row {
        grid-template-columns: 72px 1fr;
        grid-template-rows: auto auto auto;
      }
      .thumb-link { grid-row: 1 / span 2; }
      .line-body { grid-column: 2; }
      .qty-block { grid-column: 2; justify-self: start; }
      .line-total { grid-column: 2; font-weight: 700; }
      .remove-btn { grid-column: 2; justify-self: end; grid-row: 1; align-self: start; }
    }

    .thumb-link {
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: var(--background);
    }

    .thumb {
      width: 88px;
      height: 88px;
      object-fit: contain;
    }

    .line-body {
      min-width: 0;
    }

    .title-link {
      font-weight: 600;
      color: var(--text-primary);
      text-decoration: none;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .title-link:hover {
      color: var(--accent);
    }

    .code {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .unit-price {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.35rem;
    }

    .qty-controls {
      display: flex;
      align-items: center;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: var(--background);
    }

    .qty-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      font-size: 1.125rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qty-btn:hover {
      background: var(--border);
    }

    .qty-input {
      width: 48px;
      height: 36px;
      border: none;
      border-left: 1px solid var(--border);
      border-right: 1px solid var(--border);
      text-align: center;
      font-size: 0.9375rem;
      background: var(--surface);
      color: var(--text-primary);
    }

    .qty-input:focus {
      outline: 2px solid var(--accent);
      outline-offset: -2px;
    }

    .line-total {
      font-weight: 700;
      color: var(--accent);
      white-space: nowrap;
    }

    .remove-btn {
      padding: 0.5rem;
      border: none;
      background: transparent;
      color: var(--text-muted);
      border-radius: var(--radius-sm);
    }

    .remove-btn:hover {
      color: var(--text-primary);
      background: var(--background);
    }

    .cart-summary {
      position: sticky;
      top: 5rem;
      padding: 1.5rem;
      background: var(--surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .cart-summary h2 {
      font-size: 1.125rem;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }

    .hint {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
    }

    .summary-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .btn-primary,
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius);
      font-weight: 600;
      text-align: center;
      border: none;
      font-size: 0.9375rem;
      text-decoration: none;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-light);
    }

    .btn-whatsapp {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: #25d366;
      color: #fff;
    }

    .btn-whatsapp:hover {
      background: #1ebe57;
      filter: brightness(1.02);
    }

    .btn-secondary {
      background: var(--background);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .btn-text {
      width: 100%;
      padding: 0.5rem;
      border: none;
      background: none;
      color: var(--text-muted);
      font-size: 0.875rem;
      text-decoration: underline;
    }

    .btn-text:hover {
      color: var(--text-primary);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `],
})
export class CartComponent {
  protected readonly cart = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);

  lineTotal(line: { unitPrice: number; quantity: number }): number {
    return line.unitPrice * line.quantity;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.includes('placeholder')) return;
    img.src = 'images/placeholder.jpg';
  }

  increment(idProducto: number): void {
    const line = this.cart.items().find((l) => l.id_producto === idProducto);
    if (line) this.cart.setQuantity(idProducto, line.quantity + 1);
  }

  decrement(idProducto: number): void {
    const line = this.cart.items().find((l) => l.id_producto === idProducto);
    if (line) this.cart.setQuantity(idProducto, line.quantity - 1);
  }

  onQuantityInput(idProducto: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    if (Number.isFinite(value)) {
      this.cart.setQuantity(idProducto, value);
    }
  }

  remove(idProducto: number): void {
    this.cart.removeLine(idProducto);
  }

  clearCart(): void {
    this.cart.clear();
  }

  finishViaWhatsApp(): void {
    if (!isPlatformBrowser(this.platformId) || this.cart.items().length === 0) {
      return;
    }
    const message = this.buildOrderMessage();
    const encoded = encodeURIComponent(message);
    const phoneDigits = (environment.whatsappOrderPhone ?? '').replace(/\D/g, '');
    const url =
      phoneDigits.length > 0
        ? `https://wa.me/${phoneDigits}?text=${encoded}`
        : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private buildOrderMessage(): string {
    const lines: string[] = [
      'Hola, quiero realizar el siguiente pedido:',
      '',
    ];
    for (const line of this.cart.items()) {
      let row = `• ${line.descripcion}`;
      if (line.codigo) {
        row += ` (Código: ${line.codigo})`;
      }
      lines.push(row);
      lines.push(
        `  ${line.quantity} × USD ${line.unitPrice.toFixed(2)} = USD ${(line.unitPrice * line.quantity).toFixed(2)}`
      );
      lines.push('');
    }
    lines.push(`*Subtotal:* USD ${this.cart.subtotal().toFixed(2)}`);
    lines.push('');
    lines.push('Quedo atento/a a su confirmación. Gracias.');
    return lines.join('\n');
  }
}
