import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { SupabaseService } from '../../services/supabase.service';
import { SeoService } from '../../services/seo.service';
import { Category, ProductWithImage, DepartmentWithImage } from '../../models/store.models';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="category-page">
      <nav class="breadcrumb">
        <a routerLink="/">Inicio</a>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
        @if (department()) {
          <a [routerLink]="['/departamento', department()!.id_departamento]">{{ department()?.departamento }}</a>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        }
        <span>{{ category()?.nombre }}</span>
      </nav>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (!category()) {
        <app-empty-state 
          title="Categoría no encontrada" 
          message="La categoría que buscas no existe o no está disponible."
        />
      } @else {
        <header class="page-header">
          <h1>{{ category()?.nombre }}</h1>
          <p>{{ products().length }} productos encontrados</p>
        </header>

        @if (products().length === 0) {
          <app-empty-state 
            title="No hay productos" 
            message="No se encontraron productos en esta categoría."
          />
        } @else {
          <div class="products-grid">
            @for (product of products(); track product.id_producto) {
              <app-product-card [product]="product" />
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .category-page {
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
      flex-wrap: wrap;
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
export class CategoryComponent implements OnInit {
  category = signal<Category | null>(null);
  department = signal<DepartmentWithImage | null>(null);
  products = signal<ProductWithImage[]>([]);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private seo: SeoService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    try {
      const cat = await this.supabaseService.getCategoryById(id);
      this.category.set(cat);
      
      if (cat) {
        const [dept, prods] = await Promise.all([
          this.supabaseService.getDepartmentById(cat.id_departamento),
          this.supabaseService.getProductsByCategory(id)
        ]);
        
        this.department.set(dept);
        this.products.set(prods);
      }
    } catch (error) {
      console.error('Error loading category:', error);
    } finally {
      this.loading.set(false);
    }

    const cat = this.category();
    if (!cat) {
      this.seo.setPage({
        title: 'Categoría no encontrada',
        description:
          'La categoría solicitada no existe o no está disponible en C&D Márquez Corp.',
        urlPath: `/categoria/${id}`,
        noIndex: true,
        jsonLd: null,
      });
    } else {
      const deptName = this.department()?.departamento;
      this.seo.setPage({
        title: cat.nombre,
        description: deptName
          ? `Productos de la categoría ${cat.nombre} en ${deptName}. Compra en ${this.seo.brand}.`
          : `Productos de la categoría ${cat.nombre} en ${this.seo.brand}.`,
        urlPath: `/categoria/${id}`,
        jsonLd: null,
      });
    }
  }
}
