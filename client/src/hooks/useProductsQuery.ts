import { useQuery } from '@tanstack/react-query';
import { getAllProducts } from '../services/productServices';
import { Product } from '../types/product';

const useProductsQuery = () => {
  const {
    data: products,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
  } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const products = await getAllProducts();
      return products;
    },
  });
  return { products: products || [], isProductsLoading, isProductsFetching };
};

export default useProductsQuery;
