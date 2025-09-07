import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../../core/services/orderService/order.service';
import { ProductInterface } from '../../../../shared/models/product.interface';
import { environment } from '../../../../../envirmonets/environment';

@Component({
  selector: 'app-orders-page',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css'
})
export class OrdersPage implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;
  currentPage = 1;
  totalPages = 1;
  selectedStatus = 'all';

  statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for success message from checkout
    this.route.queryParams.subscribe(params => {
      if (params['success'] === 'true') {
        this.successMessage = 'Your order has been placed successfully!';
        // Clear the success parameter from URL
        window.history.replaceState({}, '', '/orders');
      }
    });

    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;

    this.orderService.getUserOrders(this.currentPage, 10, this.selectedStatus).subscribe({
      next: (response) => {
        this.orders = response.data;
        this.totalPages = response.pagination.pages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.error = 'Failed to load orders. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadOrders();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: (response) => {
          this.successMessage = 'Order cancelled successfully.';
          this.loadOrders(); // Reload orders
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          this.error = error.error?.message || 'Failed to cancel order.';
        }
      });
    }
  }

  getOrderStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return `${price} EGP`;
  }

  getItemImageUrl(item: any): string {
    if (item.productID && typeof item.productID === 'object' && item.productID.images) {
      const product = item.productID as ProductInterface;
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

  getProductSlug(item: any): string {
    if (item.productID && typeof item.productID === 'object' && item.productID.slug) {
      return item.productID.slug;
    }
    return '#';
  }

  canCancelOrder(order: Order): boolean {
    return order.status === 'pending';
  }

  dismissMessage(): void {
    this.successMessage = null;
    this.error = null;
  }
}
