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

  // Image handling properties
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  currentImageUrl: string | null = null;
  imageError: string = '';

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
    
    // Use product service to get product by ID
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.populateForm(product);
        // Set current image if exists
        if (product.images) {
          if (typeof product.images === 'string') {
            this.currentImageUrl = product.images;
          } else if (Array.isArray(product.images) && product.images.length > 0) {
            this.currentImageUrl = product.images[0];
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.errorMessage = 'Failed to load product. Please try again.';
        this.loading = false;
      }
    });
  }

  // Image handling methods
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.imageError = 'Please select a valid image file (JPG, PNG, GIF, WebP)';
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.imageError = 'Image size must be less than 5MB';
        return;
      }
      
      this.imageError = '';
      this.selectedImageFile = file;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedImage(event: Event): void {
    event.stopPropagation();
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.imageError = '';
  }

  removeCurrentImage(): void {
    this.currentImageUrl = null;
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

      // Prepare images array
      let images: File[] = [];
      if (this.selectedImageFile) {
        images = [this.selectedImageFile];
      }

      console.log('Product data:', productData);

      if (this.isEditMode && this.productId) {
        // Update product
        // Include current image URL if no new image is selected
        if (!this.selectedImageFile && this.currentImageUrl) {
          productData.images = [this.currentImageUrl];
        }
        
        this.productService.updateProduct(this.productId, productData, images).subscribe({
          next: (response) => {
            console.log('Product updated successfully:', response);
            this.submitting = false;
            this.router.navigate(['/admin/products']);
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.errorMessage = error.error?.message || 'Failed to update product. Please try again.';
            this.submitting = false;
          }
        });
      } else {
        // Create new product
        const createData = {
          ...productData,
          images: images
        };
        
        this.productService.createProduct(createData).subscribe({
          next: (response) => {
            console.log('Product created successfully:', response);
            this.submitting = false;
            this.router.navigate(['/admin/products']);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.errorMessage = error.error?.message || 'Failed to create product. Please try again.';
            this.submitting = false;
          }
        });
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
