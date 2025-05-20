import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUserService, UserResponse } from '../services/adminServices';
import { ApiResponse } from '../types/apiResponse';

interface DeleteUserContext {
  previousUsers: UserResponse[] | undefined;
}

const useDeleteUser = () => {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutateAsync: deleteUser } = useMutation<
    ApiResponse<UserResponse>,
    Error,
    string,
    DeleteUserContext
  >({
    mutationFn: deleteUserService,
    onMutate: async (userId) => {
      // Cancel ongoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Take a snapshot of the current cache
      const previousUsers = queryClient.getQueryData<UserResponse[]>(['users']);

      // Optimistically update the cache by removing the user
      queryClient.setQueryData<UserResponse[]>(['users'], (old) =>
        old ? old.filter((user) => user._id !== userId) : []
      );

      // Return the snapshot for potential rollback
      return { previousUsers };
    },
    onError: (_error, _userId, context) => {
      // Rollback to the previous cache state if an error occurs
      if (context) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
    },
    onSuccess: (response) => {
      // Update the users cache with the new data
      // Note: The response from deleteUserService contains a single user, not an array
      // So we need to update the cache by filtering out the deleted user
      queryClient.setQueryData<UserResponse[]>(['users'], (old) =>
        old ? old.filter((user) => user._id !== response.data._id) : []
      );
    },
  });

  return { isDeleting, deleteUser };
};

export { useDeleteUser };
