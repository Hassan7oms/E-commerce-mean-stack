// src/app/pages/women/women-page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';

import { ProductInterface } from '../../../../shared/models/product.interface';
import { CategoryInterface } from '../../../../shared/models/category.interface'; 
import { ProductService } from '../../../../core/services/productService/product.service'; 
import { CategoryService } from '../../../../core/services/categoryService/category.service';
import { ProductCard as ProductCardComponent } from '../product-card/product-card';

@Component({
  selector: 'app-women-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProductCardComponent
  ],
  templateUrl: './women-page.html',
  styleUrl: './women-page.css'
})
export class WomenPage implements OnInit {
  allProducts: ProductInterface[] = [];
  filteredProducts: ProductInterface[] = [];
  categories: CategoryInterface[] = [];

  isLoading = true;
  error: string | null = null;

  filterForm: FormGroup;
  sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' }
  ];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      subcategory: ['all'],
      priceMin: [0],
      priceMax: [5000],
      sortBy: ['name-asc']
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFilterListeners();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      products: this.productService.getProducts(),
      categories: this.categoryService.getActiveCategories()
    }).subscribe({
      next: ({ products, categories }) => {
        // Filter for women's products based on category
        this.allProducts = products.filter(product => {
          if (Array.isArray(product.categoryID)) {
            return product.categoryID.some((cat: any) => {
              const categoryName = typeof cat === 'string' ? cat : cat.name || '';
              return categoryName.toLowerCase().includes('women') || categoryName.toLowerCase().includes('woman');
            });
          }
          return false;
        });
        
        this.filteredProducts = [...this.allProducts];
        
        // Filter categories to show only women's related categories
        this.categories = categories.filter(cat => 
          cat.name.toLowerCase().includes('women') || 
          cat.name.toLowerCase().includes('woman') ||
          cat.parentID
        );
        
        this.applySorting();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Could not load women\'s products. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  setupFilterListeners(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(filters => {
      this.applyFilters(filters);
    });
  }

  applyFilters(filters: any): void {
    let products = [...this.allProducts];

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      products = products.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.subcategory && filters.subcategory !== 'all') {
      products = products.filter(product => {
        if (Array.isArray(product.categoryID)) {
          return product.categoryID.some((cat: any) => 
            (typeof cat === 'string' ? cat : cat._id) === filters.subcategory
          );
        }
        return false;
      });
    }

    // Price range filter
    const minPrice = filters.priceMin || 0;
    const maxPrice = filters.priceMax || 5000;
    products = products.filter(product => {
      if (product.variant && product.variant.length > 0) {
        return product.variant.some(variant => 
          variant.price >= minPrice && variant.price <= maxPrice
        );
      }
      return false;
    });

    this.filteredProducts = products;
    this.applySorting();
  }

  applySorting(): void {
    const sortBy = this.filterForm.get('sortBy')?.value;
    if (!sortBy || this.filteredProducts.length === 0) return;

    this.filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'price-asc':
          return this.getMinPrice(a) - this.getMinPrice(b);
        case 'price-desc':
          return this.getMinPrice(b) - this.getMinPrice(a);
        case 'newest':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        case 'oldest':
          return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
        default:
          return 0;
      }
    });
  }

  private getMinPrice(product: ProductInterface): number {
    if (!product.variant || product.variant.length === 0) return 0;
    return Math.min(...product.variant.map(v => v.price));
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      subcategory: 'all',
      priceMin: 0,
      priceMax: 5000,
      sortBy: 'name-asc'
    });
  }

  getProductCount(): number {
    return this.filteredProducts.length;
  }

  getTotalProductCount(): number {
    return this.allProducts.length;
  }

  trackByProductId(index: number, product: ProductInterface): string {
    return product._id;
  }
}