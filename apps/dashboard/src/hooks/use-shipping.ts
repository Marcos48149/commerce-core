'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export interface ShippingMethod {
  id: string;
  name: string;
  type: 'flat' | 'weight' | 'free';
  baseCost: number;
  freeThreshold: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingMethodFormData {
  name: string;
  type: 'flat' | 'weight' | 'free';
  baseCost: number;
  freeThreshold?: number | null;
  isActive: boolean;
}

export function useShippingMethods() {
  const api = useApi();
  return useQuery<ShippingMethod[]>({
    queryKey: ['shipping'],
    queryFn: () => api.get<ShippingMethod[]>('/shipping'),
  });
}

export function useShippingMethod(id: string) {
  const api = useApi();
  return useQuery<ShippingMethod>({
    queryKey: ['shipping', id],
    queryFn: () => api.get<ShippingMethod>(`/shipping/${id}`),
    enabled: !!id,
  });
}

export function useCreateShippingMethod() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ShippingMethodFormData) => api.post('/shipping', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping'] });
    },
  });
}

export function useUpdateShippingMethod(id: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ShippingMethodFormData>) => api.put(`/shipping/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping'] });
    },
  });
}

export function useDeleteShippingMethod() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/shipping/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping'] });
    },
  });
}
