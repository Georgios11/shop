import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useForgotPassword } from '../../hooks/useForgotPassword';
import { Input } from '../../styles/LoginStyles';
import Form from '../../ui/Form';
import FormRow from '../../ui/FormRow';
import ButtonText from '../../ui/ButtonText';
import ButtonGroup from '../../ui/ButtonGroup';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordForm = (): React.ReactElement => {
  const navigate = useNavigate();
  const { handleForgotPassword, isSubmitting } = useForgotPassword();

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData): Promise<void> => {
    try {
      await handleForgotPassword(data.email);
    } catch {
      // Error is already handled by the hook
    } finally {
      reset();
    }
  };

  const handleBackToLogin = (): void => {
    void navigate('/login');
  };

  const handleFormSubmitWrapper = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    void handleFormSubmit(onSubmit)(e);
  };

  return (
    <Form onSubmit={handleFormSubmitWrapper}>
      <div>
        <p>
          Enter your email address and we&apos;ll send you instructions to reset
          your password.
        </p>
      </div>

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

      <ButtonGroup>
        <ButtonText type="submit" disabled={isSubmitting}>
          <span>{isSubmitting ? 'Sending...' : 'Send Reset Instructions'}</span>
        </ButtonText>
        <ButtonText type="button" onClick={handleBackToLogin}>
          <span>Back to Login</span>
        </ButtonText>
      </ButtonGroup>
    </Form>
  );
};

export default ForgotPasswordForm;
