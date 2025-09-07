import { ProductInterface as IProduct } from "./product.interface";
import { UserInterface as IUser } from "./user.interface";
export interface ICartItem {
  _id?: string;
  // Use string for the ID, or IProduct if the backend populates it
  productID: string | IProduct;
  variantId: string;
  quantity: number;
  title: string;
  price: number;
  priceChanged?: boolean;
}

// Main Cart Interface
export interface CartInterface {
  _id: string;
  // Use string for the ID, or IUser if the backend populates it
  userID: string | IUser;
  items: ICartItem[];
  totalPrice: number;
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
}