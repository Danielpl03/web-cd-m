import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CategoryChipComponent } from '../../components/category-chip/category-chip.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { SupabaseService } from '../../services/supabase.service';
import { SeoService } from '../../services/seo.service';
import { DepartmentWithImage, Category, ProductWithImage } from '../../models/store.models';

type DepartmentCategoryFilter =
  | { mode: 'all' }
  | { mode: 'uncategorized' }
  | { mode: 'category'; category: Category };

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, CategoryChipComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="department-page">
      <nav class="breadcrumb">
        <a routerLink="/">Inicio</a>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
        <span>{{ department()?.departamento }}</span>
      </nav>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (!department()) {
        <app-empty-state 
          title="Departamento no encontrado" 
          message="El departamento que buscas no existe o no está disponible."
        />
      } @else {
        <header class="page-header">
          <h1>{{ department()?.departamento }}</h1>
          <p>{{ filteredProducts().length }} productos encontrados</p>
        </header>

        @if (showCategoryFilters()) {
          <div class="categories-scroll">
            <button 
              class="category-chip all" 
              [class.active]="categoryFilter().mode === 'all'"
              (click)="clearCategory()"
            >
              Todos
            </button>
            <button
              type="button"
              class="category-chip uncategorized"
              [class.active]="categoryFilter().mode === 'uncategorized'"
              (click)="selectUncategorized()"
            >
              Sin categoría
            </button>
            @for (category of categories(); track category.id_categoria) {
              <app-category-chip 
                [category]="category"
                [isActive]="isCategorySelected(category)"
                (selected)="selectCategory($event)"
              />
            }
          </div>
        }

        @if (filteredProducts().length === 0) {
          <app-empty-state 
            title="No hay productos" 
            message="No se encontraron productos en esta categoría."
          />
        } @else {
          <div class="products-grid">
            @for (product of filteredProducts(); track product.id_producto) {
              <app-product-card [product]="product" />
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .department-page {
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

    .categories-scroll {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
      scrollbar-width: thin;
    }

    .category-chip.all {
      padding: 0.5rem 1rem;
      background: var(--surface);
      border: 2px solid var(--border);
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s;
      white-space: nowrap;
    }

    .category-chip.all:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .category-chip.all.active {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }

    .category-chip.uncategorized {
      padding: 0.5rem 1rem;
      background: var(--surface);
      border: 2px solid var(--border);
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s;
      white-space: nowrap;
    }

    .category-chip.uncategorized:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .category-chip.uncategorized.active {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
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
export class DepartmentComponent implements OnInit {
  department = signal<DepartmentWithImage | null>(null);
  categories = signal<Category[]>([]);
  products = signal<ProductWithImage[]>([]);
  categoryFilter = signal<DepartmentCategoryFilter>({ mode: 'all' });
  loading = signal(true);

  readonly showCategoryFilters = computed(
    () =>
      this.categories().length > 0 ||
      this.products().some((p) => p.id_categoria == null)
  );

  readonly filteredProducts = computed(() => {
    const list = this.products();
    const f = this.categoryFilter();
    if (f.mode === 'all') {
      const webCategoryIds = new Set(this.categories().map((c) => c.id_categoria));
      return list.filter(
        (p) => p.id_categoria == null || webCategoryIds.has(p.id_categoria)
      );
    }
    if (f.mode === 'uncategorized') {
      return list.filter((p) => p.id_categoria == null);
    }
    return list.filter((p) => p.id_categoria === f.category.id_categoria);
  });

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private seo: SeoService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    try {
      const [dept, cats, prods] = await Promise.all([
        this.supabaseService.getDepartmentById(id),
        this.supabaseService.getCategoriesByDepartment(id),
        this.supabaseService.getProductsByDepartment(id)
      ]);
      
      this.department.set(dept);
      this.categories.set(cats);
      this.products.set(prods);
    } catch (error) {
      console.error('Error loading department:', error);
    } finally {
      this.loading.set(false);
    }

    const dept = this.department();
    if (!dept) {
      this.seo.setPage({
        title: 'Departamento no encontrado',
        description:
          'El departamento solicitado no existe o no está disponible en la tienda en línea C&D Márquez Corp.',
        urlPath: `/departamento/${id}`,
        noIndex: true,
        jsonLd: null,
      });
    } else {
      this.seo.setPage({
        title: dept.departamento,
        description: `Productos del departamento ${dept.departamento} en ${this.seo.brand}. Filtra por categoría, añade al carrito y consulta por WhatsApp.`,
        urlPath: `/departamento/${id}`,
        jsonLd: null,
      });
    }
  }

  isCategorySelected(category: Category): boolean {
    const f = this.categoryFilter();
    return f.mode === 'category' && f.category.id_categoria === category.id_categoria;
  }

  selectCategory(category: Category): void {
    const f = this.categoryFilter();
    if (f.mode === 'category' && f.category.id_categoria === category.id_categoria) {
      this.categoryFilter.set({ mode: 'all' });
    } else {
      this.categoryFilter.set({ mode: 'category', category });
    }
  }

  selectUncategorized(): void {
    const f = this.categoryFilter();
    if (f.mode === 'uncategorized') {
      this.categoryFilter.set({ mode: 'all' });
    } else {
      this.categoryFilter.set({ mode: 'uncategorized' });
    }
  }

  clearCategory(): void {
    this.categoryFilter.set({ mode: 'all' });
  }
}
