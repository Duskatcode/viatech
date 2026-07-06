import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { api, setForcedLogoutHandler } from '../lib/api';
import { clearTokens, getAccessToken, setTokens } from '../lib/auth-storage';
import type { AuthResponse, AuthUser, LoginPayload } from '../types/auth';

import { AuthContext } from './auth-context';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const reloadUser = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<AuthUser>('/auth/me');
      setUser(response.data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void reloadUser();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [reloadUser]);

  useEffect(() => {
    // Si lib/api.ts fuerza un logout (token invalido/expirado fuera de
    // una llamada explicita a logout()), limpiamos igual el usuario y
    // la cache de React Query para no arrastrar datos de la sesion anterior.
    setForcedLogoutHandler(() => {
      setUser(null);
      queryClient.clear();
    });

    return () => setForcedLogoutHandler(null);
  }, [queryClient]);

  async function login(payload: LoginPayload) {
    const response = await api.post<AuthResponse>('/auth/login', payload);

    setTokens(response.data.accessToken, response.data.refreshToken);
    setUser(response.data.user);
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout network errors. Local session must still be cleared.
    } finally {
      clearTokens();
      setUser(null);
      // Limpiar toda la caché de React Query para evitar datos cruzados entre sesiones
      queryClient.clear();
    }
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      reloadUser,
    }),
    [user, isLoading, reloadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
