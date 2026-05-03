import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { ProductDetail, ProductoImage } from '../../models/store.models';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, LoadingSpinnerComponent],
  template: `
    
    <main class="main-content">
      @if (loading()) {
        <app-loading-spinner />
      } @else if (product()) {
        <nav class="breadcrumb">
          <a routerLink="/">Inicio</a>
          @if (product()!.department) {
            <span class="separator">/</span>
            <a [routerLink]="['/departamento', product()!.department!.id_departamento]">
              {{ product()!.department!.departamento }}
            </a>
          }
          @if (product()!.category) {
            <span class="separator">/</span>
            <a [routerLink]="['/categoria', product()!.category!.id_categoria]">
              {{ product()!.category!.nombre }}
            </a>
          }
          <span class="separator">/</span>
          <span class="current">{{ product()!.descripcion }}</span>
        </nav>

        <div class="product-container">
          <!-- Image Carousel -->
          <div class="carousel-section">
            <div class="main-image-container">
              <button 
                class="carousel-btn prev" 
                (click)="prevImage()" 
                [disabled]="this.images().length <= 1"
                aria-label="Imagen anterior">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              
              <div class="main-image">
                <img 
                  [src]="currentImage()" 
                  [alt]="product()!.descripcion"
                  (error)="onImageError($event)"
                  loading="eager"
                />
              </div>
              
              <button 
                class="carousel-btn next" 
                (click)="nextImage()" 
                [disabled]="this.images().length <= 1"
                aria-label="Siguiente imagen">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>

            @if (this.images().length > 1) {
              <div class="thumbnails">
                @for (img of this.images(); track img; let i = $index) {
                  <button 
                    class="thumbnail" 
                    [class.active]="currentIndex() === i"
                    (click)="setImage(i)"
                    [attr.aria-label]="'Ver imagen ' + (i + 1)">
                    <img [src]="img" [alt]="'Miniatura ' + (i + 1)" loading="lazy" />
                  </button>
                }
              </div>
            }

            <div class="image-counter">
              {{ currentIndex() + 1 }} / {{ this.images().length }}
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-info">
            <h1 class="product-title">{{ product()!.descripcion }}</h1>
            
            @if (product()!.codigo) {
              <p class="product-code">Código: {{ product()!.codigo }}</p>
            }

            <div class="price-section">
              @if (product()!.precioUSD) {
                <span class="price">{{ product()!.precioUSD | currency:'USD':'symbol':'1.2-2' }}</span>
              } @else if (product()!.precio) {
                <span class="price">{{ product()!.precio | currency:'USD':'symbol':'1.2-2' }}</span>
              }
            </div>

            <!-- Ficha Técnica -->
            @if (product()!.etiquetas.length > 0) {
              <div class="specs-section">
                <h2 class="specs-title">Detalles del Producto</h2>
                <dl class="specs-list">
                  @for (etiqueta of product()!.etiquetas; track etiqueta.id_etiqueta) {
                    <div class="spec-item">
                      <dt class="spec-label">{{ etiqueta.nombre }}</dt>
                      <dd class="spec-value">{{ etiqueta.valor }}</dd>
                    </div>
                  }
                </dl>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="not-found">
          <h2>Producto no encontrado</h2>
          <a routerLink="/" class="back-link">Volver al inicio</a>
        </div>
      }
    </main>

  `,
  styles: [`
    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      min-height: calc(100vh - 200px);
    }

    .breadcrumb {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
      font-size: 0.875rem;
    }

    .breadcrumb a {
      color: var(--accent);
      text-decoration: none;
      transition: opacity 0.2s;
    }

    .breadcrumb a:hover {
      opacity: 0.8;
    }

    .breadcrumb .separator {
      color: var(--text-muted);
    }

    .breadcrumb .current {
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }

    .product-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: start;
    }

    @media (max-width: 768px) {
      .product-container {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    /* Carousel Styles */
    .carousel-section {
      position: sticky;
      top: 2rem;
    }

    .main-image-container {
      position: relative;
      background: var(--surface);
      border-radius: var(--radius);
      overflow: hidden;
      aspect-ratio: 1;
    }

    .main-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .main-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--surface);
      border: 1px solid var(--border);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      z-index: 2;
    }

    .carousel-btn:hover:not(:disabled) {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .carousel-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .carousel-btn svg {
      width: 20px;
      height: 20px;
    }

    .carousel-btn.prev {
      left: 1rem;
    }

    .carousel-btn.next {
      right: 1rem;
    }

    .thumbnails {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

    .thumbnail {
      flex-shrink: 0;
      width: 64px;
      height: 64px;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
      background: var(--surface);
      padding: 0;
      transition: border-color 0.2s;
    }

    .thumbnail.active {
      border-color: var(--primary);
    }

    .thumbnail:hover:not(.active) {
      border-color: var(--border);
    }

    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-counter {
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.75rem;
    }

    /* Product Info Styles */
    .product-info {
      padding: 1rem 0;
    }

    .product-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.3;
      margin-bottom: 0.5rem;
    }

    .product-code {
      font-size: 0.9375rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    .price-section {
      margin-bottom: 2rem;
    }

    .price {
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent);
    }

    .specs-section {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 1.5rem;
      margin-top: 1.5rem;
    }

    .specs-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }

    .specs-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .spec-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
    }

    .spec-item:last-child {
      border-bottom: none;
    }

    .spec-label {
      font-weight: 500;
      color: var(--text-primary);
      flex-shrink: 0;
    }

    .spec-value {
      color: var(--text-secondary);
      text-align: right;
      word-break: break-word;
    }

    .not-found {
      text-align: center;
      padding: 4rem 1rem;
    }

    .not-found h2 {
      font-size: 1.5rem;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .back-link {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: var(--primary);
      color: white;
      border-radius: var(--radius);
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.2s;
    }

    .back-link:hover {
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .carousel-section {
        position: static;
      }

      .product-title {
        font-size: 1.5rem;
      }

      .price {
        font-size: 1.75rem;
      }
    }
  `]
})
export class ProductComponent implements OnInit {
  product = signal<ProductDetail | null>(null);
  loading = signal(true);
  currentIndex = signal(0);
  images = signal<string[]>([]);

  currentImage = computed(() => {
    const p = this.product();
    if (!p || this.images().length === 0) return '';
    return this.images()[this.currentIndex()];
  });

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = Number(params['id']);
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  async loadProduct(productId: number): Promise<void> {
    this.loading.set(true);
    this.currentIndex.set(0);
    
    const productDetail = await this.supabaseService.getProductDetail(productId);
    this.product.set(productDetail);
    var images = [productDetail?.imageUrl ?? ''];
    images.push(...(productDetail?.images ?? []));
    this.images.set(images);
    this.loading.set(false);
  }

  nextImage(): void {
    const p = this.product();
    if (!p) return;
    this.currentIndex.set((this.currentIndex() + 1) % this.images().length);
  }

  prevImage(): void {
    const p = this.product();
    if (!p) return;
    const newIndex = this.currentIndex() - 1;
    this.currentIndex.set(newIndex < 0 ? this.images().length - 1 : newIndex);
  }

  setImage(index: number): void {
    this.currentIndex.set(index);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'images/placeholder.jpg';
  }
}
