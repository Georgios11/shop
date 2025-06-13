import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '../services/openServices';

const useCategoriesQuery = () => {
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isFetching: isCategoriesFetching,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  });
  return { categories, isCategoriesLoading, isCategoriesFetching };
};

export default useCategoriesQuery;
