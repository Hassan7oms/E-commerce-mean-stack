import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductInterface, IProductVariant } from '../../../../shared/models/product.interface';
import { ProductService } from '../../../../core/services/productService/product.service';
import { CartService } from '../../../../core/services/cartService/cart.service';
import { WishlistService } from '../../../../core/services/wishlistService/wishlist.service';
import { AuthService } from '../../../../core/services/authService/auth.service';

@Component({
  selector: 'app-products-page',
  imports: [CommonModule],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css'
})
export class ProductsPage implements OnInit {
  product: ProductInterface | null = null;
  isLoading = true;
  error: string | null = null;
  addingToCart = false;
  addingToWishlist = false;

  // State for variant selection
  uniqueColors: string[] = [];
  availableSizes: string[] = [];
  selectedColor: string | null = null;
  selectedSize: string | null = null;
  selectedVariant: IProductVariant | null = null;

  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: any) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      } else {
        // Handle case where slug is missing, maybe redirect
        this.error = "Product not found.";
        this.isLoading = false;
      }
    });
  }

  loadProduct(slug: string): void {
    this.isLoading = true;
    this.error = null;
    this.productService.getProductBySlug(slug).subscribe({
      next: (data: ProductInterface) => {
        this.product = data;
        this.initializeVariants();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = "Failed to load product details. Please try again.";
        this.isLoading = false;
      }
    });
  }

  initializeVariants(): void {
    if (!this.product || this.product.variant.length === 0) return;

    // Get a unique list of colors
    this.uniqueColors = [...new Set(this.product.variant.map(v => v.color).filter(Boolean) as string[])];
    
    // Auto-select the first color if it exists
    if (this.uniqueColors.length > 0) {
      this.selectColor(this.uniqueColors[0]);
    }
  }

  selectColor(color: string): void {
    this.selectedColor = color;

    // Find all available sizes for the selected color
    this.availableSizes = this.product!.variant
      .filter(v => v.color === color && v.size)
      .map(v => v.size as string);

    // Auto-select the first available size
    if (this.availableSizes.length > 0) {
      this.selectSize(this.availableSizes[0]);
    } else {
      // If no sizes for this color, clear size selection
      this.selectedSize = null;
      this.selectedVariant = null;
    }
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    // Find the exact variant that matches the selected color AND size
    this.selectedVariant = this.product!.variant.find(
      v => v.color === this.selectedColor && v.size === this.selectedSize
    ) || null;
    // Reset quantity when selection changes
    this.quantity = 1;
  }

  isSizeOutOfStock(size: string): boolean {
    const variant = this.product?.variant.find(v => v.color === this.selectedColor && v.size === size);
    return variant ? variant.QTyavailable <= 0 : true;
  }

  incrementQuantity(): void {
    const maxQty = this.selectedVariant?.QTyavailable || 1;
    if (this.quantity < maxQty) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    // Check if user is logged in
    if (!this.authService.isAuthenticated()) {
      if (confirm('You need to log in to add items to cart. Would you like to go to the login page?')) {
        this.router.navigate(['/login']);
      }
      return;
    }

    if (!this.selectedVariant || this.quantity <= 0) {
      alert("Please select a valid product option.");
      return;
    }

    if (!this.selectedVariant._id) {
      alert("Invalid product variant. Please try again.");
      return;
    }

    this.addingToCart = true;
    
    console.log(`Adding to cart: ${this.product?.title}, Variant: ${this.selectedVariant._id}, Quantity: ${this.quantity}`);
    
    this.cartService.addItem(this.product!._id, this.selectedVariant._id, this.quantity).subscribe({
      next: (cart) => {
        this.addingToCart = false;
        alert('Product added to cart successfully!');
        console.log('Updated cart:', cart);
      },
      error: (error) => {
        this.addingToCart = false;
        console.error('Error adding to cart:', error);
        
        if (error.status === 401) {
          alert('Your session has expired. Please log in again.');
          this.router.navigate(['/login']);
        } else if (error.status === 400) {
          alert(error.error?.message || 'Cannot add this quantity to cart. Please check availability.');
        } else {
          alert('Failed to add product to cart. Please try again.');
        }
      }
    });
  }

  addToWishlist(): void {
    // Check if user is logged in
    if (!this.authService.isAuthenticated()) {
      if (confirm('You need to log in to add items to wishlist. Would you like to go to the login page?')) {
        this.router.navigate(['/login']);
      }
      return;
    }

    if (!this.product) {
      alert("Product not found.");
      return;
    }

    this.addingToWishlist = true;
    
    console.log(`Adding to wishlist: ${this.product.title}`);
    
    this.wishlistService.addToWishlist(this.product._id).subscribe({
      next: (response) => {
        this.addingToWishlist = false;
        alert('Product added to wishlist successfully!');
        console.log('Added to wishlist:', response);
      },
      error: (error) => {
        this.addingToWishlist = false;
        console.error('Error adding to wishlist:', error);
        
        if (error.status === 401) {
          alert('Your session has expired. Please log in again.');
          this.router.navigate(['/login']);
        } else if (error.status === 400) {
          alert(error.error?.message || 'Product is already in your wishlist.');
        } else {
          alert('Failed to add product to wishlist. Please try again.');
        }
      }
    });
  }

  getProductImage(): string {
    if (!this.product?.images) {
      return 'assets/default-product.png';
    }

    // Backend now always returns images as array with full URLs
    if (Array.isArray(this.product.images) && this.product.images.length > 0) {
      return this.product.images[0];
    }

    // Fallback for string case (though backend should return array)
    if (typeof this.product.images === 'string' && this.product.images.trim() !== '') {
      return this.product.images;
    }

    return 'assets/default-product.png';
  }

  getCategoryName(category: any): string {
    if (typeof category === 'string') {
      return category;
    }
    return category?.name || 'Category';
  }
}
