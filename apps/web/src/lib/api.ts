import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { AuthResponse } from '../types/auth';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './auth-storage';

const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = configuredApiBaseUrl || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshRequest: Promise<string> | null = null;

// Permite que AuthProvider se entere cuando este modulo (fuera de React)
// fuerza un logout por token invalido/expirado, para limpiar tanto el
// estado de usuario como la cache de React Query.
let forcedLogoutHandler: (() => void) | null = null;

export function setForcedLogoutHandler(handler: (() => void) | null) {
  forcedLogoutHandler = handler;
}

function handleForcedLogout() {
  clearTokens();
  forcedLogoutHandler?.();
}

function isAuthEndpoint(url: string | undefined) {
  return url === '/auth/login' || url === '/auth/refresh';
}

function refreshAccessToken() {
  if (!refreshRequest) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      handleForcedLogout();
      return Promise.reject(new Error('No refresh token available'));
    }

    refreshRequest = axios
      .post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        setTokens(data.accessToken, data.refreshToken ?? refreshToken);
        return data.accessToken;
      })
      .catch((error: unknown) => {
        handleForcedLogout();
        throw error;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      if (error.response?.status === 401) {
        handleForcedLogout();
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch {
      handleForcedLogout();
      return Promise.reject(error);
    }
  },
);
