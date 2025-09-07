import { ProductInterface } from "./product.interface";
import { UserInterface as IUser } from "./user.interface";
// Interface for items in an order
export interface IOrderItem {
  _id?: string;
  // Use string for the ID, or IProduct if the backend populates it
  productID: string | ProductInterface;
  quantity: number;
  title: string;
  price: number;
}

// Type for order status enum
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Main Order Interface
export interface OrderInterface {
  _id: string;
  // Use string for the ID, or IUser if the backend populates it
  userID: string | IUser;
  ordernumber: string;
  status: OrderStatus;
  items: IOrderItem[];
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
}