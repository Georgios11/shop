import { useLocation, useNavigate } from 'react-router-dom';
import Heading from '../ui/Heading';
import {
  ForbiddenContainer,
  ForbiddenTitle,
  ForbiddenMessage,
  BackButton,
} from '../styles/ForbiddenStyles';

interface ForbiddenError {
  status?: string;
  message?: string;
  from?: string;
}

const Forbidden = () => {
  const location = useLocation();
  const error = location.state as ForbiddenError | null;
  const navigate = useNavigate();

  const from = error?.from;

  const handleGoBack = () => {
    if (from && from === '/admin') {
      // Navigate back to where they came from
      void navigate(-2 as unknown as string, { replace: true });
    } else {
      // If no valid 'from', go back in history
      void navigate(-1);
    }
  };

  return (
    <ForbiddenContainer data-testid="forbidden-page">
      <ForbiddenTitle>{error?.status || '403'}</ForbiddenTitle>
      <ForbiddenMessage>{error?.message || 'Access Denied'}</ForbiddenMessage>
      <BackButton onClick={handleGoBack}>
        <Heading as="h3">Go Back</Heading>
      </BackButton>
    </ForbiddenContainer>
  );
};

export default Forbidden;
