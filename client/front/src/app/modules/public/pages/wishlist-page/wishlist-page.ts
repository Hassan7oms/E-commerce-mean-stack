import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductInterface } from '../../../../shared/models/product.interface';
import { WishlistInterface } from '../../../../shared/models/wishlist.interface';
import { ProductService } from '../../../../core/services/productService/product.service';
import { WishlistService } from '../../../../core/services/wishlistService/wishlist.service';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-wishlist-page',
  imports: [CommonModule, ProductCard],
  templateUrl: './wishlist-page.html',
  styleUrl: './wishlist-page.css'
})
export class WishlistPage implements OnInit {
  wishlistItems: WishlistInterface[] = [];
  products: ProductInterface[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private wishlistService: WishlistService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.error = null;

    this.wishlistService.getWishlist().subscribe({
      next: (items: WishlistInterface[]) => {
        this.wishlistItems = items;
        this.loadProducts();
      },
      error: (error: any) => {
        this.error = 'Failed to load wishlist. Please try again.';
        this.isLoading = false;
        console.error('Wishlist load error:', error);
      }
    });
  }

  loadProducts(): void {
    if (this.wishlistItems.length === 0) {
      this.isLoading = false;
      return;
    }

    // Collect product IDs from all wishlist items
    const productIds: string[] = [];
    this.wishlistItems.forEach(wishlist => {
      wishlist.items.forEach(wishlistItem => {
        if (wishlistItem.productID && typeof wishlistItem.productID === 'object' && wishlistItem.productID._id) {
          productIds.push(wishlistItem.productID._id);
        }
      });
    });
    this.productService.getProducts().subscribe({
      next: (allProducts: ProductInterface[]) => {
        this.products = allProducts.filter(product => 
          productIds.includes(product._id)
        );
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load product details.';
        this.isLoading = false;
        console.error('Products load error:', error);
      }
    });
  }

  removeFromWishlist(productId: string): void {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        // Remove the product from all wishlist items
        this.wishlistItems = this.wishlistItems.map(wishlist => ({
          ...wishlist,
          items: wishlist.items.filter(wishlistItem => {
            if (wishlistItem.productID && typeof wishlistItem.productID === 'object' && wishlistItem.productID._id) {
              return wishlistItem.productID._id !== productId;
            }
            return true;
          })
        })).filter(wishlist => wishlist.items.length > 0);
        this.products = this.products.filter(product => product._id !== productId);
      },
      error: (error: any) => {
        console.error('Remove from wishlist error:', error);
      }
    });
  }

  

  onAddToCart(event: {productId: string, variantId: string, quantity: number}): void {
    console.log('Add to cart from wishlist:', event);
    // Implement cart functionality here
  }

  onAddToWishlist(productId: string): void {
    // This shouldn't happen in wishlist page, but handle gracefully
    console.log('Already in wishlist:', productId);
  }

  getWishlistCount(): number {
    return this.wishlistItems.length;
  }
}
