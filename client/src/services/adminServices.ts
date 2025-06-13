import { axiosPrivate } from '../api/axios';
import { AxiosError } from 'axios';
import type { DeleteCategoryResponse } from '../types/category';
import type {
  CreateProductData,
  DeleteProductResponse,
  Product,
} from '../types/product';
import { ApiResponse } from '../types/apiResponse';
import { OrderResponse, OrdersResponse } from '../types/order';

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  is_banned: boolean;
  image: string;
  imagePublicId: string;
  favorites: string[];
  orders: string[];
  cart: {
    user: string | null;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      image: string;
    }[];
    totalPrice: number;
    status: string;
    userType: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: UserResponse[];
}

export const createProductService = async (
  productData: CreateProductData
): Promise<ApiResponse<Product>> => {
  const formData = new FormData();

  (Object.keys(productData) as Array<keyof CreateProductData>).forEach(
    (key) => {
      if (key === 'image') {
        formData.append('image', productData[key][0]);
      } else if (key === 'category') {
        formData.append('category', productData[key].name);
      } else {
        formData.append(key, String(productData[key]));
      }
    }
  );

  try {
    const response = await axiosPrivate.post<ApiResponse<Product>>(
      '/admin/products',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<Product>>;
    const errorMessage =
      axiosError.response?.data?.message || 'Failed to create product';
    throw new Error(errorMessage);
  }
};

export async function updateProductService(
  productId: string,
  data: Partial<CreateProductData>
): Promise<ApiResponse<{ updatedProduct: Product }>> {
  const formData = new FormData();

  (Object.keys(data) as Array<keyof CreateProductData>).forEach((key) => {
    if (key === 'image') {
      if (data[key]?.[0]) {
        formData.append('image', data[key][0]);
      }
    } else if (key === 'category') {
      formData.append('category', JSON.stringify(data[key]));
    } else {
      formData.append(key, String(data[key]));
    }
  });

  try {
    const response = await axiosPrivate.put<
      ApiResponse<{ updatedProduct: Product }>
    >(`/admin/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<
      ApiResponse<{ updatedProduct: Product }>
    >;
    const errorMessage =
      axiosError.response?.data?.message || 'Failed to update product';
    throw new Error(errorMessage);
  }
}

export const deleteProductService = async (
  productId: string
): Promise<ApiResponse<DeleteProductResponse>> => {
  try {
    const response = await axiosPrivate.delete<
      ApiResponse<DeleteProductResponse>
    >(`/admin/products/${productId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<DeleteProductResponse>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      'An error occurred while deleting the product';
    throw new Error(errorMessage);
  }
};

export const getAllUsersService = async (): Promise<UserResponse[]> => {
  try {
    const response =
      await axiosPrivate.get<ApiResponse<UsersResponse>>('/admin/users');
    return response.data.data.users;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<UsersResponse>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      'An error occurred while fetching users';
    throw new Error(errorMessage);
  }
};

export const deleteUserService = async (
  userId: string
): Promise<ApiResponse<UserResponse>> => {
  try {
    const response = await axiosPrivate.delete<ApiResponse<UserResponse>>(
      `/admin/users/${userId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<UserResponse>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      'An error occurred while deleting the user';
    throw new Error(errorMessage);
  }
};

export const banUserService = async (
  userId: string
): Promise<ApiResponse<UserResponse>> => {
  try {
    const response = await axiosPrivate.put<ApiResponse<UserResponse>>(
      `/admin/users/ban-user/${userId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<UserResponse>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      'An error occurred while banning the user';
    throw new Error(errorMessage);
  }
};

export const unbanUserService = async (
  userId: string
): Promise<ApiResponse<UserResponse>> => {
  try {
    const response = await axiosPrivate.put<ApiResponse<UserResponse>>(
      `/admin/users/unbann-user/${userId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<UserResponse>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      'An error occurred while unbanning the user';
    throw new Error(errorMessage);
  }
};

export const changeUserStatusService = async (
  userId: string
): Promise<ApiResponse<UserResponse>> => {
  try {
    const response = await axiosPrivate.put<ApiResponse<UserResponse>>(
      `/admin/users/change-user-status/${userId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<UserResponse>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      'An error occurred while changing user status';
    throw new Error(errorMessage);
  }
};

export const getOrdersService = async (): Promise<OrderResponse[]> => {
  try {
    const response =
      await axiosPrivate.get<ApiResponse<OrdersResponse>>('/admin/orders');
    return response.data.data.orders;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<OrdersResponse>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      'An error occurred while fetching orders';
    throw new Error(errorMessage);
  }
};

export const deleteCategoryService = async (
  categoryId: string
): Promise<ApiResponse<DeleteCategoryResponse>> => {
  try {
    const response = await axiosPrivate.delete<
      ApiResponse<DeleteCategoryResponse>
    >(`/admin/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<DeleteCategoryResponse>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      'An error occurred while deleting the category';
    throw new Error(errorMessage);
  }
};
