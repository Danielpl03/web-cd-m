import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Category } from '../../models/store.models';

@Component({
  selector: 'app-category-chip',
  standalone: true,
  template: `
    <button 
      class="category-chip" 
      [class.active]="isActive"
      (click)="onClick()"
    >
      {{ category.nombre }}
    </button>
  `,
  styles: [`
    .category-chip {
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

    .category-chip:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .category-chip.active {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }
  `]
})
export class CategoryChipComponent {
  @Input({ required: true }) category!: Category;
  @Input() isActive = false;
  @Output() selected = new EventEmitter<Category>();

  onClick(): void {
    this.selected.emit(this.category);
  }
}
