import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../apiService/api.service';
import { HttpParams } from '@angular/common/http';

export interface Order {
  _id: string;
  userID: string;
  ordernumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    productID: string;
    variantID: string;
    quantity: number;
    title: string;
    price: number;
    variantDetails: {
      size?: string;
      color?: string;
      material?: string;
      style?: string;
    };
  }[];
  shippingAddress: {
    street: string;
    city: string;
    area: string;
    building: string;
    apartment: string;
  };
  paymentMethod: 'cod' | 'credit_card' | 'paypal';
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateOrderRequest {
  shippingAddress: {
    street: string;
    city: string;
    area: string;
    building: string;
    apartment: string;
  };
  paymentMethod: 'cod' | 'credit_card' | 'paypal';
  cartId?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private apiService: ApiService) {}

  // Create new order
  placeOrder(orderData: CreateOrderRequest): Observable<{ success: boolean; message: string; data: Order }> {
    return this.apiService.post<{ success: boolean; message: string; data: Order }>('/orders', orderData);
  }

  // Get user's orders
  getUserOrders(page: number = 1, limit: number = 10, status?: string): Observable<OrderResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status && status !== 'all') {
      params = params.set('status', status);
    }

    return this.apiService.get<OrderResponse>('/orders/my-orders', params);
  }

  // Get all orders with pagination (admin)
  getAllOrders(page: number = 1, limit: number = 10, status?: string): Observable<OrderResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status && status !== 'all') {
      params = params.set('status', status);
    }

    return this.apiService.get<OrderResponse>('/orders/admin/all', params);
  }

  // Get single order by ID
  getOrderById(orderId: string): Observable<{ success: boolean; data: Order }> {
    return this.apiService.get<{ success: boolean; data: Order }>(`/orders/${orderId}`);
  }

  // Cancel order
  cancelOrder(orderId: string): Observable<{ success: boolean; message: string; data: Order }> {
    return this.apiService.patch<{ success: boolean; message: string; data: Order }>(`/orders/${orderId}/cancel`, {});
  }

  // Update order status (admin)
  updateOrderStatus(orderId: string, status: string): Observable<{ success: boolean; message: string; data: Order }> {
    return this.apiService.patch<{ success: boolean; message: string; data: Order }>(`/orders/${orderId}/status`, { status });
  }

  // Get order statistics (admin)
  getOrderStats(): Observable<any> {
    return this.apiService.get<any>('/orders/admin/stats');
  }

  // Search orders (admin)
  searchOrders(query: string, page: number = 1, limit: number = 10): Observable<OrderResponse> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.apiService.get<OrderResponse>('/orders/admin/all', params);
  }
}
