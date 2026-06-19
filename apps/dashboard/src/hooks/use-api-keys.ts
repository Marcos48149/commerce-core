'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes?: string[];
  lastUsedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  prefix: string;
  rawKey: string;
  scopes?: string[];
  isActive: boolean;
}

export interface ApiKeyFormData {
  name: string;
  scopes?: string[];
}

export function useApiKeys() {
  const api = useApi();
  return useQuery<ApiKey[]>({
    queryKey: ['api-keys'],
    queryFn: () => api.get<ApiKey[]>('/iam/api-keys'),
  });
}

export function useCreateApiKey() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApiKeyFormData) => api.post<CreateApiKeyResponse>('/iam/api-keys', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useUpdateApiKey(id: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ApiKeyFormData>) => api.put(`/iam/api-keys/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useDeleteApiKey() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/iam/api-keys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}
