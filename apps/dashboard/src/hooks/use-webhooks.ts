'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookFormData {
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
}

export function useWebhooks() {
  const api = useApi();
  return useQuery<Webhook[]>({
    queryKey: ['webhooks'],
    queryFn: () => api.get<Webhook[]>('/webhooks'),
  });
}

export function useWebhook(id: string) {
  const api = useApi();
  return useQuery<Webhook>({
    queryKey: ['webhooks', id],
    queryFn: () => api.get<Webhook>(`/webhooks/${id}`),
    enabled: !!id,
  });
}

export function useCreateWebhook() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WebhookFormData) => api.post('/webhooks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

export function useUpdateWebhook(id: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WebhookFormData>) => api.put(`/webhooks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

export function useDeleteWebhook() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/webhooks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}
