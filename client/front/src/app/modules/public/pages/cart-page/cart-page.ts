// src/app/pages/cart/cart-page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { CartInterface,ICartItem } from '../../../../shared/models/cart.interface';
import { ProductInterface } from '../../../../shared/models/product.interface';
import { CartService } from '../../../../core/services/cartService/cart.service';
import { ProductService } from '../../../../core/services/productService/product.service';
import { ProtectedActionService } from '../../../../core/services/protectedActionService/protected-action.service';
import { environment } from '../../../../../envirmonets/environment';

// Interface to hold price mismatch information
interface PriceMismatchInfo {
  oldPrice: number;
  newPrice: number;
}

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-page.html',
  styleUrls: ['./cart-page.css']
})
export class CartPage implements OnInit {
  cart: CartInterface | null = null;
  isLoading = true;
  error: string | null = null;

  // Use a Map to track items with price mismatches for efficient lookup
  priceMismatches = new Map<string, PriceMismatchInfo>();

  constructor(
    private cartService: CartService,
    public productService: ProductService, // <-- change 'private' to 'public'
    private protectedActionService: ProtectedActionService // Corrected name
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.error = null;
    this.priceMismatches.clear(); // Clear old mismatches on every reload

    this.cartService.getCart().subscribe({
      next: (cartData) => {
        this.cart = cartData;
        if (cartData && cartData.items.length > 0) {
          this.checkForPriceChanges(cartData);
        } else {
          this.isLoading = false; // Cart is empty, no need to check prices
        }
      },
      error: (err) => {
        this.error = "Could not load your cart. Please try again.";
        this.isLoading = false;
      }
    });
  }

  checkForPriceChanges(cart: CartInterface): void {
    const productRequests = cart.items.map(item =>
      this.productService.getProductBySlug((item.productID as ProductInterface).slug)
        .pipe(
          map(product => ({ item, product })), // Pass both item and fresh product data
          catchError(() => of({ item, product: null })) // Handle if a product was deleted
        )
    );

    forkJoin(productRequests).subscribe(results => {
      results.forEach(({ item, product }) => {
        if (product) {
          const cartProductVariant = (item.productID as ProductInterface).variant[0]; // Assuming first variant for simplicity
          const currentVariant = product.variant.find(v => v._id === cartProductVariant._id);

          if (currentVariant && currentVariant.price !== item.price) {
            this.priceMismatches.set(item._id!, {
              oldPrice: item.price,
              newPrice: currentVariant.price
            });
          }
        }
      });
      this.isLoading = false;
    });
  }

  updateQuantity(item: ICartItem, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(item._id!);
      return;
    }
    this.cartService.updateItemQuantity(item._id!, quantity).subscribe(() => this.loadCart());
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId).subscribe(() => this.loadCart());
  }

  confirmPriceChange(itemId: string): void {
    this.cartService.confirmPriceChange(itemId).subscribe(() => this.loadCart());
  }
  
  // Method to be called by the checkout button
  onCheckout(): void {
    this.protectedActionService.proceedToCheckout();
  }

  // --- Template Helper Methods ---
  calculateSubtotal(item: ICartItem): number {
    return item.price * item.quantity;
  }

  hasPriceMismatch(itemId: string): boolean {
    return this.priceMismatches.has(itemId);
  }

  getMismatchInfo(itemId: string): PriceMismatchInfo | undefined {
    return this.priceMismatches.get(itemId);
  }
  
  // Checkout button is disabled if there are any price mismatches
  get isCheckoutDisabled(): boolean {
    return this.priceMismatches.size > 0;
  }

  // Helper method to get product image URL
  getProductImageUrl(item: ICartItem): string {
    const productInterface = item.productID as ProductInterface;
    if (productInterface?.images) {
      // Handle both array and string formats
      const imagePath = Array.isArray(productInterface.images) ? productInterface.images[0] : productInterface.images;
      if (imagePath) {
        // If it's already a full URL, return it
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          return imagePath;
        }
        // Otherwise, build the URL
        return `${environment.uploadsURL}/${imagePath}`;
      }
    }
    return 'assets/default-product.svg'; // fallback image
  }

  // Helper method to get product slug
  getProductSlug(item: ICartItem): string {
    const productInterface = item.productID as ProductInterface;
    return productInterface?.slug || '';
  }
}