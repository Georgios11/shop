import { useMutation, useQueryClient } from '@tanstack/react-query';
import { banUserService, UserResponse } from '../services/adminServices';
import { toast } from 'react-hot-toast';

import { ApiError } from '../types/error';
import { User } from '../types/user';
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

export const useBanUser = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: banUser, isPending: isLoading } = useMutation<
    ApiResponse<UserResponse>,
    ApiError,
    string,
    MutationContext
  >({
    mutationFn: banUserService,
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previousUsers = queryClient.getQueryData<User[]>(['users']);

      queryClient.setQueryData<User[]>(['users'], (old) => {
        if (!old) return old;
        return old.map((user) =>
          user._id === userId
            ? { ...user, is_banned: true, isActive: false }
            : user
        );
      });

      return { previousUsers };
    },
    onError: (error: ApiError, _, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      toast.error(error.message);
    },
    onSuccess: (response) => {
      queryClient.setQueryData<User[]>(['users'], (old) => {
        if (!old) return old;
        return old.map((user) =>
          user._id === response.data._id ? convertToUser(response.data) : user
        );
      });
      toast.success('User banned successfully');
    },
  });

  return { banUser, isLoading };
};

export default useBanUser;
