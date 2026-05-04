import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { SupabaseService } from '../../services/supabase.service';
import { SeoService } from '../../services/seo.service';
import { ProductWithImage } from '../../models/store.models';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="search-page">
      <nav class="breadcrumb">
        <a routerLink="/">Inicio</a>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
        <span>Búsqueda</span>
      </nav>

      <header class="page-header">
        <h1>Resultados para "{{ query() }}"</h1>
        @if (!loading()) {
          <p>{{ products().length }} productos encontrados</p>
        }
      </header>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (products().length === 0) {
        <app-empty-state 
          title="No se encontraron productos" 
          message="Intenta con otros términos de búsqueda o explora nuestros departamentos."
        />
      } @else {
        <div class="products-grid">
          @for (product of products(); track product.id_producto) {
            <app-product-card [product]="product" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .search-page {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    .breadcrumb a {
      color: var(--accent);
      transition: color 0.2s;
    }

    .breadcrumb a:hover {
      color: var(--accent-light);
    }

    .breadcrumb span {
      color: var(--text-secondary);
      font-weight: 500;
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .page-header p {
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.5rem;
      align-items: stretch;
    }
    
    .products-grid > * {
      height: 100%;
    }

    @media (max-width: 640px) {
      .page-header h1 {
        font-size: 1.5rem;
      }

      .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
    }

    @media (max-width: 400px) {
      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SearchComponent implements OnInit {
  query = signal('');
  products = signal<ProductWithImage[]>([]);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      const q = params['q'] || '';
      this.query.set(q);
      
      if (q) {
        this.loading.set(true);
        try {
          const results = await this.supabaseService.searchProducts(q);
          this.products.set(results);
        } catch (error) {
          console.error('Error searching products:', error);
        } finally {
          this.loading.set(false);
        }
        const count = this.products().length;
        this.seo.setPage({
          title: `Búsqueda: ${q}`,
          description:
            count === 0
              ? `No hay resultados para «${q}» en ${this.seo.brand}. Prueba otros términos o explora por departamento.`
              : `${count} producto(s) para «${q}» en ${this.seo.brand}. Compra online y consulta por WhatsApp.`,
          jsonLd: null,
        });
      } else {
        this.products.set([]);
        this.loading.set(false);
        this.seo.setPage({
          title: 'Búsqueda de productos',
          description: `Busca en el catálogo de ${this.seo.brand} por nombre o código.`,
          urlPath: '/buscar',
          jsonLd: null,
        });
      }
    });
  }
}
