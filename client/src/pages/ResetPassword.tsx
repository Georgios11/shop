import { Section } from '../styles/HomeStyles';
import ResetPasswordForm from '../components/forms/ResetPasswordForm';
const ResetPassword = () => {
  return (
    <Section data-testid="reset-password-page">
      <h1>Reset Password</h1>
      <ResetPasswordForm />
    </Section>
  );
};

export default ResetPassword;
