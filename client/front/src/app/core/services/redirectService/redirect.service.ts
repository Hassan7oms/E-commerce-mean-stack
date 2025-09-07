import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../authService/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  private defaultRedirectUrl = '/home';
  private adminDefaultUrl = '/admin/dashboard';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Get the return URL from query parameters
  getReturnUrl(route: ActivatedRoute): string {
    return route.snapshot.queryParams['returnUrl'] || this.getDefaultUrl();
  }

  // Get default URL based on user role
  private getDefaultUrl(): string {
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      return this.adminDefaultUrl;
    }
    return this.defaultRedirectUrl;
  }

  // Redirect to the intended URL after login
  redirectAfterLogin(route: ActivatedRoute): void {
    const returnUrl = this.getReturnUrl(route);
    
    // If user is admin and trying to access public routes, redirect to admin dashboard
    if (this.authService.isAdmin() && !returnUrl.startsWith('/admin')) {
      this.router.navigateByUrl(this.adminDefaultUrl);
    } else if (!this.authService.isAdmin() && returnUrl.startsWith('/admin')) {
      // If non-admin user was trying to access admin routes, redirect to home
      this.router.navigateByUrl(this.defaultRedirectUrl);
    } else {
      this.router.navigateByUrl(returnUrl);
    }
  }

  // Store current URL for later redirect
  storeCurrentUrl(): void {
    const currentUrl = this.router.url;
    if (currentUrl !== '/login' && currentUrl !== '/register') {
      localStorage.setItem('intendedUrl', currentUrl);
    }
  }

  // Get stored URL and clear it
  getStoredUrl(): string | null {
    const storedUrl = localStorage.getItem('intendedUrl');
    if (storedUrl) {
      localStorage.removeItem('intendedUrl');
      return storedUrl;
    }
    return null;
  }

  // Redirect to stored URL or default
  redirectToStoredUrl(): void {
    const storedUrl = this.getStoredUrl();
    const redirectUrl = storedUrl || this.getDefaultUrl();
    
    // Apply same role-based redirect logic
    if (this.authService.isAdmin() && !redirectUrl.startsWith('/admin')) {
      this.router.navigateByUrl(this.adminDefaultUrl);
    } else if (!this.authService.isAdmin() && redirectUrl.startsWith('/admin')) {
      this.router.navigateByUrl(this.defaultRedirectUrl);
    } else {
      this.router.navigateByUrl(redirectUrl);
    }
  }

  // Clear any stored redirect URL
  clearStoredUrl(): void {
    localStorage.removeItem('intendedUrl');
  }

  // Redirect admin users to admin dashboard
  redirectToAdminDashboard(): void {
    this.router.navigateByUrl(this.adminDefaultUrl);
  }

  // Redirect regular users to home
  redirectToHome(): void {
    this.router.navigateByUrl(this.defaultRedirectUrl);
  }
}
