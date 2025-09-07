import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, ProductReview, ReviewResponse } from '../../../../core/services/reviewService/review.service';

@Component({
  selector: 'app-reviews-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews-management.html',
  styleUrl: './reviews-management.css'
})
export class ReviewsManagement implements OnInit {
  reviews: ProductReview[] = [];
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  
  // Filters
  selectedStatus = 'all';
  searchQuery = '';
  
  // Status options
  statusOptions = [
    { value: 'all', label: 'All Reviews' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' }
  ];

  // Review statistics
  reviewStats = {
    total: 0,
    pending: 0,
    approved: 0,
    averageRating: 0
  };

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
    this.loadReviewStats();
  }

  loadReviews(): void {
    this.loading = true;
    this.error = '';

    const loadMethod = this.searchQuery ? 
      this.reviewService.searchReviews(this.searchQuery, this.currentPage, this.itemsPerPage) :
      this.reviewService.getAllReviews(this.currentPage, this.itemsPerPage, this.selectedStatus);

    loadMethod.subscribe({
      next: (response: ReviewResponse) => {
        this.reviews = response.data;
        this.totalPages = response.pagination.pages;
        this.totalItems = response.pagination.total;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reviews';
        this.loading = false;
        console.error('Error loading reviews:', err);
      }
    });
  }

  loadReviewStats(): void {
    this.reviewService.getReviewStats().subscribe({
      next: (stats) => {
        this.reviewStats = stats.data || this.reviewStats;
      },
      error: (err) => {
        console.error('Error loading review stats:', err);
      }
    });
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadReviews();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadReviews();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadReviews();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReviews();
    }
  }

  approveReview(reviewId: string): void {
    if (confirm('Are you sure you want to approve this review?')) {
      this.reviewService.approveReview(reviewId).subscribe({
        next: (response) => {
          // Update the review in the local array
          const reviewIndex = this.reviews.findIndex(review => review._id === reviewId);
          if (reviewIndex !== -1) {
            this.reviews[reviewIndex] = response.data;
          }
          // Reload stats
          this.loadReviewStats();
        },
        error: (err) => {
          this.error = 'Failed to approve review';
          console.error('Error approving review:', err);
        }
      });
    }
  }

  rejectReview(reviewId: string): void {
    if (confirm('Are you sure you want to reject this review?')) {
      this.reviewService.rejectReview(reviewId).subscribe({
        next: (response) => {
          // Update the review in the local array
          const reviewIndex = this.reviews.findIndex(review => review._id === reviewId);
          if (reviewIndex !== -1) {
            this.reviews[reviewIndex] = response.data;
          }
          // Reload stats
          this.loadReviewStats();
        },
        error: (err) => {
          this.error = 'Failed to reject review';
          console.error('Error rejecting review:', err);
        }
      });
    }
  }

  deleteReview(reviewId: string): void {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      this.reviewService.deleteReview(reviewId).subscribe({
        next: () => {
          // Remove the review from the local array
          this.reviews = this.reviews.filter(review => review._id !== reviewId);
          // Reload stats
          this.loadReviewStats();
        },
        error: (err) => {
          this.error = 'Failed to delete review';
          console.error('Error deleting review:', err);
        }
      });
    }
  }

  toggleReviewStatus(reviewId: string): void {
    this.reviewService.toggleReviewStatus(reviewId).subscribe({
      next: (response) => {
        // Update the review in the local array
        const reviewIndex = this.reviews.findIndex(review => review._id === reviewId);
        if (reviewIndex !== -1) {
          this.reviews[reviewIndex] = response.data;
        }
      },
      error: (err) => {
        this.error = 'Failed to toggle review status';
        console.error('Error toggling review status:', err);
      }
    });
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
