import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService, Category, CategoryResponse } from '../../../../core/services/categoryService/category.service';

@Component({
  selector: 'app-categories-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './categories-management.html',
  styleUrl: './categories-management.css'
})
export class CategoriesManagement implements OnInit {
  categories: Category[] = [];
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  
  // Filters
  searchQuery = '';
  
  // Modal state
  showModal = false;
  editingCategory: Category | null = null;
  categoryForm: FormGroup;

  // Category statistics
  categoryStats = {
    total: 0,
    active: 0,
    inactive: 0
  };

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadCategoryStats();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';

    const loadMethod = this.searchQuery ? 
      this.categoryService.searchCategories(this.searchQuery, this.currentPage, this.itemsPerPage) :
      this.categoryService.getAllCategories(this.currentPage, this.itemsPerPage);

    loadMethod.subscribe({
      next: (response: CategoryResponse) => {
        this.categories = response.data;
        this.totalPages = response.pagination.pages;
        this.totalItems = response.pagination.total;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load categories';
        this.loading = false;
        console.error('Error loading categories:', err);
      }
    });
  }

  loadCategoryStats(): void {
    this.categoryService.getCategoryStats().subscribe({
      next: (stats) => {
        this.categoryStats = stats.data || this.categoryStats;
      },
      error: (err) => {
        console.error('Error loading category stats:', err);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadCategories();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadCategories();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCategories();
    }
  }

  openCreateModal(): void {
    this.editingCategory = null;
    this.categoryForm.reset({
      name: '',
      description: '',
      isActive: true
    });
    this.showModal = true;
  }

  openEditModal(category: Category): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      isActive: category.isActive
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const formData = this.categoryForm.value;
      
      if (this.editingCategory) {
        // Update existing category
        this.categoryService.updateCategory(this.editingCategory._id, formData).subscribe({
          next: (response) => {
            // Update the category in the local array
            const categoryIndex = this.categories.findIndex(cat => cat._id === this.editingCategory!._id);
            if (categoryIndex !== -1) {
              this.categories[categoryIndex] = response.data;
            }
            this.closeModal();
            this.loadCategoryStats();
          },
          error: (err) => {
            this.error = 'Failed to update category';
            console.error('Error updating category:', err);
          }
        });
      } else {
        // Create new category
        this.categoryService.createCategory(formData).subscribe({
          next: (response) => {
            this.loadCategories(); // Reload to get updated pagination
            this.closeModal();
            this.loadCategoryStats();
          },
          error: (err) => {
            this.error = 'Failed to create category';
            console.error('Error creating category:', err);
          }
        });
      }
    }
  }

  toggleCategoryStatus(categoryId: string): void {
    this.categoryService.toggleCategoryStatus(categoryId).subscribe({
      next: (response) => {
        // Update the category in the local array
        const categoryIndex = this.categories.findIndex(cat => cat._id === categoryId);
        if (categoryIndex !== -1) {
          this.categories[categoryIndex] = response.data;
        }
        this.loadCategoryStats();
      },
      error: (err) => {
        this.error = 'Failed to toggle category status';
        console.error('Error toggling category status:', err);
      }
    });
  }

  deleteCategory(categoryId: string): void {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          // Remove the category from the local array
          this.categories = this.categories.filter(cat => cat._id !== categoryId);
          this.loadCategoryStats();
        },
        error: (err) => {
          this.error = 'Failed to delete category';
          console.error('Error deleting category:', err);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }
}
