import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; {{ currentYear }} C&D Márquez Corp. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--primary);
      color: white;
      padding: 1.5rem;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      text-align: center;
    }

    p {
      font-size: 0.875rem;
      opacity: 0.9;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
