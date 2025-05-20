import axios from '../api/axios';
import { AxiosError } from 'axios';
import { ApiResponse } from '../types/apiResponse';

interface SeedResponse {
  message: string;
}

export const seedData = async (): Promise<string> => {
  try {
    const response = await axios.post<ApiResponse<SeedResponse>>('/seed');
    return response.data.data.message;
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
