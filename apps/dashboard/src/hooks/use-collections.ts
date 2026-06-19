'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export function useCollections() {
  const api = useApi();
  return useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: () => api.get<Collection[]>('/catalog/collections'),
  });
}

export function useCollection(id: string) {
  const api = useApi();
  return useQuery<Collection>({
    queryKey: ['collections', id],
    queryFn: () => api.get<Collection>(`/catalog/collections/${id}`),
    enabled: !!id,
  });
}

export function useCreateCollection() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/catalog/collections', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useUpdateCollection(id: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put(`/catalog/collections/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useDeleteCollection() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/catalog/collections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}
