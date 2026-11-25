import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tescom_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthEndpoint =
      error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('tescom_token');
      localStorage.removeItem('tescom_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const extractApiError = (error, fallback = 'Une erreur est survenue.') => {
  const data = error.response?.data;
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return `${data.message} ${data.errors.join(' ')}`;
  }
  return data?.message || fallback;
};

export default api;
