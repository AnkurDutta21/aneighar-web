import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

/**
 * Axios client for React Native.
 *
 * Key differences from web:
 * - baseURL is the full API URL (web uses relative '/api' via Vite proxy)
 * - No window.location.href — navigation is handled via the navigationRef
 * - withCredentials still set for cookie support where available
 */
const API_URL = 'https://api-ghar.aniecorp.in/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
});

// ─── Request Interceptor — attach access token ────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle 401, try token refresh ────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes('/auth/');

    // Never intercept auth routes (login, refresh, logout) — let them fail naturally
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data.data;
        useAuthStore.getState().setToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — clear auth state
        // Navigation to login is handled by useProtectedNavigation hook
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
