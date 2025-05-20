export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
  user: string | null;
  status: string;
  userType: string;
}
