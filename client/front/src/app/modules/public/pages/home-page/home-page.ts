import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../../core/services/productService/product.service';
import { CategoryService } from '../../../../core/services/categoryService/category.service';
import { TestimonialService } from '../../../../core/services/testimonialService/testimonial.service';
import { ProductInterface } from '../../../../shared/models/product.interface';
import { CategoryInterface } from '../../../../shared/models/category.interface';
import { Itestmonials } from '../../../../shared/models/itestmonials';
import { environment } from '../../../../../envirmonets/environment';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage implements OnInit {
  // Data properties
  featuredProducts: ProductInterface[] = [];
  categories: CategoryInterface[] = [];
  testimonials: Itestmonials[] = [];
  
  // Loading states
  isLoadingProducts = true;
  isLoadingCategories = true;
  isLoadingTestimonials = true;
  
  // Error states
  hasError = false;
  errorMessage = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private testimonialService: TestimonialService
  ) {}

  ngOnInit(): void {
    console.log('HomePage component loaded successfully!');
    this.loadHomePageData();
  }

  private loadHomePageData(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
    // Temporarily disable testimonials until backend is implemented
    // this.loadTestimonials();
    this.isLoadingTestimonials = false; // Set to false so the UI doesn't show loading
  }

  private loadFeaturedProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products: ProductInterface[]) => {
        // Filter active products and take first 8 as featured
        this.featuredProducts = products
          .filter((product: ProductInterface) => this.productService.isProductAvailable(product))
          .slice(0, 8);
        this.isLoadingProducts = false;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.isLoadingProducts = false;
        this.handleError('Failed to load featured products');
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getActiveCategories().subscribe({
      next: (categories: CategoryInterface[]) => {
        this.categories = categories.slice(0, 6); // Take first 6 categories
        this.isLoadingCategories = false;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.isLoadingCategories = false;
        this.handleError('Failed to load categories');
      }
    });
  }

  private loadTestimonials(): void {
    this.testimonialService.getFeaturedTestimonials(3).subscribe({
      next: (testimonials: Itestmonials[]) => {
        this.testimonials = testimonials;
        this.isLoadingTestimonials = false;
      },
      error: (error: any) => {
        console.error('Error loading testimonials:', error);
        this.isLoadingTestimonials = false;
        this.handleError('Failed to load testimonials');
      }
    });
  }

  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
  }

  // Helper methods for template
  getProductImageUrl(product: ProductInterface): string {
    if (product.images) {
      // Handle both array and string formats
      const imagePath = Array.isArray(product.images) ? product.images[0] : product.images;
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

  getProductPriceRange(product: ProductInterface): { min: number; max: number } {
    return this.productService.getPriceRange(product);
  }

  isProductAvailable(product: ProductInterface): boolean {
    return this.productService.isProductAvailable(product);
  }

  getCategoryImageUrl(category: CategoryInterface): string {
    // You can implement category image logic here
    return `https://via.placeholder.com/300x300/e8e8e8/aaaaaa?text=${encodeURIComponent(category.name)}`;
  }

  getCategoryProductCount(category: CategoryInterface): number {
    // Use category name hash to generate consistent count
    if (!category.name) return 0;
    
    let hash = 0;
    for (let i = 0; i < category.name.length; i++) {
      const char = category.name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 50 + 10; // Consistent count between 10-59
  }

  getUserName(userID: any): string {
    if (typeof userID === 'object' && userID?.name) {
      return userID.name;
    }
    return 'Customer';
  }

  getProductCategoryNames(product: ProductInterface): string {
    if (!product.categoryID || !Array.isArray(product.categoryID)) {
      return 'Uncategorized';
    }
    
    // Check if categoryID is populated (array of objects) or just IDs (array of strings)
    const categoryNames = product.categoryID.map((category: any) => {
      if (typeof category === 'object' && category?.name) {
        return category.name;
      } else if (typeof category === 'string') {
        return category; // This would be the category ID, you might want to handle this differently
      }
      return 'Unknown';
    });
    
    return categoryNames.join(', ');
  }

  // Newsletter subscription
  onNewsletterSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    const email = emailInput.value;
    
    if (email) {
      // Implement newsletter subscription logic here
      console.log('Newsletter subscription for:', email);
      // You can add a service call here
      emailInput.value = '';
      alert('Thank you for subscribing to our newsletter!');
    }
  }

  // Retry loading data
  retryLoadData(): void {
    this.hasError = false;
    this.errorMessage = '';
    this.loadHomePageData();
  }
}
