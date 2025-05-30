import { useIsFetching } from '@tanstack/react-query';
import useCategoriesQuery from './useCategoriesQuery';

const useCategoriesCache = () => {
  const { categories, isCategoriesLoading, isCategoriesFetching } =
    useCategoriesQuery();
  const isFetchingCategories = useIsFetching({ queryKey: ['categories'] }) > 0;

  return {
    categories: categories || [], // Access data property from the response
    isCategoriesLoading,
    isCategoriesFetching,
    isFetchingCategories,
  };
};

export default useCategoriesCache;
