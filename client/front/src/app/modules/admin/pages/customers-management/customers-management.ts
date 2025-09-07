import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/userService/user.service';

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Component({
  selector: 'app-customers-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers-management.html',
  styleUrl: './customers-management.css'
})
export class CustomersManagement implements OnInit {
  customers: Customer[] = [];
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  
  // Filters
  selectedRole = 'all';
  selectedStatus = 'all';
  searchQuery = '';
  
  // Filter options
  roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'customer', label: 'Customers' },
    { value: 'admin', label: 'Admins' }
  ];

  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Customer statistics
  customerStats = {
    total: 0,
    active: 0,
    inactive: 0,
    customers: 0,
    admins: 0
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadCustomerStats();
  }

  loadCustomers(): void {
    this.loading = true;
    this.error = '';

    // Build query parameters
    let queryParams: any = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    if (this.selectedRole !== 'all') {
      queryParams.role = this.selectedRole;
    }

    if (this.selectedStatus === 'active') {
      queryParams.isActive = true;
    } else if (this.selectedStatus === 'inactive') {
      queryParams.isActive = false;
    }

    if (this.searchQuery) {
      queryParams.search = this.searchQuery;
    }

    this.userService.getAllUsers(queryParams).subscribe({
      next: (response: any) => {
        this.customers = response.data || response;
        if (response.pagination) {
          this.totalPages = response.pagination.pages;
          this.totalItems = response.pagination.total;
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load customers';
        this.loading = false;
        console.error('Error loading customers:', err);
      }
    });
  }

  loadCustomerStats(): void {
    this.userService.getUserStats().subscribe({
      next: (stats: any) => {
        this.customerStats = stats.data || this.customerStats;
      },
      error: (err: any) => {
        console.error('Error loading customer stats:', err);
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
    this.loadCustomers();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadCustomers();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadCustomers();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCustomers();
    }
  }

  toggleCustomerStatus(customerId: string): void {
    if (confirm('Are you sure you want to toggle this customer\'s status?')) {
      this.userService.toggleUserStatus(customerId).subscribe({
        next: (response: any) => {
          // Update the customer in the local array
          const customerIndex = this.customers.findIndex(customer => customer._id === customerId);
          if (customerIndex !== -1) {
            this.customers[customerIndex] = response.data;
          }
          this.loadCustomerStats();
        },
        error: (err: any) => {
          this.error = 'Failed to toggle customer status';
          console.error('Error toggling customer status:', err);
        }
      });
    }
  }

  deleteCustomer(customerId: string): void {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      this.userService.deleteUser(customerId).subscribe({
        next: () => {
          // Remove the customer from the local array
          this.customers = this.customers.filter(customer => customer._id !== customerId);
          this.loadCustomerStats();
        },
        error: (err: any) => {
          this.error = 'Failed to delete customer';
          console.error('Error deleting customer:', err);
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
