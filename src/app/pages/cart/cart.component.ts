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
  styleUrls: ['cart.component.css'],
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
