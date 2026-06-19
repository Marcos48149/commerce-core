'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  category: string;
  key: string;
}

export interface Role {
  id: string;
  name: string;
  scope: 'tenant' | 'store';
  isSystem: boolean;
  permissions: Permission[];
  permissionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoleFormData {
  name: string;
  scope: 'tenant' | 'store';
  permissionIds: string[];
}

export function useRoles() {
  const api = useApi();
  return useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => api.get<Role[]>('/iam/roles'),
  });
}

export function useRole(id: string) {
  const api = useApi();
  return useQuery<Role>({
    queryKey: ['roles', id],
    queryFn: () => api.get<Role>(`/iam/roles/${id}`),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleFormData) => api.post('/iam/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useUpdateRole(id: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<RoleFormData>) => api.put(`/iam/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useDeleteRole() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/iam/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}
