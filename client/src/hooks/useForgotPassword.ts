import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordService } from '../services/userServices';
import toast from 'react-hot-toast';
import { ApiError } from '../types/error';
import { ApiResponse } from '../types/apiResponse';

export const useForgotPassword = () => {
  const navigate = useNavigate();

  const { mutateAsync: handleForgotPassword, isPending: isSubmitting } =
    useMutation<ApiResponse<null>, ApiError, string>({
      mutationFn: forgotPasswordService,
      onSuccess: (response) => {
        toast.success(response.message);
        void navigate('/login');
      },
      onError: (error) => {
        toast.error(error.message);
        void navigate('/login');
      },
    });

  return { handleForgotPassword, isSubmitting };
};
