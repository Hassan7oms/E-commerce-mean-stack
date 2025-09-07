import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order, OrderResponse } from '../../../../core/services/orderService/order.service';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-management.html',
  styleUrl: './order-management.css'
})
export class OrderManagement implements OnInit {
  orders: Order[] = [];
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
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Order statistics
  orderStats = {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadOrderStats();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';

    const loadMethod = this.searchQuery ? 
      this.orderService.searchOrders(this.searchQuery, this.currentPage, this.itemsPerPage) :
      this.orderService.getAllOrders(this.currentPage, this.itemsPerPage, this.selectedStatus);

    loadMethod.subscribe({
      next: (response: OrderResponse) => {
        this.orders = response.data;
        this.totalPages = response.pagination.pages;
        this.totalItems = response.pagination.total;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load orders';
        this.loading = false;
        console.error('Error loading orders:', err);
      }
    });
  }

  loadOrderStats(): void {
    this.orderService.getOrderStats().subscribe({
      next: (stats) => {
        this.orderStats = stats.data || this.orderStats;
      },
      error: (err) => {
        console.error('Error loading order stats:', err);
      }
    });
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadOrders();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  updateOrderStatus(orderId: string, newStatus: string): void {
    if (confirm(`Are you sure you want to change this order status to ${newStatus}?`)) {
      this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
        next: (response) => {
          // Update the order in the local array
          const orderIndex = this.orders.findIndex(order => order._id === orderId);
          if (orderIndex !== -1) {
            this.orders[orderIndex] = response.data;
          }
          // Reload stats
          this.loadOrderStats();
        },
        error: (err) => {
          this.error = 'Failed to update order status';
          console.error('Error updating order status:', err);
        }
      });
    }
  }

  onStatusChange(orderId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.updateOrderStatus(orderId, target.value);
    }
  }

  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  calculateOrderTotal(order: Order): number {
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
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
}
