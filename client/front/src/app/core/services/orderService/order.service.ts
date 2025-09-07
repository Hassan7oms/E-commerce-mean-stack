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
    quantity: number;
    title: string;
    price: number;
  }[];
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

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private apiService: ApiService) {}

  // Get all orders with pagination
  getAllOrders(page: number = 1, limit: number = 10, status?: string): Observable<OrderResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status && status !== 'all') {
      params = params.set('status', status);
    }

    return this.apiService.get<OrderResponse>('/orders', params);
  }

  // Get single order by ID
  getOrderById(orderId: string): Observable<{ data: Order }> {
    return this.apiService.get<{ data: Order }>(`/orders/${orderId}`);
  }

  // Update order status
  updateOrderStatus(orderId: string, status: string): Observable<{ data: Order }> {
    return this.apiService.patch<{ data: Order }>(`/orders/${orderId}`, { status });
  }

  // Get order statistics
  getOrderStats(): Observable<any> {
    return this.apiService.get<any>('/orders/stats');
  }

  // Search orders
  searchOrders(query: string, page: number = 1, limit: number = 10): Observable<OrderResponse> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.apiService.get<OrderResponse>('/orders/search', params);
  }
}
