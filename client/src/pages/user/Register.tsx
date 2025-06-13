import toast from 'react-hot-toast';
import useRegister from '../../hooks/useRegister';
import { RegisterSection, Title } from '../../styles/RegisterStyles';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../../components/forms/RegistrationForm';

const Register = () => {
  const navigate = useNavigate();
  const { registerUser, isRegistering } = useRegister();

  const handleSubmit = async (formData: FormData) => {
    try {
      formData.append('role', 'user');
      const response = await registerUser(formData);
      toast.success(response.message);
      void navigate('/login');
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <RegisterSection data-testid="register-page">
      <Title>Create Account</Title>
      <RegistrationForm onSubmit={handleSubmit} isRegistering={isRegistering} />
    </RegisterSection>
  );
};

export default Register;
