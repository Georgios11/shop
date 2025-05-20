import { useIsFetching } from '@tanstack/react-query';
import useProductsQuery from './useProductsQuery';

const useProductsCache = () => {
  // If no cached data, fetch it
  const { products, isProductsLoading, isProductsFetching } =
    useProductsQuery();

  const isFetchingProducts = useIsFetching({ queryKey: ['products'] }) > 0;

  return {
    products: products || [], // Ensure we return an array even if products is undefined
    isProductsLoading,
    isProductsFetching,
    isFetchingProducts,
  };
};

export default useProductsCache;
