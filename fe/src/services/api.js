import axios from 'axios';
import { env } from '../config/env';
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from '../utils/authStorage';

const api = axios.create({ baseURL: env.apiUrl, headers: { 'Content-Type': 'application/json' } });

const AUTH_ENDPOINT = /\/auth\/(login|register|refresh|logout|forgot-password|reset-password)(\?|$)/;
let refreshRequest = null;

function notifySessionExpired() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:logout'));
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.skipAuth) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const shouldRefresh =
      original &&
      error.response?.status === 401 &&
      !original._retry &&
      !original.skipAuthRefresh &&
      !AUTH_ENDPOINT.test(original.url || '');

    if (!shouldRefresh) return Promise.reject(error);

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      notifySessionExpired();
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      if (!refreshRequest) {
        refreshRequest = api
          .post('/auth/refresh', { refreshToken }, { skipAuth: true, skipAuthRefresh: true })
          .then((response) => response.data.data);
      }
      const session = await refreshRequest;
      setAuthTokens(session);
      original.headers = { ...(original.headers || {}), Authorization: `Bearer ${session.accessToken}` };
      return api(original);
    } catch (refreshError) {
      clearAuthTokens();
      notifySessionExpired();
      return Promise.reject(refreshError);
    } finally {
      refreshRequest = null;
    }
  }
);

export default api;
