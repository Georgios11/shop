import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProductService } from '../services/adminServices';
import type { Product, DeleteProductResponse } from '../types/product';
import { ApiResponse } from '../types/apiResponse';

interface DeleteProductContext {
  previousProducts: Product[] | undefined;
}

const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutateAsync: deleteProduct } = useMutation<
    ApiResponse<DeleteProductResponse>,
    Error,
    string,
    DeleteProductContext
  >({
    mutationFn: deleteProductService,
    onMutate: async (productId) => {
      // Cancel ongoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // Take a snapshot of the current cache
      const previousProducts = queryClient.getQueryData<Product[]>([
        'products',
      ]);

      // Optimistically update the cache by removing the product
      queryClient.setQueryData<Product[]>(['products'], (old) =>
        old ? old.filter((product) => product._id !== productId) : []
      );

      // Return the snapshot for potential rollback
      return { previousProducts };
    },
    onError: (_error, _productId, context) => {
      // Rollback to the previous cache state if an error occurs
      if (context) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
    },
    onSuccess: (response) => {
      // Update both products and categories caches with the new data
      queryClient.setQueryData(['products'], response.data.products);
      queryClient.setQueryData(['categories'], response.data.categories);
    },
  });

  return { isDeleting, deleteProduct };
};

export default useDeleteProduct;
