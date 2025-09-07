import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ProductService } from '../../../../core/services/productService/product.service';
import { CategoryService } from '../../../../core/services/categoryService/category.service';
import { ProductInterface, IProductVariant, IProductAttributes } from '../../../../shared/models/product.interface';
import { CategoryInterface } from '../../../../shared/models/category.interface';
import { environment } from '../../../../../envirmonets/environment';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class AdminProducts implements OnInit {
  products: ProductInterface[] = [];
  filteredProducts: ProductInterface[] = [];
  categories: CategoryInterface[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;

  // Modal states
  showAddModal = false;
  showEditModal = false;
  editingProduct: ProductInterface | null = null;

  // Image upload properties
  selectedFiles: any[] = [];
  isDragOver = false;
  removedExistingImages: string[] = [];

  // Forms
  productForm: FormGroup;
  editForm: FormGroup;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.createProductForm();
    this.editForm = this.createProductForm();
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  createProductForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      categoryID: [[], [Validators.required]],
      material: ['', [Validators.required]],
      origin: ['', [Validators.required]],
      variants: this.fb.array([this.createVariantFormGroup()]),
      images: [null]
    });
  }

  createVariantFormGroup(): FormGroup {
    return this.fb.group({
      color: [''],
      size: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      QTyavailable: [0, [Validators.required, Validators.min(0)]],
      Qtyreserved: [0, [Validators.min(0)]],
      reorderPoint: [5, [Validators.required, Validators.min(0)]]
    });
  }

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  get editVariants(): FormArray {
    return this.editForm.get('variants') as FormArray;
  }

  addVariant(form: 'add' | 'edit' = 'add') {
    const variantsArray = form === 'add' ? this.variants : this.editVariants;
    variantsArray.push(this.createVariantFormGroup());
  }

  removeVariant(index: number, form: 'add' | 'edit' = 'add') {
    const variantsArray = form === 'add' ? this.variants : this.editVariants;
    if (variantsArray.length > 1) {
      variantsArray.removeAt(index);
    }
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        this.products = response.data || response;
        this.filteredProducts = [...this.products];
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories: CategoryInterface[]) => {
        this.categories = categories.filter(cat => cat.isActive && !cat.isDeleted);
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  onTitleChange(event: any, form: 'add' | 'edit' = 'add') {
    const title = event.target.value;
    const slug = this.generateSlug(title);
    const targetForm = form === 'add' ? this.productForm : this.editForm;
    targetForm.patchValue({ slug });
  }

  onFileSelected(event: any, form: 'add' | 'edit' = 'add') {
    const file = event.target.files[0];
    if (file) {
      const targetForm = form === 'add' ? this.productForm : this.editForm;
      targetForm.patchValue({ images: file });
    }
  }

  openAddModal() {
    this.showAddModal = true;
    this.productForm.reset();
    this.clearImageSelection();
    // Clear variants array and add one empty variant
    while (this.variants.length !== 0) {
      this.variants.removeAt(0);
    }
    this.addVariant('add');
  }

  closeAddModal() {
    this.showAddModal = false;
    this.productForm.reset();
    this.clearImageSelection();
  }

  openEditModal(product: ProductInterface) {
    this.editingProduct = { ...product };
    this.showEditModal = true;
    this.clearImageSelection();
    
    // Populate edit form
    this.editForm.patchValue({
      title: product.title,
      slug: product.slug,
      description: product.description,
      categoryID: Array.isArray(product.categoryID) ? product.categoryID.map((cat: any) => cat._id || cat) : product.categoryID,
      material: product.attributes.material,
      origin: product.attributes.origin
    });

    // Clear and populate variants
    while (this.editVariants.length !== 0) {
      this.editVariants.removeAt(0);
    }

    product.variant.forEach(variant => {
      const variantGroup = this.createVariantFormGroup();
      variantGroup.patchValue(variant);
      this.editVariants.push(variantGroup);
    });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingProduct = null;
    this.editForm.reset();
    this.clearImageSelection();
  }

  addProduct() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      
      const productData = {
        title: formValue.title,
        slug: formValue.slug,
        description: formValue.description,
        categoryID: formValue.categoryID,
        attributes: {
          material: formValue.material,
          origin: formValue.origin
        } as IProductAttributes,
        variant: formValue.variants as IProductVariant[],
        images: this.selectedFiles.length > 0 ? this.selectedFiles.map(fileObj => fileObj.file) : []
      };

      console.log('Creating product with data:', productData);
      this.loading = true;
      this.productService.createProduct(productData).subscribe({
        next: (product: ProductInterface) => {
          this.products.unshift(product);
          this.applyFilters();
          this.closeAddModal();
          this.loading = false;
          alert('Product created successfully!');
        },
        error: (error: any) => {
          console.error('Error creating product:', error);
          this.loading = false;
          alert('Error creating product. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched(this.productForm);
    }
  }

  updateProduct() {
    if (this.editForm.valid && this.editingProduct) {
      const formValue = this.editForm.value;
      
      const updateData: Partial<ProductInterface> = {
        title: formValue.title,
        slug: formValue.slug,
        description: formValue.description,
        categoryID: formValue.categoryID,
        attributes: {
          material: formValue.material,
          origin: formValue.origin
        } as IProductAttributes,
        variant: formValue.variants as IProductVariant[]
      };

      // Handle images
      if (this.selectedFiles.length > 0 || this.removedExistingImages.length > 0) {
        // Start with existing images that weren't removed
        let existingImages = (this.editingProduct.images && Array.isArray(this.editingProduct.images)) ? 
          this.editingProduct.images.filter(img => !this.removedExistingImages.includes(img)) : [];
        
        // For now, we'll just store the data URLs as strings in the database
        // In a production app, you'd upload files to a server first
        const newImageUrls = this.selectedFiles.map(fileObj => fileObj.preview);
        updateData.images = [...existingImages, ...newImageUrls];
      }

      const newImageFiles = this.selectedFiles.map(fileObj => fileObj.file);

      console.log('Update data:', updateData);
      console.log('New image files:', newImageFiles);
      
      this.loading = true;
      this.productService.updateProduct(this.editingProduct._id, updateData, newImageFiles).subscribe({
        next: (updatedProduct: ProductInterface) => {
          const index = this.products.findIndex(p => p._id === this.editingProduct!._id);
          if (index !== -1) {
            this.products[index] = updatedProduct;
            this.applyFilters();
          }
          this.closeEditModal();
          this.loading = false;
          alert('Product updated successfully!');
        },
        error: (error: any) => {
          console.error('Error updating product:', error);
          this.loading = false;
          alert('Error updating product. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched(this.editForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  applyFilters() {
    let filtered = [...this.products];

    // Search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.slug.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product => {
        if (Array.isArray(product.categoryID)) {
          return product.categoryID.some((cat: any) => 
            (typeof cat === 'string' ? cat : cat._id) === this.selectedCategory
          );
        }
        return false;
      });
    }

    // Status filter
    if (this.selectedStatus) {
      if (this.selectedStatus === 'active') {
        filtered = filtered.filter(product => product.isActive && !product.isDeleted);
      } else if (this.selectedStatus === 'inactive') {
        filtered = filtered.filter(product => !product.isActive);
      } else if (this.selectedStatus === 'deleted') {
        filtered = filtered.filter(product => product.isDeleted);
      }
    }

    this.filteredProducts = filtered;
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  searchProducts() {
    this.applyFilters();
  }

  filterByCategory() {
    this.applyFilters();
  }

  filterByStatus() {
    this.applyFilters();
  }

  toggleProductStatus(product: ProductInterface) {
    const newStatus = !product.isActive;
    
    if (newStatus) {
      this.productService.setProductActive(product._id).subscribe({
        next: () => {
          product.isActive = true;
          this.applyFilters();
        },
        error: (error: any) => {
          console.error('Error activating product:', error);
          alert('Error activating product. Please try again.');
        }
      });
    } else {
      this.productService.setProductInactive(product._id).subscribe({
        next: () => {
          product.isActive = false;
          this.applyFilters();
        },
        error: (error: any) => {
          console.error('Error deactivating product:', error);
          alert('Error deactivating product. Please try again.');
        }
      });
    }
  }

  deleteProduct(product: ProductInterface) {
    if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
      this.productService.softDeleteProduct(product._id).subscribe({
        next: () => {
          product.isDeleted = true;
          this.applyFilters();
          alert('Product deleted successfully!');
        },
        error: (error: any) => {
          console.error('Error deleting product:', error);
          alert('Error deleting product. Please try again.');
        }
      });
    }
  }

  getPaginatedProducts(): ProductInterface[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStatusClass(product: ProductInterface): string {
    if (product.isDeleted) return 'badge deleted';
    return product.isActive ? 'badge active' : 'badge inactive';
  }

  getStatusText(product: ProductInterface): string {
    if (product.isDeleted) return 'Deleted';
    return product.isActive ? 'Active' : 'Inactive';
  }

  formatPrice(product: ProductInterface): string {
    const priceRange = this.productService.getPriceRange(product);
    if (priceRange.min === priceRange.max) {
      return `${priceRange.min} EGP`;
    }
    return `${priceRange.min} - ${priceRange.max} EGP`;
  }

  getProductImage(product: ProductInterface): string {
    if (!product.images) {
      return this.getPlaceholderImage();
    }

    let imagePath: string | undefined;

    // Handle string case
    if (typeof product.images === 'string' && (product.images as string).trim() !== '') {
      imagePath = product.images as string;
    }
    // Handle array case
    else if (Array.isArray(product.images) && product.images.length > 0) {
      imagePath = product.images[0];
    }

    if (imagePath) {
      // If it's already a full URL, return it
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      // Otherwise, build the URL
      return `${environment.uploadsURL}/${imagePath}`;
    }

    // Return placeholder if no valid images
    return this.getPlaceholderImage();
  }

  private getPlaceholderImage(): string {
    // Return a simple SVG placeholder instead of external URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNSAyMEMyMy4zNDMxIDIwIDIyIDIxLjM0MzEgMjIgMjNDMjIgMjQuNjU2OSAyMy4zNDMxIDI2IDI1IDI2QzI2LjY1NjkgMjYgMjggMjQuNjU2OSAyOCAyM0MyOCAyMS4zNDMxIDI2LjY1NjkgMjAgMjUgMjBaIiBmaWxsPSIjOUM5Q0ExIi8+CjxwYXRoIGQ9Ik0xNiAxNlYzNEgzNFYxNkgxNlpNMzIgMzJIMThWMThIMzJWMzJaIiBmaWxsPSIjOUM5Q0ExIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSIjOUM5Q0ExIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
  }

  getTotalStock(product: ProductInterface): number {
    return this.productService.getTotalAvailableQuantity(product);
  }

  getCategoryNames(product: ProductInterface): string {
    if (Array.isArray(product.categoryID) && product.categoryID.length > 0) {
      return product.categoryID
        .map((cat: any) => {
          if (typeof cat === 'string') {
            const category = this.categories.find(c => c._id === cat);
            return category?.name || 'Unknown';
          }
          return cat.name || 'Unknown';
        })
        .join(', ');
    }
    return 'No Category';
  }

  isFieldInvalid(fieldName: string, form: FormGroup): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, form: FormGroup): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }

  // Image upload methods
  onFileSelect(event: any) {
    console.log('onFileSelect called', event);
    const files = event.target.files;
    console.log('Selected files:', files);
    if (files) {
      this.processFiles(files);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  processFiles(files: FileList) {
    console.log('processFiles called with', files.length, 'files');
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('Processing file:', file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('File rejected - not an image');
        continue;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File reader loaded for:', file.name);
        const fileData = {
          file: file,
          name: file.name,
          preview: e.target?.result as string
        };
        this.selectedFiles.push(fileData);
        console.log('Current selectedFiles:', this.selectedFiles);
        
        // Trigger change detection
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  removeExistingImage(index: number) {
    if (!this.editingProduct?.images) {
      return;
    }

    // Convert images to array if it's a string
    if (typeof this.editingProduct.images === 'string') {
      this.editingProduct.images = [this.editingProduct.images];
    }

    // Now we can safely work with the array
    if (Array.isArray(this.editingProduct.images) && index < this.editingProduct.images.length) {
      const imageUrl = this.editingProduct.images[index];
      this.removedExistingImages.push(imageUrl);
      this.editingProduct.images.splice(index, 1);
    }
  }

  getCurrentImages(): string[] {
    if (!this.editingProduct?.images) {
      return [];
    }
    
    // Handle case where images is a string
    if (typeof this.editingProduct.images === 'string') {
      return [this.editingProduct.images];
    }
    
    // Handle case where images is an array
    if (Array.isArray(this.editingProduct.images)) {
      return this.editingProduct.images;
    }
    
    return [];
  }

  clearImageSelection() {
    this.selectedFiles = [];
    this.removedExistingImages = [];
    this.isDragOver = false;
  }
}
