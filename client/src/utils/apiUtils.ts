const getBaseUrl = (): string => {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    return 'http://localhost:3001/api/v1';
  }

  // In production, use the environment variable
  const productionUrl = import.meta.env.VITE_API_URL as string;
  if (!productionUrl) {
    throw new Error('VITE_API_URL must be set in production');
  }

  return productionUrl;
};

export const BASE_URL = getBaseUrl();
