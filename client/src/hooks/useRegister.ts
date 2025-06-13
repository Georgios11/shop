import { registerUserService } from '../services/userServices';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../types/error';
import { ApiResponse } from '../types/apiResponse';

const useRegister = () => {
  const { mutateAsync: registerUser, isPending: isRegistering } = useMutation<
    ApiResponse<null>,
    ApiError,
    FormData
  >({
    mutationFn: registerUserService,
    onSuccess: (response) => {
      return response;
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('An unexpected error occurred during registration');
    },
  });

  return { registerUser, isRegistering };
};

export default useRegister;
