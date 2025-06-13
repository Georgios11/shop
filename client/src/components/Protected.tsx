import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useCurrentUser from '../hooks/useCurrentUser';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface User {
  role: string;
  // Add other user properties as needed
}

interface ProtectedProps {
  allowedRoles: string[];
}

const Protected = ({
  allowedRoles,
}: ProtectedProps): React.ReactElement | null => {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser() as User | null;
  const navigate = useNavigate();
  const location = useLocation();
  const hasLoggedOut = queryClient.getQueryData<boolean>(['hasLoggedOut']);

  useEffect(() => {
    if (!currentUser) {
      if (!hasLoggedOut) {
        toast.error('Please log in');
        queryClient.setQueryData(['hasLoggedOut'], true); // Set to true after showing toast
      }
      void navigate('/login');
    } else if (!allowedRoles.includes(currentUser.role)) {
      toast.error('Administrator access only');
      void navigate('/forbidden', {
        state: {
          status: 401,
          message: 'Administrator access only',
          from: location.pathname,
        },
      });
    }
  }, [
    currentUser,
    allowedRoles,
    navigate,
    hasLoggedOut,
    queryClient,
    location,
  ]);

  if (currentUser && allowedRoles.includes(currentUser.role)) {
    return <Outlet />;
  }

  return null;
};

export default Protected;
