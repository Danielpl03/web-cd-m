import { Component, OnInit, signal } from '@angular/core';
import { DepartmentCardComponent } from '../../components/department-card/department-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { SupabaseService } from '../../services/supabase.service';
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
  styles: [`
    .home-page {
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

    .hero {
      text-align: center;
      padding: 3rem 1rem;
      margin-bottom: 2rem;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      border-radius: var(--radius);
      color: white;
    }

    .hero h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }

    .hero p {
      font-size: 1.125rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }

    .departments-section h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .departments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    @media (max-width: 640px) {
      .hero {
        padding: 2rem 1rem;
      }

      .hero h1 {
        font-size: 1.5rem;
      }

      .hero p {
        font-size: 1rem;
      }

      .departments-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  departments = signal<DepartmentWithImage[]>([]);
  loading = signal(true);

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
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
