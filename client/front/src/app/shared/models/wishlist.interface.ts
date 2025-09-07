import { ProductInterface } from "./product.interface";
import { UserInterface } from "./user.interface";
export interface IWishlistItem {
  _id?: string;
  // Use string for the ID, or IProduct if the backend populates it
  productID:ProductInterface;
}
export interface WishlistInterface {
  _id: string;
  // Use string for the ID, or IUser if the backend populates it
  userID: string | UserInterface;
  items: IWishlistItem[];
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
}
