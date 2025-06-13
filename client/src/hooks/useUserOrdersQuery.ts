import { useQuery } from '@tanstack/react-query';
import { getUserOrdersService } from '../services/userServices';
import { Order } from '../types/order';
import { ApiError } from '../types/error';

/**
 * Hook for fetching the current user's order history
 */
const useUserOrdersQuery = () => {
  const {
    data: userOrders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Order[], ApiError>({
    queryKey: ['userOrders'],
    queryFn: getUserOrdersService as () => Promise<Order[]>,
  });

  return {
    userOrders,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useUserOrdersQuery;
