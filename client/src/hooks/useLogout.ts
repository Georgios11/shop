import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logoutUser } from '../services/userServices';
import { ApiResponse } from '../types/apiResponse';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { ApiError } from '../types/error';

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync: logOut, isSuccess } = useMutation<
    ApiResponse<null>,
    ApiError,
    void
  >({
    mutationFn: logoutUser,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.setQueryData(['currentUser'], null);
      queryClient.setQueryData(['hasLoggedOut'], true);
    },
    onError: (error) => {
      toast.error(error.message);
      console.error('Logout failed:', error);
    },
  });

  useEffect(() => {
    if (isSuccess) {
      // Navigate to home page after logout with a small delay for toast visibility
      void setTimeout(() => {
        void navigate('/');
      }, 500);
    }
  }, [isSuccess, navigate]);

  return logOut;
};

export default useLogout;
