import axios from '../api/axios';
import { AxiosError } from 'axios';
import { ApiResponse } from '../types/apiResponse';
import { Product } from '../types/product';

// API data shape
interface ProductsApiData {
  products: Product[];
}

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const response =
      await axios.get<ApiResponse<ProductsApiData>>('/open/products');
    return response.data.data.products;
  } catch (error) {
    if (error instanceof AxiosError) {
      const responseData = error.response?.data as
        | ApiResponse<ProductsApiData>
        | undefined;
      const errorMessage =
        responseData?.message || 'An error occurred while fetching products';
      throw new Error(errorMessage);
    }
    throw new Error('An error occurred while fetching products');
  }
};
