/* eslint-disable no-unused-vars */
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Heading from '../ui/Heading';
import useLogin from '../hooks/useLogin';
import useRefreshToken from '../hooks/useRefreshToken';
import { Section, RegisterPrompt } from '../styles/LoginStyles';
import LoginForm from '../components/forms/LoginForm';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '../types/user';

interface LoginData {
  email: string;
  password: string;
}

interface RefreshResponse {
  message: string;
}

const INITIAL_REFRESH_DELAY = 10 * 1000; // 10 seconds
const REFRESH_TOKEN_INTERVAL = 58 * 60 * 1000; // 58 minutes

const Login = () => {
  const navigate = useNavigate();
  const refreshToken = useRefreshToken();
  const { logIn, isLoggingIn } = useLogin();
  const queryClient = useQueryClient();

  const handleLogin = async (data: LoginData): Promise<void> => {
    const user = await logIn(data);
    toast.success(`Welcome ${user.name}`);
    void navigate(`/${user.role}`);
    // Initial token refresh after 10 seconds
    const initialRefreshTimeout = setTimeout(() => {
      void (async () => {
        const currentUser = queryClient.getQueryData<User>(['currentUser']);

        //do not refresh token if user has logged out immediately after login
        if (!currentUser) {
          toast.error('Refresh token aborted');
          return;
        }
        try {
          const response = (await refreshToken()) as RefreshResponse;
          toast.success(response.message);

          // Set up recurring token refresh every 58 minutes
          const refreshInterval = setInterval(() => {
            void (async () => {
              try {
                const response = (await refreshToken()) as RefreshResponse;
                toast.success(response.message);
              } catch {
                clearInterval(refreshInterval);
                void navigate('/login');
              }
            })();
          }, REFRESH_TOKEN_INTERVAL);

          // Clean up interval and timeout when component unmounts
          return () => {
            clearInterval(refreshInterval);
            clearTimeout(initialRefreshTimeout);
          };
        } catch {
          // Error handling is now in the hook
          clearTimeout(initialRefreshTimeout);
        }
      })();
    }, INITIAL_REFRESH_DELAY);
  };

  return (
    <Section data-testid="login-page">
      <Heading as="h2">Login</Heading>
      <LoginForm onLogin={handleLogin} isLoggingIn={isLoggingIn} />
      <RegisterPrompt>
        <p>New user?</p>
        <Link to="/register">
          <Heading as="h3">Register</Heading>
        </Link>
      </RegisterPrompt>
    </Section>
  );
};

export default Login;
