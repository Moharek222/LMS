import axios from 'axios';

const getBaseURL = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3000';
  }
  return 'https://lms-1ji4.onrender.com';
};

const BASE_URL = getBaseURL();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const isAuthRoute = url.includes('/api/auth/');
    const isPublicAuthRoute = isAuthRoute || url.includes('/api/groups');

    const skipRedirect =
      originalRequest?.headers?.['X-Skip-Auth-Redirect'] === 'true' ||
      originalRequest?.headers?.['x-skip-auth-redirect'] === 'true' ||
      isPublicAuthRoute;

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest?._retry &&
      !isAuthRoute
    ) {
      const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('lms_refresh_token');

      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
              }
            })
            .catch((err) => Promise.reject(err));
        }

        if (originalRequest) {
          originalRequest._retry = true;
        }
        isRefreshing = true;

        try {
          let refreshRes: any = null;
          try {
            refreshRes = await axios.post<{ token?: string; accessToken?: string }>(
              `${BASE_URL}/api/auth/refreshSession`,
              { refreshToken }
            );
          } catch {
            refreshRes = await axios.post<{ token?: string; accessToken?: string }>(
              `${BASE_URL}/api/auth/refresh`,
              { refreshToken }
            );
          }

          const newToken = refreshRes?.data?.token || refreshRes?.data?.accessToken;

          if (newToken) {
            localStorage.setItem('token', newToken);
            localStorage.setItem('lms_token', newToken);
            apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            if (originalRequest) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            processQueue(null, newToken);
            isRefreshing = false;

            if (originalRequest) {
              return apiClient(originalRequest);
            }
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          isRefreshing = false;
        }
      }

      if (!skipRedirect) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_refresh_token');
        localStorage.removeItem('lms_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
