import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeFavoriteService } from '../services/userServices';
import { ApiError } from '../types/error';
import { CurrentUser } from '../types/user';
import { Product } from '../types/product';
import { ApiResponse } from '../types/apiResponse';

// Extend the Product type to include favoritedBy

interface MutationContext {
  previousUser: CurrentUser | undefined;
  previousProducts: Product[] | undefined;
}

interface RemoveFavoriteResponse {
  currentUser: CurrentUser;
  products: Product[];
}

interface ServiceResponse {
  currentUser: CurrentUser;
  product: Product;
  products: Product[];
  users: CurrentUser[];
}

const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: removeFavorite, isPending: isRemovingFavorite } =
    useMutation<
      ApiResponse<RemoveFavoriteResponse>,
      ApiError,
      string,
      MutationContext
    >({
      mutationFn: async (productId: string) => {
        const response = await removeFavoriteService(productId);
        const responseData = response.data as unknown as ServiceResponse;
        return {
          ok: response.ok,
          message: response.message,
          status: response.status,
          data: {
            currentUser: responseData.currentUser,
            products: responseData.products,
          },
        };
      },
      onMutate: async (productId: string) => {
        // Cancel outgoing refetches
        await Promise.all([
          queryClient.cancelQueries({ queryKey: ['currentUser'] }),
          queryClient.cancelQueries({ queryKey: ['products'] }),
        ]);

        // Snapshot current states
        const previousUser = queryClient.getQueryData<CurrentUser>([
          'currentUser',
        ]);
        const previousProducts = queryClient.getQueryData<Product[]>([
          'products',
        ]);

        // Optimistically update favorites
        queryClient.setQueryData<CurrentUser>(['currentUser'], (old) => {
          if (!old) return old;
          return {
            ...old,
            favorites: old.favorites?.filter((id) => id !== productId) || [],
          };
        });

        // Optimistically update products
        queryClient.setQueryData<Product[]>(['products'], (old) => {
          if (!old) return old;
          return old.map((product) =>
            product._id === productId
              ? {
                  ...product,
                  favoritedBy:
                    product.favoritedBy?.filter(
                      (userId) => userId !== previousUser?._id
                    ) || [],
                }
              : product
          );
        });

        return { previousUser, previousProducts };
      },
      onError: (err, _productId, context) => {
        // Rollback both updates on error
        if (context) {
          queryClient.setQueryData(['currentUser'], context.previousUser);
          queryClient.setQueryData(['products'], context.previousProducts);
        }
        if (err instanceof ApiError) {
          throw err;
        }
        throw new ApiError(
          'An unexpected error occurred while removing favorite'
        );
      },
      onSuccess: (data) => {
        // Update with server response
        queryClient.setQueryData(['currentUser'], data.data.currentUser);
        queryClient.setQueryData(['products'], data.data.products);
      },
    });

  return { removeFavorite, isRemovingFavorite };
};

export default useRemoveFavorite;
