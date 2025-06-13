import { useMutation } from '@tanstack/react-query';
import { activateAccountService } from '../services/userServices';
import { ApiError } from '../types/error';
import { ApiResponse } from '../types/apiResponse';

const useActivate = () => {
  const {
    mutateAsync: activate,
    isPending: isActivating,
    isError: isActivatingError,
  } = useMutation<ApiResponse<null>, ApiError, string>({
    mutationFn: async (token: string) => {
      return await activateAccountService(token);
    },
  });

  return { activate, isActivating, isActivatingError };
};

export default useActivate;
