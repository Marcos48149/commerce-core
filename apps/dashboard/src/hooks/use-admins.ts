'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';
import type { PaginatedResult } from '@commerce/shared';

export interface Admin {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  roles: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminFormData {
  email: string;
  password?: string;
  displayName: string;
  isActive?: boolean;
  roleIds?: string[];
}

export function useAdmins(params: { page?: number; limit?: number; search?: string } = {}) {
  const api = useApi();
  const { page = 1, limit = 20, search } = params;

  return useQuery<PaginatedResult<Admin>>({
    queryKey: ['admins', params],
    queryFn: async () => {
      const queryParams: Record<string, unknown> = { page, limit };
      if (search) queryParams.search = search;
      return api.get<PaginatedResult<Admin>>('/iam/admins', { params: queryParams });
    },
  });
}

export function useAdmin(id: string) {
  const api = useApi();
  return useQuery<Admin>({
    queryKey: ['admins', id],
    queryFn: () => api.get<Admin>(`/iam/admins/${id}`),
    enabled: !!id,
  });
}

export function useCreateAdmin() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminFormData) => api.post('/iam/admins', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}

export function useUpdateAdmin(id: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminFormData>) => api.put(`/iam/admins/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}

export function useDeleteAdmin() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/iam/admins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}

export function useAssignRole() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adminId, roleId }: { adminId: string; roleId: string }) =>
      api.post(`/iam/admins/${adminId}/roles/${roleId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}

export function useRemoveRole() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adminId, roleId }: { adminId: string; roleId: string }) =>
      api.delete(`/iam/admins/${adminId}/roles/${roleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}
