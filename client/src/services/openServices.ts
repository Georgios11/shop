import axios from '../api/axios';
import { AxiosError } from 'axios';
import { ApiResponse } from '../types/apiResponse';
import { CategoriesResponse, Category } from '../types/category';

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response =
      await axios.get<ApiResponse<CategoriesResponse>>('/open/categories');

    return response.data.data.categories;
  } catch (error) {
    if (error instanceof AxiosError) {
      const responseData = error.response?.data as
        | ApiResponse<CategoriesResponse>
        | undefined;
      const errorMessage =
        responseData?.message || 'An error occurred while fetching categories';
      throw new Error(errorMessage);
    }
    throw new Error('An error occurred while fetching categories');
  }
};
