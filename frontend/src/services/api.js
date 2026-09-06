import axios from 'axios';
import { storageKeys } from '../utils/storage.js';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});
let refreshPromise = null;

const clearAuthStorage = () => {
  localStorage.removeItem(storageKeys.auth);
  localStorage.removeItem(storageKeys.token);
  localStorage.removeItem(storageKeys.refreshToken);
};

const redirectToLogin = () => {
  if (
    window.location.pathname !== '/login' &&
    !window.location.pathname.startsWith('/register')
  ) {
    window.location.href = '/login';
  }
};

const persistTokens = ({ accessToken, refreshToken, user }) => {
  if (accessToken) {
    localStorage.setItem(storageKeys.token, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(storageKeys.refreshToken, refreshToken);
  }

  const existing = localStorage.getItem(storageKeys.auth);
  let parsed = {};
  try {
    parsed = existing ? JSON.parse(existing) : {};
  } catch {
    parsed = {};
  }

  localStorage.setItem(
    storageKeys.auth,
    JSON.stringify({
      user: user ?? parsed.user ?? null,
      token: accessToken || parsed.token || null,
      refreshToken: refreshToken || parsed.refreshToken || null,
    })
  );
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(storageKeys.token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    const refreshToken = localStorage.getItem(storageKeys.refreshToken);

    const shouldRefresh =
      status === 401 &&
      refreshToken &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/login') &&
      !originalRequest?.url?.includes('/auth/refresh') &&
      (code === 'TOKEN_EXPIRED' || code === 'TOKEN_INVALID' || !code);

    if (!shouldRefresh) {
      if (status === 401) {
        clearAuthStorage();
        redirectToLogin();
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          )
          .then((response) => response.data?.data)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const data = await refreshPromise;
      const nextAccess = data?.accessToken || data?.token;
      const nextRefresh = data?.refreshToken;

      if (!nextAccess) {
        throw new Error('Refresh response missing access token');
      }

      persistTokens({
        accessToken: nextAccess,
        refreshToken: nextRefresh,
        user: data?.user,
      });

      originalRequest.headers.Authorization = `Bearer ${nextAccess}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAuthStorage();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
