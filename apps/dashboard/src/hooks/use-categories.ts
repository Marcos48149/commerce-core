'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  children: { id: string; name: string }[];
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export function useCategories() {
  const api = useApi();
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/catalog/categories'),
  });
}

export function useCategory(id: string) {
  const api = useApi();
  return useQuery<Category>({
    queryKey: ['categories', id],
    queryFn: () => api.get<Category>(`/catalog/categories/${id}`),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/catalog/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory(id: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put(`/catalog/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/catalog/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
