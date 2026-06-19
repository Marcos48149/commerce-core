'use client';

import { useCallback } from 'react';
import { getApiClient, resetApiClient } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { getStoredAuth, storeAuth } from '@/lib/auth';
import type { ApiClient } from '@commerce/api-client';

export function useApi(): ApiClient {
  const { session } = useAuth();
  const client = getApiClient(session?.accessToken);
  if (session) {
    client.setTokens(session.accessToken, session.refreshToken);
  }
  return client;
}

export function useRefreshOnFocus() {
  const { session } = useAuth();
  return useCallback(() => {
    if (!session) return;
    const stored = getStoredAuth();
    if (stored && stored.accessToken !== session.accessToken) {
      storeAuth(session);
    }
  }, [session]);
}
