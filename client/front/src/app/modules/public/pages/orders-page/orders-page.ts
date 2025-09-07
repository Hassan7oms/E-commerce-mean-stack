import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderInterface, IOrderItem } from '../../../../shared/models/order.interface';
import { environment } from '../../../../../envirmonets/environment';

@Component({
  selector: 'app-orders-page',
  imports: [CommonModule],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css'
})
export class OrdersPage implements OnInit {
  orders: OrderInterface[] = [];
  isLoading = true;
  error: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    // Simulate loading orders
    setTimeout(() => {
      this.orders = [];
      this.isLoading = false;
    }, 1000);
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
    return new Date(dateString).toLocaleDateString();
  }

  formatPrice(price: number): string {
    return `${price} EGP`;
  }

  getItemImageUrl(item: IOrderItem): string {
    // Since we don't have image info in order items, use a placeholder
    return 'assets/default-product.png';
  }

  calculateOrderTotal(order: OrderInterface): number {
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}
