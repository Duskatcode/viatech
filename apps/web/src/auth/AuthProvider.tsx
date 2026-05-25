import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api } from '../lib/api';
import { clearTokens, getAccessToken, setTokens } from '../lib/auth-storage';
import type { AuthResponse, AuthUser, LoginPayload } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    void reloadUser();
  }, [reloadUser]);

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
