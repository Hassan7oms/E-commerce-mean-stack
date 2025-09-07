import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductInterface } from '../../../../shared/models/product.interface';
import { ProductService } from '../../../../core/services/productService/product.service';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-products-listing-page',
  imports: [CommonModule, ProductCard],
  templateUrl: './products-listing-page.html',
  styleUrl: './products-listing-page.css'
})
export class ProductsListingPage implements OnInit {
  products: ProductInterface[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.error = 'Could not load products. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
