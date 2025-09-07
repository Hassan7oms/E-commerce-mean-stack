import { UserInterface } from "./user.interface";
import { ProductInterface } from "./product.interface";
export interface Itestmonials {
    _id: string;
  // Use string for the ID, or IUser/IProduct if the backend populates them
  userID: string | UserInterface;
  productID: string | ProductInterface;
  rating: number;
  comment?: string;
  isApproved: boolean;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
}
