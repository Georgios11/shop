import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProductService } from '../services/adminServices';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../types/error';
import { Product, CreateProductData } from '../types/product';
import { ApiResponse } from '../types/apiResponse';

interface MutationContext {
  previousProducts: Product[] | undefined;
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync: createProduct, isPending: isLoading } = useMutation<
    ApiResponse<{
      products: Product[];
      categories: { _id: string; name: string }[];
    }>,
    ApiError,
    CreateProductData,
    MutationContext
  >({
    mutationFn: async (productData) => {
      const response = await createProductService(productData);
      return response as unknown as ApiResponse<{
        products: Product[];
        categories: { _id: string; name: string }[];
      }>;
    },
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<Product[]>([
        'products',
      ]);

      // Optimistic update
      const tempProduct: Product = {
        ...newProduct,
        _id: `temp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        image: URL.createObjectURL(newProduct.image[0]),
        imagePublicId: '',
        category: newProduct.category,
        slug: newProduct.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      };

      queryClient.setQueryData<Product[]>(['products'], (old = []) => {
        return [tempProduct, ...(old || [])];
      });
      void navigate('/admin/products');
      return { previousProducts };
    },
    onError: (_error: ApiError, _, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      void navigate('/admin/products/add');
    },
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData(['products'], response.data.products);
        queryClient.setQueryData(['categories'], response.data.categories);
      }
    },
  });

  return { createProduct, isLoading };
};
