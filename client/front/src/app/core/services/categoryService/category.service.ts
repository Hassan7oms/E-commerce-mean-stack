import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../apiService/api.service';
import { CategoryInterface } from '../../../shared/models/category.interface';
import { HttpParams } from '@angular/common/http';

export interface Category {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  data: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private apiService: ApiService) {}

  // Get all categories
  getAllCategories(): Observable<CategoryInterface[]>;
  getAllCategories(page: number, limit: number): Observable<CategoryResponse>;
  getAllCategories(page?: number, limit?: number): Observable<CategoryInterface[] | CategoryResponse> {
    if (page !== undefined && limit !== undefined) {
      const params = new HttpParams()
        .set('page', page.toString())
        .set('limit', limit.toString());
      return this.apiService.get<CategoryResponse>('/category', params);
    }
    return this.apiService.get<CategoryInterface[]>('/category/allCategories');
  }

  // Get active categories only
  getActiveCategories(): Observable<CategoryInterface[]> {
    return this.apiService.get<CategoryInterface[]>('/category/allCategories');
  }

  // Get categories by parent ID (for subcategories)
  getCategoriesByParent(parentId: string): Observable<CategoryInterface[]> {
    return this.apiService.get<CategoryInterface[]>('/category/allCategories');
  }

  // Get main categories (no parent)
  getMainCategories(): Observable<CategoryInterface[]> {
    return this.apiService.get<CategoryInterface[]>('/category/allCategories');
  }

  // Create new category
  createCategory(categoryData: any): Observable<{ data: Category }> {
    return this.apiService.post<{ data: Category }>('/category', categoryData);
  }

  // Update category
  updateCategory(categoryId: string, categoryData: any): Observable<{ data: Category }> {
    return this.apiService.put<{ data: Category }>(`/category/${categoryId}`, categoryData);
  }

  // Delete category
  deleteCategory(categoryId: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`/category/${categoryId}`);
  }

  // Toggle category status
  toggleCategoryStatus(categoryId: string): Observable<{ data: Category }> {
    return this.apiService.patch<{ data: Category }>(`/category/${categoryId}/toggle-status`, {});
  }

  // Search categories
  searchCategories(query: string, page: number = 1, limit: number = 10): Observable<CategoryResponse> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.apiService.get<CategoryResponse>('/category/search', params);
  }

  // Get category statistics
  getCategoryStats(): Observable<any> {
    return this.apiService.get<any>('/category/stats');
  }

  // Helper method to filter active categories
  filterActiveCategories(categories: CategoryInterface[]): CategoryInterface[] {
    return categories.filter(category => category.isActive && !category.isDeleted);
  }

  // Helper method to get categories with product counts
  getCategoriesWithCounts(): Observable<any[]> {
    return this.apiService.get<any[]>('/category/allCategories');
  }
}
