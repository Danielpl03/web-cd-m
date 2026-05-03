import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductWithImage } from '../../models/store.models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  template: `
    <a [routerLink]="['/producto', product.id_producto]" class="product-card">
      <div class="image-container">
        <img 
          [src]="product.imageUrl" 
          [alt]="product.descripcion"
          (load)="onImageLoad()"
          (error)="onImageError($event)"
          loading="lazy"
          decoding="async"
        />
        @if (imageLoading) {
          <div class="image-placeholder">
            <div class="skeleton"></div>
          </div>
        }
      </div>
      <div class="product-info">
        <h3 class="product-name">{{ product.descripcion }}</h3>
        @if (product.codigo) {
          <p class="product-code">Código: {{ product.codigo }}</p>
        } @else {
          <p class="product-code">&nbsp;</p>
        }
        @if (product.precioUSD) {
          <p class="product-price">{{ product.precioUSD | currency:'USD':'symbol':'1.2-2' }}</p>
        } @else if (product.precio) {
          <p class="product-price">{{ product.precio | currency:'USD':'symbol':'1.2-2' }}</p>
        }
      </div>
    </a>
  `,
  styles: [`
    .product-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--surface);
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--shadow);
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
      color: inherit;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .image-container {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      background: var(--background);
    }

    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s, opacity 0.3s;
    }
    
    .image-placeholder {
      position: absolute;
      inset: 0;
      background: var(--background);
    }
    
    .skeleton {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, var(--surface) 25%, var(--background) 50%, var(--surface) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .product-card:hover .image-container img {
      transform: scale(1.05);
    }

    .product-info {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .product-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.8em;
    }

    .product-code {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
      min-height: 1.25em;
    }

    .product-price {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--accent);
      margin-top: auto;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductWithImage;
  imageLoading = true;

  onImageLoad(): void {
    this.imageLoading = false;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'images/placeholder.jpg';
    this.imageLoading = false;
  }
}
