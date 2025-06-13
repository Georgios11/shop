import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProductService } from '../services/adminServices';
import { ApiError } from '../types/error';
import { Product, CreateProductData } from '../types/product';
import { ApiResponse } from '../types/apiResponse';

interface MutationContext {
  previousProducts: Product[] | undefined;
}

export const useUpdateProduct = (productId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateProduct, isPending: isUpdating } = useMutation<
    ApiResponse<{ updatedProduct: Product }>,
    ApiError,
    Partial<CreateProductData>,
    MutationContext
  >({
    mutationFn: (data) => updateProductService(productId, data),
    onMutate: async (newProduct) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData<Product[]>([
        'products',
      ]);

      // Optimistically update the products data
      queryClient.setQueryData<Product[]>(['products'], (old) => {
        if (!old) return [];
        return old.map((product) => {
          if (product._id !== productId) return product;

          let optimisticImage = product.image;
          if (newProduct.image) {
            if (typeof newProduct.image === 'string') {
              optimisticImage = newProduct.image;
            } else if (newProduct.image instanceof File) {
              optimisticImage = URL.createObjectURL(newProduct.image);
            }
          }

          return { ...product, ...newProduct, image: optimisticImage };
        });
      });

      // Return context with the previous products
      return { previousProducts };
    },
    onError: (err, _, context) => {
      // Rollback to the previous value if there's an error
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError('An unexpected error occurred while updating product');
    },
    onSuccess: (response) => {
      queryClient.setQueryData<Product[]>(['products'], (old) => {
        if (!old || old.length === 0) return [];
        return [response.data.updatedProduct, ...old.slice(1)];
      });
    },
  });

  return { updateProduct, isUpdating };
};

export default useUpdateProduct;
