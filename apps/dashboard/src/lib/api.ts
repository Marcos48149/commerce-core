import { createApiClient, ApiClient } from '@commerce/api-client';
import { getStoredAuth } from './auth';
import { API_URL } from './constants';

let clientInstance: ApiClient | null = null;

export function getApiClient(token?: string): ApiClient {
  if (!clientInstance) {
    clientInstance = createApiClient(API_URL);
  }
  if (token) {
    clientInstance.setToken(token);
  } else {
    const auth = getStoredAuth();
    if (auth) {
      clientInstance.setTokens(auth.accessToken, auth.refreshToken);
    }
  }
  return clientInstance;
}

export function resetApiClient(): void {
  clientInstance = null;
}
