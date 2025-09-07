import { CategoryInterface as ICategory } from "./category.interface";
export interface IProductAttributes {
  material: string;
  origin: string;
}

// Interface for objects within the 'variant' array
export interface IProductVariant {
  _id?: string; // Mongoose adds _id to sub-documents
  color?: string;
  size?: string;
  price: number;
  QTyavailable: number;
  Qtyreserved: number;
  reorderPoint: number;
}

// Main Product Interface
export interface ProductInterface {
  _id: string;
  title: string;
  slug: string;
  description: string;
  // Use string array for IDs, or ICategory array if the backend populates it
  categoryID: string[] | ICategory[];
  images?: string[] | string;
  attributes: IProductAttributes;
  isDeleted: boolean;
  isActive: boolean;
  variant: IProductVariant[];
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
}