import { useQuery } from '@tanstack/react-query';
import { CurrentUser } from '../types/user';

const useCurrentUser = () => {
  const { data: currentUser } = useQuery<CurrentUser | null>({
    queryKey: ['currentUser'],
    queryFn: () => Promise.resolve(null),
    initialData: null,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return currentUser;
};

export default useCurrentUser;
