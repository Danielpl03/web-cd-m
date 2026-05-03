import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DepartmentWithImage } from '../../models/store.models';

@Component({
  selector: 'app-department-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/departamento', department.id_departamento]" class="department-card">
      <div class="image-container">
        <img 
          [src]="department.imageUrl" 
          [alt]="department.departamento"
          (error)="onImageError($event)"
          loading="lazy"
        />
        <div class="overlay"></div>
      </div>
      <div class="card-content">
        <h3 class="department-name">{{ department.departamento }}</h3>
        <span class="view-link">
          Ver productos
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
        </span>
      </div>
    </a>
  `,
  styles: [`
    .department-card {
      display: block;
      position: relative;
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--shadow);
      transition: transform 0.2s, box-shadow 0.2s;
      aspect-ratio: 4/3;
    }

    .department-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .image-container {
      position: absolute;
      inset: 0;
    }

    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .department-card:hover .image-container img {
      transform: scale(1.05);
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(26, 39, 68, 0.9) 0%, rgba(26, 39, 68, 0.3) 50%, transparent 100%);
    }

    .card-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1.5rem;
      color: white;
    }

    .department-name {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .view-link {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--accent-light);
      transition: gap 0.2s;
    }

    .department-card:hover .view-link {
      gap: 0.625rem;
    }

    @media (max-width: 640px) {
      .card-content {
        padding: 1rem;
      }

      .department-name {
        font-size: 1.125rem;
      }
    }
  `]
})
export class DepartmentCardComponent {
  @Input({ required: true }) department!: DepartmentWithImage;

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'images/placeholder.jpg';
  }
}
