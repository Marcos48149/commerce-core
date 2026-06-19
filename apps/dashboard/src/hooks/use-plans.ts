'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export interface Plan {
  id: string;
  name: string;
  maxStores: number;
  maxAdmins: number;
  maxProducts: number;
  features: string[];
  monthlyPrice: number;
  createdAt: string;
  updatedAt: string;
  storeCount?: number;
}

export interface PlanFormData {
  name: string;
  maxStores: number;
  maxAdmins: number;
  maxProducts: number;
  features: string[];
  monthlyPrice: number;
}

export function usePlans() {
  const api = useApi();
  return useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: () => api.get<Plan[]>('/plans'),
  });
}

export function usePlan(id: string) {
  const api = useApi();
  return useQuery<Plan>({
    queryKey: ['plans', id],
    queryFn: () => api.get<Plan>(`/plans/${id}`),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PlanFormData) => api.post('/plans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

export function useUpdatePlan(id: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PlanFormData>) => api.put(`/plans/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

export function useDeletePlan() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}
