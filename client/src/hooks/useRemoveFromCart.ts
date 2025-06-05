import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeFromCartService } from '../services/userServices';
import { ApiError } from '../types/error';
import { Product } from '../types/product';
import { UserResponse } from '../services/adminServices';
import { ApiResponse } from '../types/apiResponse';

type CurrentUser = UserResponse;

interface MutationContext {
  previousUser: CurrentUser | undefined;
  previousProducts: Product[] | undefined;
}

interface RemoveFromCartResponse {
  currentUser: CurrentUser;
  products: Product[];
}

const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: removeFromCart, isPending: isRemovingFromCart } =
    useMutation<
      ApiResponse<RemoveFromCartResponse>,
      ApiError,
      string,
      MutationContext
    >({
      mutationFn: async (productId: string) => {
        const response = await removeFromCartService(productId);
        return {
          ok: response.ok,
          message: response.message,
          status: response.status,
          data: {
            currentUser: response.data as unknown as CurrentUser,
            products: queryClient.getQueryData<Product[]>(['products']) || [],
          },
        };
      },
      onMutate: async (productId: string) => {
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

        // Optimistically update cart
        queryClient.setQueryData<CurrentUser>(['currentUser'], (old) => {
          if (!old?.cart) return old;
          const updatedItems = old.cart.items
            .map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0);

          return {
            ...old,
            cart: {
              ...old.cart,
              items: updatedItems,
              totalPrice: updatedItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0
              ),
            },
          };
        });

        // Optimistically update product stock
        queryClient.setQueryData<Product[]>(['products'], (old) => {
          if (!old) return old;
          return old.map((product) =>
            product._id === productId
              ? { ...product, itemsInStock: product.itemsInStock + 1 }
              : product
          );
        });

        return { previousUser, previousProducts };
      },
      onError: (err, _productId, context) => {
        // Rollback both updates on error
        if (context?.previousUser) {
          queryClient.setQueryData(['currentUser'], context.previousUser);
        }
        if (context?.previousProducts) {
          queryClient.setQueryData(['products'], context.previousProducts);
        }
        if (err instanceof ApiError) {
          throw err;
        }
        throw new ApiError(
          'An unexpected error occurred while removing item from cart'
        );
      },
      onSuccess: (data) => {
        queryClient.setQueryData(
          ['currentUser'],
          (old: CurrentUser | undefined) => {
            if (!old || typeof old !== 'object' || !('cart' in old))
              return data.data.currentUser;
            return {
              ...old,
              cart: data.data.currentUser.cart || old.cart,
            };
          }
        );
        queryClient.setQueryData(['products'], data.data.products);
      },
    });

  return { removeFromCart, isRemovingFromCart };
};

export default useRemoveFromCart;
