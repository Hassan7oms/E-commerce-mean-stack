import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/authService/auth.service';
import { UserInterface } from '../../../../shared/models/user.interface';
import { ClickOutsideDirective } from '../../../../shared/directives/click-outside.directive';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: UserInterface | null = null;
  isAuthenticated = false;
  showUserMenu = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });

    // Subscribe to current user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Toggle user menu
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  // Close user menu
  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  // Navigate to login
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Navigate to register
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Navigate to profile
  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeUserMenu();
  }

  // Navigate to orders
  goToOrders(): void {
    this.router.navigate(['/orders']);
    this.closeUserMenu();
  }

  // Navigate to wishlist
  goToWishlist(): void {
    this.router.navigate(['/wishlist']);
    this.closeUserMenu();
  }

  // Navigate to cart
  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  // Logout user
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.closeUserMenu();
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails, clear local data and redirect
        this.closeUserMenu();
        this.router.navigate(['/home']);
      }
    });
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Navigate to admin dashboard
  goToAdmin(): void {
    this.router.navigate(['/admin']);
    this.closeUserMenu();
  }

  // Search functionality
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value.trim();
    
    if (query) {
      this.router.navigate(['/products'], { 
        queryParams: { search: query } 
      });
    }
  }

  // Handle search form submission
  onSearchSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const input = form.querySelector('input[type="search"]') as HTMLInputElement;
    const query = input.value.trim();
    
    if (query) {
      this.router.navigate(['/products'], { 
        queryParams: { search: query } 
      });
    }
  }
}
