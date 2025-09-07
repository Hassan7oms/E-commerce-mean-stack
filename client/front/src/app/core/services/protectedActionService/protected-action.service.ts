import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../authService/auth.service';
import { RedirectService } from '../redirectService/redirect.service';

@Injectable({
  providedIn: 'root'
})
export class ProtectedActionService {

  constructor(
    private authService: AuthService,
    private router: Router,
    private redirectService: RedirectService
  ) {}

  // Execute a protected action - redirects to login if not authenticated
  executeProtectedAction(action: () => void, returnUrl?: string): void {
    if (this.authService.isAuthenticated()) {
      action();
    } else {
      // Store current URL for redirect after login
      if (returnUrl) {
        this.redirectService.storeCurrentUrl();
      } else {
        this.redirectService.storeCurrentUrl();
      }
      
      // Redirect to login
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: returnUrl || this.router.url }
      });
    }
  }

  // Add to wishlist (protected action)
  addToWishlist(productId: string, wishlistService: any): void {
    this.executeProtectedAction(() => {
      wishlistService.addToWishlist(productId).subscribe({
        next: (response: any) => {
          console.log('Added to wishlist:', response);
          // You can add a toast notification here
        },
        error: (error: any) => {
          console.error('Error adding to wishlist:', error);
          // Handle error (show toast, etc.)
        }
      });
    });
  }

  // Add to cart (protected action)
  addToCart(productId: string, variantId: string, quantity: number, cartService: any): void {
    this.executeProtectedAction(() => {
      cartService.addToCart(productId, variantId, quantity).subscribe({
        next: (response: any) => {
          console.log('Added to cart:', response);
          // You can add a toast notification here
        },
        error: (error: any) => {
          console.error('Error adding to cart:', error);
          // Handle error (show toast, etc.)
        }
      });
    });
  }

  // Proceed to checkout (protected action)
  proceedToCheckout(): void {
    this.executeProtectedAction(() => {
      this.router.navigate(['/checkout']);
    });
  }

  // View cart (protected action)
  viewCart(): void {
    this.executeProtectedAction(() => {
      this.router.navigate(['/cart']);
    });
  }

  // View wishlist (protected action)
  viewWishlist(): void {
    this.executeProtectedAction(() => {
      this.router.navigate(['/wishlist']);
    });
  }

  // Place order (protected action)
  placeOrder(orderData: any, orderService: any): void {
    this.executeProtectedAction(() => {
      orderService.placeOrder(orderData).subscribe({
        next: (response: any) => {
          console.log('Order placed:', response);
          this.router.navigate(['/orders']);
        },
        error: (error: any) => {
          console.error('Error placing order:', error);
          // Handle error (show toast, etc.)
        }
      });
    });
  }

  // Check if user can perform protected action
  canPerformProtectedAction(): boolean {
    return this.authService.isAuthenticated();
  }

  // Get login message for protected actions
  getLoginMessage(): string {
    return 'Please log in to continue with this action.';
  }
}
