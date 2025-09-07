import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  Math = Math; // Add this to access Math in template

  stats = {
    revenue: { value: 452890, change: 12.5, currency: 'EGP' },
    orders: { value: 2456, change: -2.3 },
    customers: { value: 18923, change: 8.1 },
    products: { value: 847, change: 3.2 }
  };

  recentOrders = [
    {
      id: '#2456',
      customer: 'Sarah Ahmed',
      product: 'Elegant Casual Shirt',
      amount: 549,
      status: 'pending',
      date: '2024-12-15'
    },
    {
      id: '#2455',
      customer: 'Mohamed Hassan',
      product: 'Classic Cotton T-Shirt',
      amount: 599,
      status: 'preparing',
      date: '2024-12-14'
    },
    {
      id: '#2454',
      customer: 'Fatma Ali',
      product: 'Silk Blouse',
      amount: 699,
      status: 'shipped',
      date: '2024-12-14'
    }
  ];

  recentActivity = [
    {
      type: 'order',
      title: 'New order received',
      description: 'Order #2456 from Sarah Ahmed',
      time: '2 minutes ago'
    },
    {
      type: 'user',
      title: 'New customer registered',
      description: 'Mohamed Hassan joined NileStyle',
      time: '1 hour ago'
    },
    {
      type: 'product',
      title: 'Product updated',
      description: 'Elegant Casual Shirt stock updated',
      time: '3 hours ago'
    }
  ];

  ngOnInit() {
    // Load dashboard data
  }

  getStatusClass(status: string): string {
    return `badge ${status}`;
  }

  getActivityIcon(type: string): string {
    const icons = {
      order: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
      user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
      product: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'
    };
    return icons[type as keyof typeof icons] || '';
  }
}
