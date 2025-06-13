import { useQuery } from '@tanstack/react-query';
import { getOrdersService } from '../services/adminServices';
import type { OrderResponse } from '../types/order';

const useOrdersQuery = () => {
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    isFetching: isOrdersFetching,
    error,
  } = useQuery<OrderResponse[], Error>({
    queryKey: ['orders'],
    queryFn: getOrdersService as () => Promise<OrderResponse[]>,
  });

  return { orders, isOrdersLoading, isOrdersFetching, error };
};

export default useOrdersQuery;
