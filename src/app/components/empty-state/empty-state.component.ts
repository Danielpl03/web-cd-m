import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
        <line x1="9" x2="9.01" y1="9" y2="9"/>
        <line x1="15" x2="15.01" y1="9" y2="9"/>
      </svg>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      color: var(--text-muted);
    }

    svg {
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    p {
      font-size: 0.9375rem;
      max-width: 400px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'No hay resultados';
  @Input() message = 'No se encontraron elementos para mostrar.';
}
