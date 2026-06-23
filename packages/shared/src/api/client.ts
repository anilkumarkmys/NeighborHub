import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constants';
import { ApiResponse, AuthTokens } from '../types';

let tokenStore: {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;
} | null = null;

export function configureApiClient(store: typeof tokenStore) {
  tokenStore = store;
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = tokenStore?.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = tokenStore?.getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post<ApiResponse<AuthTokens>>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );
          if (data.data) {
            tokenStore?.setTokens(data.data);
            if (originalRequest.headers) {
              (originalRequest.headers as Record<string, string>).Authorization =
                `Bearer ${data.data.accessToken}`;
            }
            return api(originalRequest);
          }
        } catch {
          tokenStore?.clearTokens();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
