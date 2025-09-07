import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../apiService/api.service';
import { HttpParams } from '@angular/common/http';

export interface ProductReview {
  _id: string;
  userID: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  productID: {
    _id: string;
    title: string;
    images: string[];
  };
  rating: number;
  comment: string;
  isApproved: boolean;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  data: ProductReview[];
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
export class ReviewService {

  constructor(private apiService: ApiService) {}

  // Get all reviews with pagination
  getAllReviews(page: number = 1, limit: number = 10, status?: string): Observable<ReviewResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status && status !== 'all') {
      if (status === 'approved') {
        params = params.set('isApproved', 'true');
      } else if (status === 'pending') {
        params = params.set('isApproved', 'false');
      }
    }

    return this.apiService.get<ReviewResponse>('/reviews', params);
  }

  // Get single review by ID
  getReviewById(reviewId: string): Observable<{ data: ProductReview }> {
    return this.apiService.get<{ data: ProductReview }>(`/reviews/${reviewId}`);
  }

  // Approve review
  approveReview(reviewId: string): Observable<{ data: ProductReview }> {
    return this.apiService.patch<{ data: ProductReview }>(`/reviews/${reviewId}/approve`, {});
  }

  // Reject review
  rejectReview(reviewId: string): Observable<{ data: ProductReview }> {
    return this.apiService.patch<{ data: ProductReview }>(`/reviews/${reviewId}/reject`, {});
  }

  // Soft delete review
  deleteReview(reviewId: string): Observable<{ message: string }> {
    return this.apiService.patch<{ message: string }>(`/reviews/${reviewId}/delete`, {});
  }

  // Toggle review active status
  toggleReviewStatus(reviewId: string): Observable<{ data: ProductReview }> {
    return this.apiService.patch<{ data: ProductReview }>(`/reviews/${reviewId}/toggle-status`, {});
  }

  // Get review statistics
  getReviewStats(): Observable<any> {
    return this.apiService.get<any>('/reviews/stats');
  }

  // Search reviews
  searchReviews(query: string, page: number = 1, limit: number = 10): Observable<ReviewResponse> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.apiService.get<ReviewResponse>('/reviews/search', params);
  }
}
