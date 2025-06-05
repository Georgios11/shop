import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../../styles/LoginStyles';
import Form from '../../ui/Form';
import FormRow from '../../ui/FormRow';
import ButtonText from '../../ui/ButtonText';
import ButtonGroup from '../../ui/ButtonGroup';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onLogin: (data: LoginFormData) => Promise<void>;
  isLoggingIn: boolean;
}

interface CustomError extends Error {
  status?: number;
}

const LoginForm = ({
  onLogin,
  isLoggingIn,
}: LoginFormProps): React.ReactElement => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      await onLogin(data);
    } catch (error) {
      const customError = error as CustomError;
      toast.error(customError.message);
      if (customError.status === 403) {
        void navigate('/forbidden', {
          state: { status: customError.status, message: customError.message },
        });
      }
    } finally {
      reset();
    }
  };

  const handleForgotPassword = (): void => {
    void navigate('/forgot-password');
  };

  const handleFormSubmitWrapper = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    void handleFormSubmit(onSubmit)(e);
  };

  return (
    <Form onSubmit={handleFormSubmitWrapper}>
      <FormRow>
        <div>
          <Input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            id="email"
            placeholder="Email"
            type="email"
            autoFocus
          />
          {errors.email && (
            <span style={{ color: 'red' }}>{errors.email.message}</span>
          )}
        </div>
      </FormRow>
      <FormRow>
        <div>
          <Input
            {...register('password', {
              required: 'Password is required',
            })}
            id="password"
            placeholder="Password"
            type="password"
          />
          {errors.password && (
            <span style={{ color: 'red' }}>{errors.password.message}</span>
          )}
        </div>
      </FormRow>
      <ButtonGroup>
        <ButtonText type="submit" disabled={isLoggingIn}>
          <span>{isLoggingIn ? 'Logging in...' : 'Log In'}</span>
        </ButtonText>
        <ButtonText type="button" onClick={handleForgotPassword}>
          <span>Forgot Password?</span>
        </ButtonText>
      </ButtonGroup>
    </Form>
  );
};

export default LoginForm;
