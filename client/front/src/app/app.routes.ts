import { Routes } from '@angular/router';
import { PublicLayout } from './modules/public/layout/public-layout/public-layout';
import { HomePage } from './modules/public/pages/home-page/home-page';
import { Login } from './shared/login/login';
import { Register } from './shared/register/register';
import { authGuardGuard, adminGuardGuard, guestGuardGuard, publicGuardGuard } from './core/guards/authGuard/auth.guard-guard';

export const routes: Routes = [
  // Public routes with layout - protected from admin access
  {
    path: '',
    component: PublicLayout,
    canActivate: [publicGuardGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomePage },
      { path: 'products', loadComponent: () => import('./modules/public/pages/products-listing-page/products-listing-page').then(m => m.ProductsListingPage) },
      { path: 'product/:slug', loadComponent: () => import('./modules/public/pages/products-page/products-page').then(m => m.ProductsPage) },
      { path: 'about', loadComponent: () => import('./modules/public/pages/about-page/about-page').then(m => m.AboutPage) },
      { path: 'contact', loadComponent: () => import('./modules/public/pages/contact-page/contact-page').then(m => m.ContactPage) },
      { path: 'men', loadComponent: () => import('./modules/public/pages/man-page/man-page').then(m => m.ManPage) },
      { path: 'women', loadComponent: () => import('./modules/public/pages/women-page/women-page').then(m => m.WomenPage) },
      { path: 'all-products', loadComponent: () => import('./modules/public/pages/all-products-page/all-products-page').then(m => m.AllProductsPage) },
    ]
  },
  
  // Auth routes (guest only)
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuardGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuardGuard]
  },
  
  // Protected user routes (customer-only routes)
  {
    path: 'profile',
    loadComponent: () => import('./modules/public/pages/profile-page/profile-page').then(m => m.ProfilePage),
    canActivate: [authGuardGuard, publicGuardGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./modules/public/pages/orders-page/orders-page').then(m => m.OrdersPage),
    canActivate: [authGuardGuard, publicGuardGuard]
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./modules/public/pages/wishlist-page/wishlist-page').then(m => m.WishlistPage),
    canActivate: [authGuardGuard, publicGuardGuard]
  },
  {
    path: 'cart',
    loadComponent: () => import('./modules/public/pages/cart-page/cart-page').then(m => m.CartPage),
    canActivate: [authGuardGuard, publicGuardGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./modules/public/pages/checkout-page/checkout-page').then(m => m.CheckoutPage),
    canActivate: [authGuardGuard, publicGuardGuard]
  },
  
  // Admin routes
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin-routing-module').then(m => m.AdminRoutingModule),
    canActivate: [adminGuardGuard]
  },
  
  // Wildcard route - must be last
  {
    path: '**',
    loadComponent: () => import('./shared/components/redirect/redirect.component').then(m => m.RedirectComponent)
  }
];
