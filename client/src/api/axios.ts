import axios, { AxiosInstance } from 'axios';

const BASE_URL = `http://localhost:3001/api/v1`;

const axiosPublic: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const axiosPrivate: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to ensure cookies are sent
axiosPrivate.interceptors.request.use(
  (config) => {
    // Ensure cookies are included in the request
    config.withCredentials = true;
    // Add Authorization header if token exists in cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('refreshToken=')
    );
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    if (error instanceof Error) {
      return Promise.reject(new Error(error.message));
    }
    return Promise.reject(new Error('An unknown error occurred'));
  }
);

export default axiosPublic;
export { axiosPrivate };
