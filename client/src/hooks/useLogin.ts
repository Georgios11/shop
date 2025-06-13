import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser } from '../services/userServices';
import { LoginData, User } from '../types/user';
import { ApiError } from '../types/error';

const useLogin = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: logIn, isPending: isLoggingIn } = useMutation<
    User,
    ApiError,
    LoginData
  >({
    mutationFn: loginUser,
    onSuccess: (user) => {
      // Cache the logged-in user globally with custom stale and cache times
      queryClient.setQueryData(['hasLoggedOut'], false);
      queryClient.setQueryData(['currentUser'], user);
      queryClient.setQueryDefaults(['currentUser'], {
        staleTime: Infinity, // Data is always fresh
        gcTime: 1000 * 60 * 60 * 24, // Keep cached data for 24 hours
        initialData: null, // Ensure there's always a value (null when logged out)
      });
    },
    onError: (error) => {
      throw error;
    },
  });

  return { logIn, isLoggingIn };
};

export default useLogin;
