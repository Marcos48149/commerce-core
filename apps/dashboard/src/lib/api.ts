import { createApiClient } from '@commerce/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function getApiClient(token?: string) {
  return createApiClient(API_URL, token);
}
