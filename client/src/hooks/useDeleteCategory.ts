import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategoryService } from '../services/adminServices';
import type { Category, DeleteCategoryResponse } from '../types/category';
import { ApiResponse } from '../types/apiResponse';
interface DeleteCategoryContext {
  previousCategories: Category[] | undefined;
  previousProducts: DeleteCategoryResponse['products'] | undefined;
}

const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutateAsync: deleteCategory } = useMutation<
    ApiResponse<DeleteCategoryResponse>,
    Error,
    string,
    DeleteCategoryContext
  >({
    mutationFn: deleteCategoryService,
    onMutate: async (categoryId) => {
      // Cancel ongoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // Take snapshots of the current cache
      const previousCategories = queryClient.getQueryData<Category[]>([
        'categories',
      ]);
      const previousProducts = queryClient.getQueryData<
        DeleteCategoryResponse['products']
      >(['products']);

      // Optimistically update the categories cache
      queryClient.setQueryData<Category[]>(['categories'], (old) =>
        old ? old.filter((category) => category._id !== categoryId) : []
      );

      // Return the snapshots for potential rollback
      return { previousCategories, previousProducts };
    },
    onError: (_error, _categoryId, context) => {
      // Rollback to the previous cache state if an error occurs
      if (context) {
        queryClient.setQueryData(['categories'], context.previousCategories);
        queryClient.setQueryData(['products'], context.previousProducts);
      }
    },
    onSuccess: (response) => {
      // Update both categories and products caches with the new data
      queryClient.setQueryData(['categories'], response.data.categories);
      queryClient.setQueryData(['products'], response.data.products);
    },
  });

  return { isDeleting, deleteCategory };
};

export default useDeleteCategory;
