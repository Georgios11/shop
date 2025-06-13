import { OrderStatus } from '../constants/order';
export interface OrderItemResponse {
  productName: string;
  quantity: number;
  image: string;
  price: number;
  productId: string;
}

export interface OrdersResponse {
  orders: OrderResponse[];
}
export interface OrderItem {
  productName: string;
  quantity: number;
  image: string;
  price: number;
  productId: string;
}

export interface Order {
  _id: string;
  user: string;
  userModel: 'User' | 'Guest';
  userType: string;
  orderItems: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// Response types for API calls
export type OrderResponse = Order;

// Type for creating a new order
export interface CreateOrderData {
  orderItems: Omit<OrderItem, 'image'>[];
  totalPrice: number;
}
