import { Component, OnInit, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { SeoService } from '../../services/seo.service';
import { CartService } from '../../services/cart.service';
import { ProductDetail } from '../../models/store.models';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { environment } from '../../environment';

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

            <div class="cart-actions">
              <button
                type="button"
                class="btn-add-cart"
                (click)="addToCart()"
                [class.added]="justAdded()">
                @if (justAdded()) {
                  Añadido al carrito
                } @else {
                  Añadir al carrito
                }
              </button>
              <a routerLink="/carrito" class="link-cart">Ver carrito</a>
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

            <div class="whatsapp-inquiry">
              <p class="whatsapp-inquiry-label">¿Necesitas más datos sobre este artículo?</p>
              <button
                type="button"
                class="btn-whatsapp-inquiry"
                (click)="askWhatsAppAboutProduct()"
                aria-label="Pedir más información por WhatsApp sobre este producto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.883 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Pedir más información por WhatsApp
              </button>
            </div>
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
  styleUrls: ['product.component.css'],
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

  justAdded = signal(false);
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private cartService: CartService,
    private seo: SeoService
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
    const images = [productDetail?.imageUrl ?? ''];
    images.push(...(productDetail?.images ?? []));
    this.images.set(images);
    this.loading.set(false);

    if (!productDetail) {
      this.seo.setPage({
        title: 'Producto no encontrado',
        description:
          'El producto solicitado no está disponible o ha sido retirado del catálogo de C&D Márquez Corp.',
        urlPath: `/producto/${productId}`,
        noIndex: true,
        jsonLd: null,
      });
      return;
    }

    const p = productDetail;
    const imgsForLd = [p.imageUrl, ...(p.images ?? [])].filter(Boolean) as string[];
    const absImages = this.seo.productImageUrlsForJsonLd(imgsForLd);
    const price = p.precioUSD ?? p.precio;
    let description = `${p.descripcion}. Disponible en ${this.seo.brand}.`;
    if (price != null) {
      description = `${p.descripcion}. Precio referencia USD ${price}. ${this.seo.brand}, compra online.`;
    }

    this.seo.setPage({
      title: p.descripcion,
      description: description.slice(0, 320),
      urlPath: `/producto/${p.id_producto}`,
      imageUrl: p.imageUrl,
      pageType: 'product',
      jsonLd: this.seo.buildProductJsonLd(p, absImages),
    });
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

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cartService.addProduct(p);
    this.justAdded.set(true);
    setTimeout(() => this.justAdded.set(false), 2200);
  }

  askWhatsAppAboutProduct(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const p = this.product();
    if (!p) return;
    const productUrl = `${window.location.origin}/producto/${p.id_producto}`;
    const lines: string[] = [
      'Hola, me gustaría recibir más información sobre este producto:',
      '',
      `*${p.descripcion}*`,
    ];
    if (p.codigo) {
      lines.push(`Código: ${p.codigo}`);
    }
    // lines.push(`ID: ${p.id_producto}`);
    lines.push(`Enlace: ${productUrl}`);
    lines.push('');
    lines.push('Gracias.');
    const message = lines.join('\n');
    const encoded = encodeURIComponent(message);
    const phoneDigits = (environment.whatsappOrderPhone ?? '').replace(/\D/g, '');
    const url =
      phoneDigits.length > 0
        ? `https://wa.me/${phoneDigits}?text=${encoded}`
        : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
