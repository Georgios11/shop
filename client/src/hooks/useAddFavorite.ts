import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFavoriteService } from '../services/userServices';
import { UserResponse } from '../services/adminServices';
import { ApiError } from '../types/error';
import useCurrentUser from './useCurrentUser';
import { ApiResponse } from '../types/apiResponse';
import { Product } from '../types/product';

type CurrentUser = UserResponse;

interface MutationContext {
  previousUser: CurrentUser | undefined;
  previousProducts: Product[] | undefined;
}

const useAddFavorite = () => {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();

  const { mutateAsync: addFavorite, isPending: isAddingFavorite } = useMutation<
    ApiResponse<{ currentUser: CurrentUser; products: Product[] }>,
    ApiError,
    string,
    MutationContext
  >({
    mutationFn: async (productId: string) => {
      const response = await addFavoriteService(productId);
      return {
        ...response,
        data: {
          currentUser: response.data as unknown as UserResponse,
          products: queryClient.getQueryData<Product[]>(['products']) || [],
        },
      };
    },
    onMutate: async (productId: string) => {
      if (!currentUser) {
        throw new ApiError('Please log in', 401);
      }

      // Get current states first
      const previousUser = queryClient.getQueryData<CurrentUser>([
        'currentUser',
      ]);
      const previousProducts = queryClient.getQueryData<Product[]>([
        'products',
      ]);

      // Cancel outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['currentUser'] }),
        queryClient.cancelQueries({ queryKey: ['products'] }),
      ]);

      // Optimistically update favorites
      queryClient.setQueryData<CurrentUser>(['currentUser'], (old) => {
        if (!old) return old;
        return {
          ...old,
          favorites: [...(old.favorites || []), productId],
        };
      });

      // Optimistically update products
      queryClient.setQueryData<Product[]>(['products'], (old) => {
        if (!old) return old;
        return old.map((product) =>
          product._id === productId
            ? {
                ...product,
                favoritedBy: [...(product.favoritedBy || []), currentUser._id],
              }
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
      // Update the currentUser cache with the new favorites data
      queryClient.setQueryData<CurrentUser>(['currentUser'], (old) => {
        if (!old) return response.data.currentUser;
        return {
          ...old,
          ...response.data.currentUser,
          favorites: response.data.currentUser.favorites || old.favorites || [],
        };
      });
      queryClient.setQueryData(['products'], response.data.products);
    },
  });

  return { addFavorite, isAddingFavorite };
};

export default useAddFavorite;
