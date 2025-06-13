import { deleteAccountService } from '../services/userServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from '../types/apiResponse';

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteAccount, isPending } = useMutation<
    ApiResponse<null>,
    Error,
    void
  >({
    mutationFn: deleteAccountService,
    onSuccess: (response) => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.setQueryData(['hasLoggedOut'], true);
      return response;
    },
    onError: (error: Error) => {
      throw error;
    },
  });

  return {
    deleteAccount,
    isLoading: isPending,
  };
};
