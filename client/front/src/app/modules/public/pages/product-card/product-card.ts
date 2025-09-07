
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductInterface, IProductVariant } from '../../../../shared/models/product.interface';
import { ProtectedActionService } from '../../../../core/services/protectedActionService/protected-action.service';
import { CartService } from '../../../../core/services/cartService/cart.service';
import { WishlistService } from '../../../../core/services/wishlistService/wishlist.service';
import { environment } from '../../../../../envirmonets/environment';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input() product!: ProductInterface;
  @Input() showAddToCart = true;
  @Input() showAddToWishlist = true;
  @Output() addToCart = new EventEmitter<{productId: string, variantId: string, quantity: number}>();
  @Output() addToWishlist = new EventEmitter<string>();

  constructor(
    private protectedActionService: ProtectedActionService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  // Helper methods for template
  isProductAvailable(): boolean {
    return this.product?.isActive && !this.product?.isDeleted && 
           this.product?.variant?.some((variant: IProductVariant) => variant.QTyavailable > 0);
  }

  getProductImageUrl(): string {
    if (this.product?.images) {
      // Handle both array and string formats
      const imagePath = Array.isArray(this.product.images) ? this.product.images[0] : this.product.images;
      if (imagePath) {
        // If it's already a full URL, return it
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          return imagePath;
        }
        // Otherwise, build the URL
        return `${environment.uploadsURL}/${imagePath}`;
      }
    }
    return 'assets/default-product.svg';
  }

  getCategoryName(): string {
    if (this.product?.categoryID && Array.isArray(this.product.categoryID) && this.product.categoryID.length > 0) {
      const firstCategory = this.product.categoryID[0];
      return typeof firstCategory === 'string' ? firstCategory : firstCategory.name || 'Category';
    }
    return 'Category';
  }

  getPriceRange(): { min: number; max: number } {
    if (!this.product?.variant || this.product.variant.length === 0) {
      return { min: 0, max: 0 };
    }
    const prices = this.product.variant.map((variant: IProductVariant) => variant.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  getAvailableVariants(): IProductVariant[] {
    return this.product?.variant?.filter((variant: IProductVariant) => variant.QTyavailable > 0) || [];
  }

  hasDiscount(): boolean {
    const priceRange = this.getPriceRange();
    return priceRange.min !== priceRange.max;
  }

  getDiscountPercentage(): number {
    const priceRange = this.getPriceRange();
    if (priceRange.max === 0) return 0;
    return Math.round(((priceRange.max - priceRange.min) / priceRange.max) * 100);
  }

  onProtectedAddToCart(): void {
    if (this.product && this.isProductAvailable()) {
      const firstAvailableVariant = this.getAvailableVariants()[0];
      if (firstAvailableVariant._id) {
        this.protectedActionService.addToCart(this.product._id, firstAvailableVariant._id, 1, this.cartService);
        this.addToCart.emit({
          productId: this.product._id,
          variantId: firstAvailableVariant._id,
          quantity: 1
        });
      }
    }
  }

  onProtectedAddToWishlist(): void {
    if (this.product) {
      this.protectedActionService.addToWishlist(this.product._id, this.wishlistService);
      this.addToWishlist.emit(this.product._id);
    }
  }
}
