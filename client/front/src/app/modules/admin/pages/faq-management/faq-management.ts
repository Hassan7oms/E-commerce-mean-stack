import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FAQService, FAQ, FAQResponse } from '../../../../core/services/faqService/faq.service';

@Component({
  selector: 'app-faq-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './faq-management.html',
  styleUrl: './faq-management.css'
})
export class FAQManagement implements OnInit {
  faqs: FAQ[] = [];
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
  editingFAQ: FAQ | null = null;
  faqForm: FormGroup;

  // FAQ statistics
  faqStats = {
    total: 0,
    active: 0,
    inactive: 0
  };

  constructor(
    private faqService: FAQService,
    private fb: FormBuilder
  ) {
    this.faqForm = this.fb.group({
      question: ['', [Validators.required, Validators.minLength(10)]],
      answer: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', [Validators.required]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadFAQs();
    this.loadFAQStats();
  }

  loadFAQs(): void {
    this.loading = true;
    this.error = '';

    const loadMethod = this.searchQuery ? 
      this.faqService.searchFAQs(this.searchQuery, this.currentPage, this.itemsPerPage) :
      this.faqService.getAllFAQs(this.currentPage, this.itemsPerPage);

    loadMethod.subscribe({
      next: (response: FAQResponse) => {
        this.faqs = response.data;
        this.totalPages = response.pagination.pages;
        this.totalItems = response.pagination.total;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load FAQs';
        this.loading = false;
        console.error('Error loading FAQs:', err);
      }
    });
  }

  loadFAQStats(): void {
    this.faqService.getFAQStats().subscribe({
      next: (stats: any) => {
        this.faqStats = stats.data || this.faqStats;
      },
      error: (err: any) => {
        console.error('Error loading FAQ stats:', err);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadFAQs();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadFAQs();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadFAQs();
    }
  }

  openCreateModal(): void {
    this.editingFAQ = null;
    this.faqForm.reset({
      question: '',
      answer: '',
      category: '',
      isActive: true
    });
    this.showModal = true;
  }

  openEditModal(faq: FAQ): void {
    this.editingFAQ = faq;
    this.faqForm.patchValue({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.isActive
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingFAQ = null;
    this.faqForm.reset();
  }

  onSubmit(): void {
    if (this.faqForm.valid) {
      const formData = this.faqForm.value;
      
      if (this.editingFAQ) {
        // Update existing FAQ
        this.faqService.updateFAQ(this.editingFAQ._id, formData).subscribe({
          next: (response: any) => {
            // Update the FAQ in the local array
            const faqIndex = this.faqs.findIndex(faq => faq._id === this.editingFAQ!._id);
            if (faqIndex !== -1) {
              this.faqs[faqIndex] = response.data;
            }
            this.closeModal();
            this.loadFAQStats();
          },
          error: (err: any) => {
            this.error = 'Failed to update FAQ';
            console.error('Error updating FAQ:', err);
          }
        });
      } else {
        // Create new FAQ
        this.faqService.createFAQ(formData).subscribe({
          next: (response: any) => {
            this.loadFAQs(); // Reload to get updated pagination
            this.closeModal();
            this.loadFAQStats();
          },
          error: (err: any) => {
            this.error = 'Failed to create FAQ';
            console.error('Error creating FAQ:', err);
          }
        });
      }
    }
  }

  toggleFAQStatus(faqId: string): void {
    this.faqService.toggleFAQStatus(faqId).subscribe({
      next: (response: any) => {
        // Update the FAQ in the local array
        const faqIndex = this.faqs.findIndex(faq => faq._id === faqId);
        if (faqIndex !== -1) {
          this.faqs[faqIndex] = response.data;
        }
        this.loadFAQStats();
      },
      error: (err: any) => {
        this.error = 'Failed to toggle FAQ status';
        console.error('Error toggling FAQ status:', err);
      }
    });
  }

  deleteFAQ(faqId: string): void {
    if (confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
      this.faqService.deleteFAQ(faqId).subscribe({
        next: () => {
          // Remove the FAQ from the local array
          this.faqs = this.faqs.filter(faq => faq._id !== faqId);
          this.loadFAQStats();
        },
        error: (err: any) => {
          this.error = 'Failed to delete FAQ';
          console.error('Error deleting FAQ:', err);
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
