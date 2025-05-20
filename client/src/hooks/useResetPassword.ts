import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resetPasswordService } from '../services/userServices';
import { ApiError } from '../types/error';
import { ResetPasswordData } from '../types/user';
import { ApiResponse } from '../types/apiResponse';

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: resetPassword, isPending: isResetting } = useMutation<
    ApiResponse<null>,
    ApiError,
    ResetPasswordData,
    undefined
  >({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await resetPasswordService(data);
      return response;
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      return response;
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        'An unexpected error occurred while resetting password'
      );
    },
  });

  return { resetPassword, isResetting };
};

export default useResetPassword;
