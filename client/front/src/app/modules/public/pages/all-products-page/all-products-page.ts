import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';

import { ProductInterface } from '../../../../shared/models/product.interface';
import { CategoryInterface } from '../../../../shared/models/category.interface';
import { ProductService } from '../../../../core/services/productService/product.service';
import { CategoryService } from '../../../../core/services/categoryService/category.service';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-all-products-page',
  imports: [CommonModule, ProductCard, ReactiveFormsModule],
  templateUrl: './all-products-page.html',
  styleUrl: './all-products-page.css'
})
export class AllProductsPage implements OnInit {
  allProducts: ProductInterface[] = [];
  filteredProducts: ProductInterface[] = [];
  categories: CategoryInterface[] = [];

  isLoading = true;
  error: string | null = null;

  filterForm: FormGroup;
  
  // Sorting options
  sortOptions = [
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' }
  ];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      category: ['all'],
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

    // Use forkJoin to fetch products and categories in parallel
    forkJoin({
      products: this.productService.getProducts(),
      categories: this.categoryService.getActiveCategories()
    }).subscribe({
      next: ({ products, categories }) => {
        // Show all active products
        this.allProducts = products.filter(product => 
          product.isActive && !product.isDeleted
        );
        
        this.filteredProducts = this.allProducts;
        this.categories = categories;
        
        // Apply initial sorting
        this.applySorting();
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Could not load page data. Please try again later.';
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
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      products = products.filter(p =>
        (p.categoryID as any[]).some(cat => (cat._id || cat) === filters.category)
      );
    }

    // Price range filter
    if (filters.priceMin || filters.priceMax) {
      products = products.filter(p => {
        const prices = p.variant.map(v => v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        return (
          (!filters.priceMin || maxPrice >= filters.priceMin) &&
          (!filters.priceMax || minPrice <= filters.priceMax)
        );
      });
    }

    this.filteredProducts = products;
    this.applySorting();
  }

  applySorting(): void {
    const sortBy = this.filterForm.get('sortBy')?.value;
    
    switch (sortBy) {
      case 'name-asc':
        this.filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        this.filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'price-asc':
        this.filteredProducts.sort((a, b) => {
          const aMin = Math.min(...a.variant.map(v => v.price));
          const bMin = Math.min(...b.variant.map(v => v.price));
          return aMin - bMin;
        });
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => {
          const aMax = Math.max(...a.variant.map(v => v.price));
          const bMax = Math.max(...b.variant.map(v => v.price));
          return bMax - aMax;
        });
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      category: 'all',
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
