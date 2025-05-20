import { ToastPosition } from 'react-hot-toast';

interface ToastStyle {
  fontSize: string;
  maxWidth: string;
  padding: string;
  backgroundColor: string;
  color: string;
}

interface ToastOptions {
  success: {
    duration: number;
  };
  error: {
    duration: number;
  };
  style: ToastStyle;
}

interface ToastConfig {
  position: ToastPosition;
  gutter: number;
  containerStyle: {
    margin: string;
    zIndex: number;
  };
  toastOptions: ToastOptions;
}

export const toastConfig: ToastConfig = {
  position: 'top-right',
  gutter: 12,
  containerStyle: {
    margin: '8px',
    zIndex: 99999,
  },
  toastOptions: {
    success: {
      duration: 3000,
    },
    error: {
      duration: 3000,
    },
    style: {
      fontSize: '16px',
      maxWidth: '500px',
      padding: '16px 24px',
      backgroundColor: 'var(--color-grey-0)',
      color: 'var(--color-grey-700)',
    },
  },
};
