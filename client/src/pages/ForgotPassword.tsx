import { Section } from '../styles/HomeStyles';
import ForgotPasswordForm from '../components/forms/ForgotPasswordForm';

const ForgotPassword = () => {
  return (
    <Section data-testid="forgot-password-page">
      <ForgotPasswordForm />
    </Section>
  );
};

export default ForgotPassword;
