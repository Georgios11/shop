import axios from '../api/axios';
import { AxiosError } from 'axios';
import { ApiResponse } from '../types/apiResponse';
import { User } from '../types/user';
import { Product } from '../types/product';
import { Category } from '../types/category';
import { Order } from '../types/order';

export interface SeedResponse {
  data: {
    users: User[];
    products: Product[];
    categories: Category[];
    orders: Order[];
  };
}

export const seedData = async (): Promise<ApiResponse<SeedResponse>> => {
  try {
    const response = await axios.post<ApiResponse<SeedResponse>>('/seed');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const responseData = error.response?.data as
        | ApiResponse<SeedResponse>
        | undefined;
      const errorMessage =
        responseData?.message || 'An error occurred during seeding';
      throw new Error(errorMessage);
    }
    throw new Error('An error occurred during seeding');
  }
};
