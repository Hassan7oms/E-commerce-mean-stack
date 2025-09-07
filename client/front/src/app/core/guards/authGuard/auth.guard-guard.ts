import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  const returnUrl = state.url;
  router.navigate(['/login'], { queryParams: { returnUrl } });
  return false;
};

// Guard for admin routes
export const adminGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    // Redirect to login if not authenticated
    const returnUrl = state.url;
    router.navigate(['/login'], { queryParams: { returnUrl } });
  } else {
    // Redirect to home if authenticated but not admin
    router.navigate(['/home']);
  }
  
  return false;
};

// Guard for guest-only routes (login, register)
export const guestGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirect authenticated users based on their role
  if (authService.isAdmin()) {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/home']);
  }
  return false;
};

// Guard for public routes - prevents admin users from accessing public layout
export const publicGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is admin, redirect to admin dashboard
  if (authService.isAuthenticated() && authService.isAdmin()) {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  // Allow access for non-admin users (both authenticated customers and guests)
  return true;
};
