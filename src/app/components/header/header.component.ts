import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <header class="header">
      <div class="header-content">
        <a routerLink="/" class="logo-link">
          <img src="images/logo.jpg" alt="C&D Márquez Corp" class="logo" />
        </a>
        
        <div class="search-container">
          <div class="search-wrapper">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              class="search-input"
              placeholder="Buscar productos..."
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
            />
            @if (searchQuery) {
              <button class="clear-btn" (click)="clearSearch()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            }
          </div>
          <button class="search-btn" (click)="onSearch()">Buscar</button>
        </div>

        <button class="mobile-search-btn" (click)="toggleMobileSearch()">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </button>
      </div>

      @if (showMobileSearch) {
        <div class="mobile-search">
          <input
            type="text"
            class="search-input"
            placeholder="Buscar productos..."
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
          />
          <button class="search-btn" (click)="onSearch()">Buscar</button>
        </div>
      }
    </header>
  `,
  styles: [`
    .header {
      background: var(--surface);
      box-shadow: var(--shadow);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .logo-link {
      flex-shrink: 0;
    }

    .logo {
      height: 60px;
      width: auto;
      object-fit: contain;
    }

    .search-container {
      flex: 1;
      display: flex;
      gap: 0.75rem;
      max-width: 600px;
    }

    .search-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 3rem;
      border: 2px solid var(--border);
      border-radius: var(--radius);
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: var(--background);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(201, 169, 98, 0.15);
    }

    .clear-btn {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--text-muted);
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .clear-btn:hover {
      color: var(--text-primary);
    }

    .search-btn {
      padding: 0.75rem 1.5rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius);
      font-weight: 600;
      transition: background-color 0.2s;
      white-space: nowrap;
    }

    .search-btn:hover {
      background: var(--primary-light);
    }

    .mobile-search-btn {
      display: none;
      background: none;
      border: none;
      color: var(--primary);
      padding: 0.5rem;
    }

    .mobile-search {
      display: none;
      padding: 0 1rem 1rem;
      gap: 0.5rem;
    }

    .mobile-search .search-input {
      flex: 1;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0.75rem 1rem;
        gap: 1rem;
      }

      .logo {
        height: 45px;
      }

      .search-container {
        display: none;
      }

      .mobile-search-btn {
        display: flex;
        margin-left: auto;
      }

      .mobile-search {
        display: flex;
      }
    }
  `]
})
export class HeaderComponent {
  searchQuery = '';
  showMobileSearch = false;

  constructor(private router: Router) {}

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/buscar'], { queryParams: { q: this.searchQuery.trim() } });
      this.showMobileSearch = false;
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  toggleMobileSearch(): void {
    this.showMobileSearch = !this.showMobileSearch;
  }
}
