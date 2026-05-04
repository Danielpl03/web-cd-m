import { Component, OnInit, signal } from '@angular/core';
import { DepartmentCardComponent } from '../../components/department-card/department-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { SupabaseService } from '../../services/supabase.service';
import { SeoService } from '../../services/seo.service';
import { DepartmentWithImage } from '../../models/store.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DepartmentCardComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="home-page">
      <section class="hero">
        <h1>Bienvenido a C&D Márquez Corp</h1>
        <p>Descubre nuestra amplia variedad de productos</p>
      </section>

      <section class="departments-section">
        <h2>Nuestros Departamentos</h2>
        
        @if (loading()) {
          <app-loading-spinner />
        } @else if (departments().length === 0) {
          <app-empty-state 
            title="No hay departamentos" 
            message="No se encontraron departamentos disponibles en este momento."
          />
        } @else {
          <div class="departments-grid">
            @for (department of departments(); track department.id_departamento) {
              <app-department-card [department]="department" />
            }
          </div>
        }
      </section>
    </div>
  `,
  styleUrls: ['home.component.css'],
})
export class HomeComponent implements OnInit {
  departments = signal<DepartmentWithImage[]>([]);
  loading = signal(true);

  constructor(
    private supabaseService: SupabaseService,
    private seo: SeoService
  ) {}

  async ngOnInit(): Promise<void> {
    this.seo.setHomePage();
    try {
      const data = await this.supabaseService.getDepartments();
      this.departments.set(data);
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
