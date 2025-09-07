import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout/admin-layout';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/dashboard-managment/dashboard').then(m => m.Dashboard) 
      },
      { 
        path: 'products', 
        loadComponent: () => import('./pages/products-managment/products').then(m => m.AdminProducts) 
      },
      { 
        path: 'orders', 
        loadComponent: () => import('./pages/order-management/order-management').then(m => m.OrderManagement) 
      },
      { 
        path: 'reviews', 
        loadComponent: () => import('./pages/reviews-management/reviews-management').then(m => m.ReviewsManagement) 
      },
      { 
        path: 'categories', 
        loadComponent: () => import('./pages/categories-management/categories-management').then(m => m.CategoriesManagement) 
      },
      { 
        path: 'customers', 
        loadComponent: () => import('./pages/customers-management/customers-management').then(m => m.CustomersManagement) 
      },
      { 
        path: 'faq', 
        loadComponent: () => import('./pages/faq-management/faq-management').then(m => m.FAQManagement) 
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./pages/settings/settings').then(m => m.Settings) 
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
