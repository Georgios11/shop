import { AxiosError } from 'axios';
import axiosPrivate from '../api/axios';
import { ApiError, ApiErrorResponse } from '../types/error';
import { LoginData, ResetPasswordData } from '../types/user';
import { Order } from '../types/order';

import { ApiResponse } from '../types/apiResponse';
import { User } from '../types/user';

export const loginUser = async (credentials: LoginData): Promise<User> => {
  try {
    const response = await axiosPrivate.post<ApiResponse<{ user: User }>>(
      '/open/login',
      credentials
    );
    return response.data.data.user;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ApiErrorResponse | undefined;
      const message =
        errorData?.message || error.message || 'An error occurred during login';
      const status = errorData?.status || error.response?.status || 500;
      throw new ApiError(message, status);
    }
    throw new ApiError('An unexpected error occurred during login');
  }
};

export const logoutUser = async (): Promise<ApiResponse<null>> => {
  try {
    const response =
      await axiosPrivate.post<ApiResponse<null>>('/users/logout');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ApiErrorResponse | undefined;
      throw new ApiError(
        errorData?.message || 'An error occurred during logout'
      );
    }
    throw new ApiError('An unexpected error occurred during logout');
  }
};

export const registerUserService = async (
  userData: FormData
): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosPrivate.post<ApiResponse<null>>(
      '/open/register',
      userData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ApiErrorResponse | undefined;
      throw new ApiError(
        errorData?.message || 'An error occurred during registration'
      );
    }
    throw new ApiError('An unexpected error occurred during registration');
  }
};

export const activateAccountService = async (
  token: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosPrivate.post<ApiResponse<null>>(
      `/open/verify-email`,
      { token }
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ApiErrorResponse | undefined;
      throw new ApiError(
        errorData?.message || 'An error occurred during account activation'
      );
    }
    throw new ApiError(
      'An unexpected error occurred during account activation'
    );
  }
};

export const forgotPasswordService = async (
  email: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosPrivate.post<ApiResponse<null>>(
      '/open/forget-password',
      { email }
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ApiErrorResponse | undefined;
      throw new ApiError(
        errorData?.message || 'An error occurred during password reset request'
      );
    }
    throw new ApiError(
      'An unexpected error occurred during password reset request'
    );
  }
};

export const resetPasswordService = async (
  data: ResetPasswordData
): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosPrivate.post<ApiResponse<null>>(
      '/open/reset-password',
      {
        token: data.token,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ApiErrorResponse | undefined;
      throw new ApiError(
        errorData?.message || 'An error occurred during password reset'
      );
    }
    throw new ApiError('An unexpected error occurred during password reset');
  }
};

export const getAllUsersService = async (): Promise<User[]> => {
  try {
    const response =
      await axiosPrivate.get<ApiResponse<{ users: User[] }>>('/users');
    return response.data.data.users;
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(
        errorData.message || 'Failed to fetch users',
        errorData.status
      );
    }
    throw new ApiError('Failed to fetch users');
  }
};

export const deleteUserService = async (userId: string): Promise<void> => {
  try {
    await axiosPrivate.delete<ApiResponse<null>>(`/users/${userId}`);
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(
        errorData.message || 'Failed to delete user',
        errorData.status
      );
    }
    throw new ApiError('Failed to delete user');
  }
};

export const addToCartService = async (
  productId: string
): Promise<ApiResponse<User>> => {
  try {
    const response = await axiosPrivate.post<ApiResponse<User>>(
      `/products/${productId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(
        errorData.message || 'An error occurred while adding to cart'
      );
    }
    throw new ApiError('An unexpected error occurred while adding to cart');
  }
};

export const removeFromCartService = async (
  productId: string
): Promise<ApiResponse<User>> => {
  try {
    const response = await axiosPrivate.delete<ApiResponse<User>>(
      `/products/${productId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(
        errorData.message || 'An error occurred while removing from cart'
      );
    }
    throw new ApiError('An unexpected error occurred while removing from cart');
  }
};

export const placeOrderService = async (): Promise<
  ApiResponse<{ order: Order }>
> => {
  try {
    const response =
      await axiosPrivate.post<ApiResponse<{ order: Order }>>('/products/order');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(
        errorData.message || 'An error occurred while placing the order'
      );
    }
    throw new ApiError('An unexpected error occurred while placing order');
  }
};

export const getUserOrdersService = async (): Promise<Order[]> => {
  try {
    const response =
      await axiosPrivate.get<ApiResponse<{ orders: Order[] }>>('/users/orders');

    return response.data.data.orders;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(
        errorData.message || 'An error occurred while fetching your orders'
      );
    }
    throw new ApiError(
      'An unexpected error occurred while fetching your orders'
    );
  }
};

export const getOrderByIdService = async (orderId: string): Promise<Order> => {
  try {
    const response = await axiosPrivate.get<ApiResponse<{ order: Order }>>(
      `/users/orders/${orderId}`
    );

    return response.data.data.order;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(
        errorData.message || `An error occurred while fetching order ${orderId}`
      );
    }
    throw new ApiError(
      `An unexpected error occurred while fetching order ${orderId}`
    );
  }
};

export const addFavoriteService = async (
  productId: string
): Promise<ApiResponse<User>> => {
  try {
    const response = await axiosPrivate.post<ApiResponse<User>>(
      `/users/add-favorite/${productId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(
        errorData.message || 'An error occurred while adding to favorites'
      );
    }
    throw new ApiError(
      'An unexpected error occurred while adding to favorites'
    );
  }
};

export const removeFavoriteService = async (
  productId: string
): Promise<ApiResponse<User>> => {
  try {
    const response = await axiosPrivate.delete<ApiResponse<User>>(
      `/users/delete-favorite/${productId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(
        errorData.message || 'An error occurred while removing from favorites'
      );
    }
    throw new ApiError(
      'An unexpected error occurred while removing from favorites'
    );
  }
};

export const updateUserService = async (
  formData: FormData
): Promise<ApiResponse<User>> => {
  try {
    const response = await axiosPrivate.put<ApiResponse<User>>(
      '/users/update-user',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(
        errorData.message || 'An error occurred while updating profile'
      );
    }
    throw new ApiError('An unexpected error occurred while updating profile');
  }
};

export const refreshTokenService = async (): Promise<
  ApiResponse<{ accessToken: string }>
> => {
  try {
    const response = await axiosPrivate.post<
      ApiResponse<{ accessToken: string }>
    >('/users/refresh-token');

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(errorData.message || 'Failed to refresh token');
    }
    throw new ApiError('An unexpected error occurred while refreshing token');
  }
};

export const unbanUserService = async (userId: string): Promise<void> => {
  try {
    await axiosPrivate.patch<ApiResponse<null>>(`/users/${userId}/unban`);
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(
        errorData.message || 'Failed to unban user',
        errorData.status
      );
    }
    throw new ApiError('Failed to unban user');
  }
};

export const changeUserStatusService = async (
  userId: string,
  status: string
): Promise<void> => {
  try {
    await axiosPrivate.patch<ApiResponse<null>>(`/users/${userId}/status`, {
      status,
    });
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new ApiError(
        errorData.message || 'Failed to change user status',
        errorData.status
      );
    }
    throw new ApiError('Failed to change user status');
  }
};

export const deleteAccountService = async (): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosPrivate.delete<ApiResponse<null>>(
      '/users/delete-account'
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ApiErrorResponse | undefined;
      throw new ApiError(
        errorData?.message || 'An error occurred while deleting account',
        errorData?.status
      );
    }
    throw new ApiError('An error occurred while deleting account');
  }
};
