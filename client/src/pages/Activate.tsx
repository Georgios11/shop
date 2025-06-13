import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useActivate from '../hooks/useActivate';
import { Section } from '../styles/ProductStyles';
import Heading from '../ui/Heading';
import Button from '../ui/Button';

const Activate = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { activate, isActivating, isActivatingError } = useActivate();

  const handleActivate = async () => {
    if (!token) {
      toast.error('Invalid activation token');
      return;
    }

    try {
      const data = await activate(token);
      toast.success(data.message);
      setTimeout(() => {
        void navigate('/login');
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred during activation');
      }
    }
  };

  return (
    <Section data-testid="activate-page">
      <Heading as="h1">Account Activation</Heading>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Click the button below to activate your account:</p>
        <Button
          onClick={() => void handleActivate()}
          disabled={isActivating}
          $size="large"
          $variation="primary"
        >
          {isActivating ? 'Activating...' : 'Activate Account'}
        </Button>
        {isActivatingError && (
          <p style={{ color: 'red', marginTop: '1rem' }}>
            Activation failed. Please try again or contact support.
          </p>
        )}
      </div>
    </Section>
  );
};

export default Activate;
