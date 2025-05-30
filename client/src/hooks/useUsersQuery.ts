import { useQuery } from '@tanstack/react-query';
import { getAllUsersService, UserResponse } from '../services/adminServices';
import { ApiError } from '../types/error';
import { User } from '../types/user';

const convertToUser = (userResponse: UserResponse): User => ({
  _id: userResponse._id,
  name: userResponse.name,
  email: userResponse.email,
  phone: userResponse.phone || '',
  role: userResponse.role,
  isActive: !userResponse.is_banned, // Map is_banned to isActive
  is_banned: userResponse.is_banned,
  createdAt: userResponse.createdAt,
  updatedAt: userResponse.updatedAt,
  image: userResponse.image,
  imagePublicId: userResponse.imagePublicId,
});

const useUsersQuery = () => {
  const {
    data: users,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
    error,
  } = useQuery<UserResponse[], ApiError, User[]>({
    queryKey: ['users'],
    queryFn: getAllUsersService,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    // Convert UserResponse[] to User[] and provide fallback empty array
    select: (data) => (data || []).map(convertToUser),
  });

  return {
    data: users || [], // Provide fallback empty array
    isUsersLoading,
    isUsersFetching,
    error,
  };
};

export default useUsersQuery;
