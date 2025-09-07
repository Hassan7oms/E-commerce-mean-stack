import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartInterface } from '../../../../shared/models/cart.interface';
import { CartService } from '../../../../core/services/cartService/cart.service';

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
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      area: ['', [Validators.required]],
      building: ['', [Validators.required]],
      apartment: ['', [Validators.required]],
      paymentMethod: ['cod', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (cartData) => {
        this.cart = cartData;
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

      const orderData = {
        shippingAddress: {
          street: this.checkoutForm.value.street,
          city: this.checkoutForm.value.city,
          area: this.checkoutForm.value.area,
          building: this.checkoutForm.value.building,
          apartment: this.checkoutForm.value.apartment
        },
        paymentMethod: this.checkoutForm.value.paymentMethod,
        cartId: this.cart._id
      };

      // TODO: Implement order creation service call
      console.log('Order data:', orderData);
      
      // Simulate order creation
      setTimeout(() => {
        this.isLoading = false;
        // Navigate to order success page or show success message
        this.router.navigate(['/order-success']);
      }, 2000);
      
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
