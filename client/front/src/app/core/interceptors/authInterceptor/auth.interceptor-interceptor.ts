import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/authService/auth.service';
import { Router } from '@angular/router';

export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth for login/register endpoints and public endpoints
  if (req.url.includes('/login') || 
      req.url.includes('/register') || 
      req.url.includes('/category/allCategories') ||
      req.url.includes('/product/public/')) {
    return next(req);
  }

  // Add auth token to requests
  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid
        authService.logout().subscribe({
          next: () => {
            router.navigate(['/login']);
          },
          error: () => {
            // Even if logout fails, redirect to login
            router.navigate(['/login']);
          }
        });
      }
      return throwError(() => error);
    })
  );
};
