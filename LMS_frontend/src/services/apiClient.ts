import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isPublicAuthRoute =
      url.includes('/api/auth/') ||
      url.includes('/api/groups');

    const skipRedirect =
      error.config?.headers?.['X-Skip-Auth-Redirect'] === 'true' ||
      error.config?.headers?.['x-skip-auth-redirect'] === 'true' ||
      isPublicAuthRoute;

    if (error.response && error.response.status === 401 && !skipRedirect) {
      localStorage.removeItem('lms_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
