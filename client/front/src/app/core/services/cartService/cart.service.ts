// src/app/core/services/cartService/cart.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from '../apiService/api.service';
import { CartInterface } from '../../../shared/models/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // BehaviorSubject to hold and stream the current cart state
  private cartSubject = new BehaviorSubject<CartInterface | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Fetches the user's cart from the backend and updates the stream.
   * This should be the primary method components call to get cart data.
   */
  getCart(): Observable<CartInterface> {
    return this.apiService.getWithAuth<CartInterface>('/cart/my-cart').pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  /**
   * Adds an item to the cart.
   * @param productId - The ID of the product.
   * @param variantId - The ID of the specific product variant.
   * @param quantity - The quantity to add.
   */
  addItem(productId: string, variantId: string, quantity: number): Observable<CartInterface> {
    return this.apiService.post<CartInterface>('/cart/add', { productId, variantId, quantity }, this.apiService.getAuthHeaders()).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  /**
   * Updates the quantity of a specific item in the cart.
   * @param itemId - The unique ID of the item within the cart.
   * @param quantity - The new quantity.
   */
  updateItemQuantity(itemId: string, quantity: number): Observable<CartInterface> {
    return this.apiService.patch<CartInterface>(`/cart/update/${itemId}`, { quantity }, this.apiService.getAuthHeaders()).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  /**
   * Removes an item completely from the cart.
   * @param itemId - The unique ID of the item within the cart.
   */
  removeItem(itemId: string): Observable<CartInterface> {
    return this.apiService.delete<CartInterface>(`/cart/remove/${itemId}`, this.apiService.getAuthHeaders()).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }
  
  /**
   * Confirms a price change for an item, telling the backend to update its price snapshot.
   * @param itemId - The unique ID of the item within the cart.
   */
  confirmPriceChange(itemId: string): Observable<CartInterface> {
    return this.apiService.patch<CartInterface>(`/cart/confirm-item/${itemId}`, {}, this.apiService.getAuthHeaders()).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  // Synchronous getter for the current cart value
  public get currentCartValue(): CartInterface | null {
    return this.cartSubject.value;
  }
}