import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartInterface } from '../../../../shared/models/cart.interface';
import { CartService } from '../../../../core/services/cartService/cart.service';
import { OrderService, CreateOrderRequest } from '../../../../core/services/orderService/order.service';

@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css'
})
export class CheckoutPage implements OnInit {
  cart: CartInterface | null = null;
  checkoutForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      area: ['', [Validators.required]],
      building: ['', [Validators.required]],
      apartment: ['', [Validators.required]],
      paymentMethod: ['cod', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (cartData) => {
        this.cart = cartData;
        if (!this.cart || this.cart.items.length === 0) {
          this.router.navigate(['/cart']);
        }
      },
      error: (err) => {
        this.errorMessage = "Could not load your cart. Please try again.";
        console.error('Cart load error:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.checkoutForm.valid && this.cart) {
      this.isLoading = true;
      this.errorMessage = '';

      const orderData: CreateOrderRequest = {
        shippingAddress: {
          street: this.checkoutForm.value.street,
          city: this.checkoutForm.value.city,
          area: this.checkoutForm.value.area,
          building: this.checkoutForm.value.building,
          apartment: this.checkoutForm.value.apartment
        },
        paymentMethod: this.checkoutForm.value.paymentMethod,
        cartId: this.cart._id,
        notes: this.checkoutForm.value.notes || ''
      };

      this.orderService.placeOrder(orderData).subscribe({
        next: (response) => {
          console.log('Order placed successfully:', response);
          // Navigate to order success page or orders page
          this.router.navigate(['/orders'], {
            queryParams: { success: 'true', orderId: response.data._id }
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error placing order:', error);
          
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Failed to place order. Please try again.';
          }
        }
      });
      
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      control?.markAsTouched();
    });
  }

  // Form getter for template
  get f() { 
    return this.checkoutForm.controls; 
  }
}
