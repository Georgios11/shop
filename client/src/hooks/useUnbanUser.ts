import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unbanUserService, UserResponse } from '../services/adminServices';
import { ApiError } from '../types/error';
import { ApiResponse } from '../types/apiResponse';

interface MutationContext {
  previousUsers: UserResponse[] | undefined;
}

export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: unbanUser, isPending: isLoading } = useMutation<
    ApiResponse<UserResponse>,
    ApiError,
    string,
    MutationContext
  >({
    mutationFn: (userId: string) => unbanUserService(userId),
    onMutate: async (userId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData<UserResponse[]>(['users']);

      // Optimistically update the users data
      queryClient.setQueryData<UserResponse[]>(['users'], (old) => {
        if (!old) return old;
        return old.map((user) =>
          user._id === userId ? { ...user, is_banned: false } : user
        );
      });

      // Return context with the previous users
      return { previousUsers };
    },
    onError: (err, _userId, context) => {
      // Rollback to the previous value if there's an error
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError('An unexpected error occurred while unbanning user');
    },
    onSuccess: (response) => {
      // Update the users cache with the updated user
      queryClient.setQueryData<UserResponse[]>(['users'], (old) => {
        if (!old) return old;
        return old.map((user) =>
          user._id === response.data._id ? response.data : user
        );
      });
    },
  });

  return { unbanUser, isLoading };
};
