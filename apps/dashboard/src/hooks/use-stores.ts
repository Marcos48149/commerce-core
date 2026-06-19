'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export interface Store {
  id: string;
  name: string;
  slug: string;
  currency: string;
  isActive: boolean;
  planId: string;
  plan?: { id: string; name: string };
  planName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreFormData {
  name: string;
  slug: string;
  currency: string;
  planId: string;
  isActive: boolean;
}

export function useStores(search?: string) {
  const api = useApi();
  return useQuery<Store[]>({
    queryKey: ['stores', search],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (search) params.search = search;
      return api.get<Store[]>('/stores', { params });
    },
  });
}

export function useStore(id: string) {
  const api = useApi();
  return useQuery<Store>({
    queryKey: ['stores', id],
    queryFn: () => api.get<Store>(`/stores/${id}`),
    enabled: !!id,
  });
}

export function useCreateStore() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreFormData) => api.post('/stores', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

export function useUpdateStore(id: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StoreFormData>) => api.put(`/stores/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

export function useDeleteStore() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/stores/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}
