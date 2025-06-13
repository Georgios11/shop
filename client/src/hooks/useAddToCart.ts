/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToCartService } from '../services/userServices';
import useCurrentUser from './useCurrentUser';
import { UserResponse } from '../services/adminServices';
import { ApiError } from '../types/error';
import { ApiResponse } from '../types/apiResponse';
import { Cart } from '../types/cart';
import { Product } from '../types/product';

type CurrentUser = UserResponse & { cart: Cart };

interface MutationContext {
  previousUser: CurrentUser | undefined;
  previousProducts: Product[] | undefined;
}

const useAddToCart = () => {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();

  const { mutateAsync: addToCart, isPending: isAddingToCart } = useMutation<
    ApiResponse<{ currentUser: CurrentUser; products: Product[] }>,
    ApiError,
    string,
    MutationContext
  >({
    mutationFn: async (productId: string) => {
      const response = await addToCartService(productId);
      return {
        ...response,
        data: {
          currentUser: response.data as unknown as CurrentUser,
          products: queryClient.getQueryData<Product[]>(['products']) || [],
        },
      };
    },
    onMutate: async (productId: string) => {
      if (!currentUser) {
        throw new ApiError('Please log in', 401);
      }

      // Cancel both queries
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['currentUser'] }),
        queryClient.cancelQueries({ queryKey: ['products'] }),
      ]);

      // Get previous states
      const previousUser = queryClient.getQueryData<CurrentUser>([
        'currentUser',
      ]);
      const previousProducts = queryClient.getQueryData<Product[]>([
        'products',
      ]);

      // Find existing item and product
      const existingItem = previousUser?.cart?.items?.find(
        (item) => item.productId === productId
      );
      const product = previousProducts?.find((p) => p._id === productId);

      if (!product) {
        throw new ApiError('Product not found', 404);
      }

      // Optimistically update cart
      queryClient.setQueryData<CurrentUser>(['currentUser'], (old) => {
        if (!old) return old;
        const currentCart = old.cart || {
          items: [],
          totalPrice: 0,
          user: null,
          status: 'active',
          userType: 'customer',
        };

        return {
          ...old,
          cart: {
            ...currentCart,
            items: existingItem
              ? currentCart.items.map((item) =>
                  item.productId === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                )
              : [
                  ...currentCart.items,
                  {
                    productId,
                    productName: product.name,
                    quantity: 1,
                    price: product.price,
                    image: product.image,
                  },
                ],
            totalPrice: Number(currentCart.totalPrice) + product.price,
          },
        };
      });

      // Optimistically update product stock
      queryClient.setQueryData<Product[]>(['products'], (old) => {
        if (!old) return old;
        return old.map((product) =>
          product._id === productId
            ? { ...product, itemsInStock: product.itemsInStock - 1 }
            : product
        );
      });

      return { previousUser, previousProducts };
    },
    onError: (error: ApiError, _, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['currentUser'], context.previousUser);
      }
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      throw error;
    },
    onSuccess: (response) => {
      // Only update the cart property, not the whole user object
      queryClient.setQueryData<CurrentUser>(['currentUser'], (old) => {
        if (!old) return response.data.currentUser;
        return {
          ...old,
          cart: response.data.currentUser.cart || old.cart,
          // add other fields you expect to update, if any
        };
      });

      // Update products cache
      queryClient.setQueryData(['products'], response.data.products);
    },
  });

  return { addToCart, isAddingToCart };
};

export default useAddToCart;
