'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { getApiClient, resetApiClient } from '@/lib/api';
import {
  getStoredAuth,
  storeAuth,
  clearAuth,
  isAuthenticated,
  type AuthSession,
} from '@/lib/auth';
import { AUTH_KEY } from '@/lib/constants';
import type { LoginResponse } from '@commerce/api-client';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored && isAuthenticated()) {
      setSession(stored);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const client = getApiClient();
    const result = await client.post<LoginResponse>('/auth/login', { email, password });
    const sessionData: AuthSession = {
      adminId: result.admin.id,
      email: result.admin.email,
      displayName: result.admin.displayName,
      isSuperAdmin: result.admin.isSuperAdmin,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
    client.setTokens(sessionData.accessToken, sessionData.refreshToken);
    storeAuth(sessionData);
    setSession(sessionData);
  }, []);

  const logout = useCallback(() => {
    resetApiClient();
    clearAuth();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
