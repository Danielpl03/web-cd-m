import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'departamento/:id',
    loadComponent: () => import('./pages/department/department.component').then(m => m.DepartmentComponent)
  },
  {
    path: 'categoria/:id',
    loadComponent: () => import('./pages/category/category.component').then(m => m.CategoryComponent)
  },
  {
    path: 'buscar',
    loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'producto/:id',
    loadComponent: () => import('./pages/product/product.component').then(m => m.ProductComponent)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
