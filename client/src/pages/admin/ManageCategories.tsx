import useCategoriesQuery from '../../hooks/useCategoriesQuery';
import useDeleteCategory from '../../hooks/useDeleteCategory';
import {
  CategoriesContainer,
  CategoriesHeader,
  CategoriesGrid,
  CategoryCard,
  CategoryHeader,
  CategoryName,
  CategoryStatus,
  CategoryInfo,
  ProductCount,
  CategoryActions,
  ActionButton,
} from '../../styles/ManageCategoriesStyles';
import Spinner from '../../ui/Spinner';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { Category, DeleteCategoryResponse } from '../../types/category';
import { ApiResponse } from '../../types/apiResponse';

const ManageCategories = () => {
  const { categories, isCategoriesLoading } = useCategoriesQuery();
  const { deleteCategory, isDeleting } = useDeleteCategory();

  if (isCategoriesLoading) return <Spinner />;

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast.success('Category deleted successfully');
    } catch (error) {
      const axiosError = error as AxiosError<
        ApiResponse<DeleteCategoryResponse>
      >;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to delete category';
      toast.error(errorMessage);
    }
  };

  const renderCategories = categories?.map((category: Category) => (
    <CategoryCard key={category._id}>
      <CategoryHeader>
        <CategoryName>{category.name}</CategoryName>
        <CategoryStatus $isDiscounted={category.is_discounted}>
          {category.is_discounted ? 'Discounted' : 'Regular'}
        </CategoryStatus>
      </CategoryHeader>

      <CategoryInfo>
        <span>
          <strong>Created:</strong>
          {formatDate(category.createdAt)}
        </span>
        <span>
          <strong>Created By:</strong>
          {category.createdBy}
        </span>
      </CategoryInfo>

      <ProductCount>Products: {category.products.length}</ProductCount>

      <CategoryActions>
        {/* <ActionButton className="edit">Edit</ActionButton> */}
        <ActionButton
          className="delete"
          onClick={() => void handleDelete(category._id)}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </ActionButton>
      </CategoryActions>
    </CategoryCard>
  ));

  return (
    <CategoriesContainer data-testid="manage-categories-page">
      <CategoriesHeader>All Categories</CategoriesHeader>
      <CategoriesGrid>{renderCategories}</CategoriesGrid>
    </CategoriesContainer>
  );
};

export default ManageCategories;
