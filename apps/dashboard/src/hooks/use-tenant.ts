'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export function useTenant() {
  const api = useApi();
  return useQuery<Tenant>({
    queryKey: ['tenant'],
    queryFn: () => api.get<Tenant>('/tenant'),
  });
}

export function useUpdateTenant() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => api.put('/tenant', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
}
