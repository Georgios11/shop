import { Outlet } from 'react-router-dom';
import MainNav from '../components/MainNav';
import Footer from '../components/Footer';
import { StyledMain } from '../styles/AppLayoutStyles';
import ErrorBoundary from '../components/ErrorBoundary';

const AppLayout = (): React.ReactElement => {
  return (
    <>
      <MainNav />
      <StyledMain>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </StyledMain>
      <Footer />
    </>
  );
};

export default AppLayout;
