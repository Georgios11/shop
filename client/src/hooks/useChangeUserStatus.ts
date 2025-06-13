import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  changeUserStatusService,
  UserResponse,
} from '../services/adminServices';
import { User } from '../types/user';
import { ApiError } from '../types/error';
import { ApiResponse } from '../types/apiResponse';

// Add the convertToUser function
const convertToUser = (userResponse: UserResponse): User => ({
  _id: userResponse._id,
  name: userResponse.name,
  email: userResponse.email,
  phone: userResponse.phone || '',
  role: userResponse.role,
  isActive: !userResponse.is_banned,
  is_banned: userResponse.is_banned,
  createdAt: userResponse.createdAt,
  updatedAt: userResponse.updatedAt,
  image: userResponse.image,
  imagePublicId: userResponse.imagePublicId,
});

interface MutationContext {
  previousUsers: User[] | undefined;
}

export const useChangeUserStatus = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: changeUserStatus, isPending: isLoading } = useMutation<
    ApiResponse<UserResponse>,
    ApiError,
    string,
    MutationContext
  >({
    mutationFn: changeUserStatusService,
    onMutate: async (userId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData<User[]>(['users']);

      // Optimistically update the users list
      queryClient.setQueryData<User[]>(['users'], (old) => {
        if (!old) return old;
        return old.map((user) => {
          if (user._id === userId) {
            // Toggle the role between 'user' and 'admin'
            return {
              ...user,
              role: user.role === 'user' ? 'admin' : 'user',
            };
          }
          return user;
        });
      });

      // Return context with the previous users
      return { previousUsers };
    },
    onError: (_error: ApiError, _, context) => {
      // Rollback to the previous value if there's an error
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
    },
    onSuccess: (response) => {
      queryClient.setQueryData<User[]>(
        ['users'],
        (old: User[] | undefined): User[] | undefined => {
          if (!old) return old;
          return old.map(
            (user: User): User =>
              user._id === response.data._id
                ? convertToUser(response.data)
                : user
          );
        }
      );
    },
  });

  return { changeUserStatus, isLoading };
};
