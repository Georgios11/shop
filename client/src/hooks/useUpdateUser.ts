import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserService } from '../services/userServices';
import { ApiError } from '../types/error';
import { CurrentUser, User } from '../types/user';
import { ApiResponse } from '../types/apiResponse';
import { toast } from 'react-hot-toast';

interface UpdateUserResponse {
  updatedUser: CurrentUser;
  users: User[];
}

interface MutationContext {
  previousUser: CurrentUser | null | undefined;
}

/**
 * Converts a User object to a CurrentUser object by ensuring all required fields have default values
 * @param user - The User object to convert
 * @returns A CurrentUser object with default values for optional fields
 *
 * Default values:
 * - phone: Empty string if not provided
 * - isActive: False if not provided (using nullish coalescing)
 * - createdAt: Current timestamp if not provided
 * - updatedAt: Current timestamp if not provided
 * - favorites: Empty array if not provided
 */
const convertToCurrentUser = (user: User): CurrentUser => ({
  ...user,
  phone: user.phone || '',
  isActive: user.isActive ?? false,
  createdAt: user.createdAt || new Date().toISOString(),
  updatedAt: user.updatedAt || new Date().toISOString(),
  favorites: user.favorites || [],
});

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' && obj !== null && '_id' in obj && 'email' in obj
  );
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateUser, isPending: isUpdating } = useMutation<
    ApiResponse<UpdateUserResponse>,
    ApiError,
    FormData,
    MutationContext
  >({
    mutationFn: async (formData) => {
      const response = await updateUserService(formData);
      const userData =
        (response.data as { updatedUser?: User })?.updatedUser ?? response.data;
      const safeUser: User = isUser(userData) ? userData : ({} as User);
      return {
        ok: response.ok,
        message: response.message,
        data: {
          updatedUser: convertToCurrentUser(safeUser),
          users: (await queryClient.getQueryData(['users'])) || [],
        },
        status: response.status,
      };
    },
    onMutate: async (formData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currentUser'] });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData<CurrentUser>([
        'currentUser',
      ]);

      if (!previousUser) {
        return { previousUser: null };
      }

      // Create optimistic user update
      const optimisticUser = { ...previousUser };

      // Update only non-password fields optimistically
      const phone = formData.get('phone');
      if (phone) {
        optimisticUser.phone = phone as string;
      }

      // Optimistically update the image field
      const image = formData.get('image');
      if (image && typeof image === 'string') {
        optimisticUser.image = image;
      } else if (image instanceof File) {
        // If you use a preview URL for the image, you can do:
        optimisticUser.image = URL.createObjectURL(image);
      }

      // Optimistically update the UI
      queryClient.setQueryData(['currentUser'], optimisticUser);

      // Return context with snapshotted value
      return { previousUser };
    },
    onError: (err: unknown, _, context) => {
      // Rollback to the previous value on error
      if (context?.previousUser) {
        queryClient.setQueryData(['currentUser'], context.previousUser);
      }
      let errorMessage = 'An unexpected error occurred while updating user';
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      }
      toast.error(errorMessage);
    },
    onSuccess: (response) => {
      if (
        response.message ===
        'Since you have changed your password, you will be logged out'
      ) {
        queryClient.setQueryData(['hasLoggedOut'], true);
        queryClient.setQueryData(['currentUser'], null);
        queryClient.setQueryData(['users'], response.data.users);
      } else {
        queryClient.setQueryData(['currentUser'], response.data.updatedUser);
        queryClient.setQueryData(['users'], response.data.users);
      }
      return response;
    },
    onSettled: () => {
      toast.success('Profile updated successfully');
    },
  });

  return { updateUser, isUpdating };
};

export default useUpdateUser;
