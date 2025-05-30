import { useMutation, useQueryClient } from '@tanstack/react-query';
import { placeOrderService } from '../services/userServices';
import { Order, OrderItem } from '../types/order';
import { Product } from '../types/product';
import { ApiError } from '../types/error';
import { OrderStatus } from '../constants/order';
import { ApiResponse } from '../types/apiResponse';
import { Cart, CartItem } from '../types/cart';
import { User } from '../types/user';

interface UserWithCart extends Omit<User, 'cart'> {
  cart: Cart | undefined;
  orders: string[];
}

interface PlaceOrderResponse {
  order: Order;
  currentUser: UserWithCart;
  products: Product[];
  orders: Order[];
}

interface MutationContext {
  previousUser: UserWithCart | null;
}

// Helper type to match API response format
interface ApiOrderResponse {
  _id: string;
  user: string;
  orderItems: {
    productId: string;
    productName: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  userModel?: string;
  userType?: string;
}

const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: placeOrder, isPending: isLoading } = useMutation<
    ApiResponse<PlaceOrderResponse>,
    ApiError,
    void,
    MutationContext
  >({
    mutationFn: async () => {
      const response = await placeOrderService();
      const apiOrder = response.data.order as unknown as ApiOrderResponse;

      // Convert the response.data.order to the correct Order type
      const order: Order = {
        _id: apiOrder._id,
        user: apiOrder.user,
        userModel: (apiOrder.userModel as 'User' | 'Guest') || 'User',
        userType: apiOrder.userType || 'registered',
        orderItems: apiOrder.orderItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
        })),
        totalPrice: apiOrder.totalPrice,
        status: apiOrder.status as OrderStatus,
        createdAt: apiOrder.createdAt,
        updatedAt: apiOrder.updatedAt,
      };

      const userObj = queryClient.getQueryData<UserWithCart>(['currentUser']);

      const products = Array.isArray(
        (response.data as { products?: unknown })?.products
      )
        ? ((response.data as { products?: unknown }).products as Product[])
        : [];

      return {
        ok: response.ok,
        status: response.status ?? 200,
        message: response.message,
        data: {
          order,
          currentUser: {
            _id: userObj?._id || '',
            name: userObj?.name || '',
            email: userObj?.email || '',
            phone: userObj?.phone || '',
            role: userObj?.role || '',
            isActive: userObj?.isActive ?? true,
            is_banned: userObj?.is_banned ?? false,
            createdAt: userObj?.createdAt || new Date().toISOString(),
            updatedAt: userObj?.updatedAt || new Date().toISOString(),
            cart: undefined,
            orders: [...(userObj?.orders || []), order._id],
          },
          products,
          orders: [order],
        },
      };
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['currentUser'] });
      // Store previous user state for rollback on error
      const previousUser =
        queryClient.getQueryData<UserWithCart>(['currentUser']) || null;
      // Get current user data to create temp order
      const currentUser = queryClient.getQueryData<UserWithCart>([
        'currentUser',
      ]);

      if (!currentUser || !currentUser.cart) {
        throw new Error('No cart found');
      }

      const timestamp = Date.now();
      const tempOrder: Order = {
        _id: `temp_${timestamp}`,
        orderItems: currentUser.cart.items.map(
          (item: CartItem): OrderItem => ({
            productId: item.productId,
            productName: item.productName,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })
        ),
        totalPrice: currentUser.cart.totalPrice,
        status: 'processing' as OrderStatus,
        createdAt: new Date(timestamp).toISOString(),
        updatedAt: new Date(timestamp).toISOString(),
        user: currentUser._id,
        userModel: 'User',
        userType: 'registered',
      };

      // Optimistically update user's cart and orders
      queryClient.setQueryData<UserWithCart | undefined>(
        ['currentUser'],
        (old) =>
          old
            ? {
                ...old,
                orders: [...(old.orders || []), tempOrder._id],
                cart: undefined,
              }
            : undefined
      );

      return { previousUser };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(['currentUser'], context.previousUser);
      }
    },
    onSuccess: (response) => {
      queryClient.setQueryData(['currentUser'], response.data.currentUser);
      queryClient.setQueryData(['products'], response.data.products);
      // Update orders cache by merging with existing orders
      queryClient.setQueryData<Order[]>(['orders'], (old) => {
        const newOrder = response.data.order;
        if (!old) return [newOrder];
        return [...old, newOrder];
      });
    },
  });

  return { placeOrder, isLoading };
};

export default usePlaceOrder;
