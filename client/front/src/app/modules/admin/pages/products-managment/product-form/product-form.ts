import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../../../core/services/productService/product.service';
import { ProductInterface } from '../../../../../shared/models/product.interface';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  loading = false;
  submitting = false;
  errorMessage = '';

  categories = [
    { _id: '1', name: 'Men' },
    { _id: '2', name: 'Women' }
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      categoryID: ['', [Validators.required]],
      attributes: this.fb.group({
        material: [''],
        care: [''],
        origin: ['']
      }),
      variant: this.fb.array([this.createVariant()])
    });
  }

  createVariant(): FormGroup {
    return this.fb.group({
      size: ['', [Validators.required]],
      color: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      QTyavailable: [0, [Validators.required, Validators.min(0)]],
      reorderPoint: [5, [Validators.required, Validators.min(0)]]
    });
  }

  get variants() {
    return this.productForm.get('variant') as FormArray;
  }

  addVariant() {
    this.variants.push(this.createVariant());
  }

  removeVariant(index: number) {
    if (this.variants.length > 1) {
      this.variants.removeAt(index);
    }
  }

  generateSlug() {
    const title = this.productForm.get('title')?.value;
    if (title) {
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      this.productForm.patchValue({ slug });
    }
  }

  loadProduct(id: string) {
    this.loading = true;
    // For now, we'll simulate loading - in real implementation use productService.getProductById(id)
    setTimeout(() => {
      // Simulate loaded product data
      const mockProduct = {
        title: 'Sample Product',
        slug: 'sample-product',
        description: 'This is a sample product description',
        categoryID: ['1'],
        attributes: {
          material: 'Cotton',
          care: 'Machine wash',
          origin: 'Egypt'
        },
        variant: [
          { size: 'M', color: 'Blue', price: 299, QTyavailable: 10, reorderPoint: 5 },
          { size: 'L', color: 'Red', price: 299, QTyavailable: 15, reorderPoint: 5 }
        ]
      };
      
      this.populateForm(mockProduct);
      this.loading = false;
    }, 1000);
  }

  populateForm(product: any) {
    // Clear existing variants
    while (this.variants.length !== 0) {
      this.variants.removeAt(0);
    }

    // Add variants from product
    product.variant.forEach((variant: any) => {
      this.variants.push(this.fb.group(variant));
    });

    // Patch the form
    this.productForm.patchValue({
      title: product.title,
      slug: product.slug,
      description: product.description,
      categoryID: product.categoryID[0], // Assuming single category for simplicity
      attributes: product.attributes
    });
  }

  onSubmit() {
    if (this.productForm.valid && !this.submitting) {
      this.submitting = true;
      this.errorMessage = '';

      const formData = this.productForm.value;
      
      // Prepare the data for API
      const productData = {
        ...formData,
        categoryID: [formData.categoryID] // Convert to array
      };

      console.log('Product data:', productData);

      if (this.isEditMode) {
        // Update product
        setTimeout(() => {
          console.log('Product updated successfully');
          this.submitting = false;
          this.router.navigate(['/admin/products']);
        }, 1000);
      } else {
        // Create new product
        setTimeout(() => {
          console.log('Product created successfully');
          this.submitting = false;
          this.router.navigate(['/admin/products']);
        }, 1000);
      }
    } else {
      this.markFormGroupTouched(this.productForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/products']);
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isVariantFieldInvalid(variantIndex: number, fieldName: string): boolean {
    const field = this.variants.at(variantIndex).get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be greater than ${field.errors['min'].min}`;
    }
    return '';
  }
}
