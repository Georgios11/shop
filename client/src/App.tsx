import { RouterProvider } from 'react-router-dom';

import router from './router';
import ErrorBoundary from './components/ErrorBoundary';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import queryClient, {
  localStoragePersister,
} from './utils/queryUtils/queryClient';
import GlobalStyles from './styles/GlobalStyles';
import AppContainer from './styles/AppContainer';
import { Toaster } from 'react-hot-toast';
import { toastConfig } from './config/toastConfig';

function App() {
  return (
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: localStoragePersister }}
      >
        <AppContainer>
          <ReactQueryDevtools />

          <GlobalStyles />
          <Toaster {...toastConfig} />
          <RouterProvider router={router} />
        </AppContainer>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
