import { useQuery } from '@tanstack/react-query';
import { getOrderByIdService } from '../services/userServices';
import { Order } from '../types/order';
import { ApiError } from '../types/error';

/**
 * Hook for fetching a specific order by ID
 * @param orderId The ID of the order to fetch
 * @param enabled Whether the query should auto-execute (defaults to true if orderId exists)
 */
const useOrderQuery = (orderId?: string, enabled?: boolean) => {
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Order, ApiError>({
    queryKey: ['order', orderId],
    queryFn: () => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      return getOrderByIdService(orderId);
    },
    enabled: enabled !== undefined ? enabled : !!orderId,
  });

  return {
    order,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useOrderQuery;
