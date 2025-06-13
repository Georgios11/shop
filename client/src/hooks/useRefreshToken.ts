import { useMutation } from '@tanstack/react-query';
import { refreshTokenService } from '../services/userServices';

const useRefreshToken = () => {
  const { mutateAsync: refreshToken } = useMutation({
    mutationFn: refreshTokenService,
    onSuccess: (data) => {
      return data.message;
    },
    onError: (error) => {
      throw error;
    },
  });

  return refreshToken;
};

export default useRefreshToken;
