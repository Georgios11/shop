import { useQueryClient } from '@tanstack/react-query';
import useProductsQuery from './useProductsQuery';
import useCategoriesQuery from './useCategoriesQuery';
import { Product } from '../types/product';

interface Category {
  _id: string;
  name: string;
}

const useDataFetch = () => {
  const queryClient = useQueryClient();
  const { products, isProductsLoading } = useProductsQuery();
  const { categories, isCategoriesLoading } = useCategoriesQuery();

  // Ensure data is cached
  if (products && Array.isArray(products)) {
    queryClient.setQueryData<Product[]>(['products'], products);
  }
  if (categories) {
    queryClient.setQueryData<Category[]>(['categories'], categories);
  }

  return {
    products,
    isProductsLoading,
    categories,
    isCategoriesLoading,
  };
};

export default useDataFetch;
