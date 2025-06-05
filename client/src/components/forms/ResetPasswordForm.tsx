import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useResetPassword } from '../../hooks/useResetPassword';
import { Input } from '../../styles/LoginStyles';
import Form from '../../ui/Form';
import FormRow from '../../ui/FormRow';
import ButtonText from '../../ui/ButtonText';
import ButtonGroup from '../../ui/ButtonGroup';
import { ResetPasswordData } from '../../types/user';
import toast from 'react-hot-toast';

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, isResetting } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordData>({
    defaultValues: {
      token: token || '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      await resetPassword(data);
      toast.success('Password reset successfully');
      void navigate('/login');
    } catch (error) {
      // Error is handled by the hook
      console.error('Reset password error:', error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    void handleSubmit(onSubmit)(e);
  };

  return (
    <Form onSubmit={handleFormSubmit}>
      <FormRow>
        <div>
          <Input
            type="password"
            {...register('newPassword', {
              required: 'New password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
            placeholder="New Password"
          />
          {errors.newPassword && (
            <span style={{ color: 'red' }}>{errors.newPassword.message}</span>
          )}
        </div>
      </FormRow>

      <FormRow>
        <div>
          <Input
            type="password"
            {...register('confirmNewPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === watch('newPassword') || 'Passwords do not match',
            })}
            placeholder="Confirm New Password"
          />
          {errors.confirmNewPassword && (
            <span style={{ color: 'red' }}>
              {errors.confirmNewPassword.message}
            </span>
          )}
        </div>
      </FormRow>

      <ButtonGroup>
        <ButtonText type="submit" disabled={isResetting}>
          <span>{isResetting ? 'Resetting...' : 'Reset Password'}</span>
        </ButtonText>
      </ButtonGroup>
    </Form>
  );
};

export default ResetPasswordForm;
