import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../apiService/api.service';
import { ProductInterface, IProductVariant, IProductAttributes } from '../../../shared/models/product.interface';
import { environment } from '../../../../envirmonets/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private apiService: ApiService) {}

  // Get all products
  getProducts(): Observable<ProductInterface[]> {
    return this.apiService.get<ProductInterface[]>('/product/public/products', undefined);
  }

  // Get product by slug
  getProductBySlug(slug: string): Observable<ProductInterface> {
    return this.apiService.get<ProductInterface>(`/product/public/product/${slug}`);
  }

  // Get product by ID (Admin only)
  getProductById(id: string): Observable<ProductInterface> {
    return this.apiService.getWithAuth<ProductInterface>(`/product/getproductbyid/${id}`);
  }

  // Create new product (Admin only)
  createProduct(productData: {
    title: string;
    slug: string;
    description: string;
    categoryID: string[];
    attributes: IProductAttributes;
    variant: IProductVariant[];
    images?: File[];
  }): Observable<ProductInterface> {
    const formData = new FormData();
    formData.append('title', productData.title);
    formData.append('slug', productData.slug);
    formData.append('description', productData.description);
    formData.append('categoryID', JSON.stringify(productData.categoryID));
    formData.append('attributes', JSON.stringify(productData.attributes));
    formData.append('variant', JSON.stringify(productData.variant));
    
    // Append single image file
    if (productData.images && productData.images.length > 0) {
      formData.append('image', productData.images[0]); // Use 'image' field name for single upload
    }

    return this.apiService.uploadFile<ProductInterface>('/product/addproduct', formData, this.apiService.getUploadHeaders());
  }

  // Update product (Admin only)
  updateProduct(id: string, productData: Partial<ProductInterface>, newImages: File[] = []): Observable<ProductInterface> {
    const formData = new FormData();

    // Append all fields from productData except images
    Object.keys(productData).forEach(key => {
      const value = (productData as any)[key];
      if (key === 'images') {
        // Send existing images as a JSON string
        if (Array.isArray(value)) {
          formData.append('images', JSON.stringify(value));
        } else if (typeof value === 'string') {
          formData.append('images', JSON.stringify([value]));
        }
      } else if (key === 'categoryID' || key === 'attributes' || key === 'variant') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    // Append new image file (single)
    if (newImages.length > 0) {
      formData.append('image', newImages[0]); // Use 'image' field name for single upload
    }

    return this.apiService.uploadFilePut<ProductInterface>(`/product/updateproduct/${id}`, formData, this.apiService.getUploadHeaders());
  }

  // Soft delete product (Admin only)
  softDeleteProduct(id: string): Observable<{ message: string; product: ProductInterface }> {
    return this.apiService.delete<{ message: string; product: ProductInterface }>(`/product/softdeleteproduct/${id}`, this.apiService.getAuthHeaders());
  }

  // Set product as active (Admin only)
  setProductActive(id: string): Observable<{ message: string; product: ProductInterface }> {
    return this.apiService.getWithAuth<{ message: string; product: ProductInterface }>(`/product/setactive/${id}`);
  }

  // Set product as inactive (Admin only)
  setProductInactive(id: string): Observable<{ message: string; product: ProductInterface }> {
    return this.apiService.getWithAuth<{ message: string; product: ProductInterface }>(`/product/setinactive/${id}`);
  }

  // Helper method to get product image URL
  getProductImageUrl(images?: string[]): string {
  if (!images || images.length === 0) {
    return 'assets/default-product.svg'; // fallback image
  }
  return images[0];
}

  // Helper method to check if product is available
  isProductAvailable(product: ProductInterface): boolean {
    return product.isActive && !product.isDeleted && 
           product.variant.some((variant: IProductVariant) => variant.QTyavailable > 0);
  }

  // Helper method to get available variants
  getAvailableVariants(product: ProductInterface): IProductVariant[] {
    return product.variant.filter((variant: IProductVariant) => variant.QTyavailable > 0);
  }

  // Helper method to get total available quantity
  getTotalAvailableQuantity(product: ProductInterface): number {
    return product.variant.reduce((total: number, variant: IProductVariant) => total + variant.QTyavailable, 0);
  }

  // Helper method to get price range
  getPriceRange(product: ProductInterface): { min: number; max: number } {
    const prices = product.variant.map((variant: IProductVariant) => variant.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  // Helper method to check if product needs reorder
  needsReorder(product: ProductInterface): boolean {
    return product.variant.some((variant: IProductVariant) => variant.QTyavailable <= variant.reorderPoint);
  }
}
