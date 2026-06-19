'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';
import type { PaginatedResult } from '@commerce/shared';

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchaseAmount: number | null;
  startDate: string;
  endDate: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  usageCount: number;
  maxUsage: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface PromotionFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function getPromotionStatus(promotion: {
  isActive: boolean;
  startDate: string;
  endDate: string | null;
}): 'active' | 'scheduled' | 'expired' {
  const now = new Date();
  const start = new Date(promotion.startDate);
  const end = promotion.endDate ? new Date(promotion.endDate) : null;

  if (!promotion.isActive) return 'expired';
  if (start > now) return 'scheduled';
  if (end && end < now) return 'expired';
  return 'active';
}

export function usePromotions(filters: PromotionFilters = {}) {
  const api = useApi();
  const { page = 1, limit = 20, search, status } = filters;

  return useQuery<PaginatedResult<Promotion>>({
    queryKey: ['promotions', filters],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (search) params.search = search;
      if (status && status !== 'all') params.status = status;
      return api.get<PaginatedResult<Promotion>>('/promotions', { params });
    },
  });
}

export function usePromotion(id: string) {
  const api = useApi();
  return useQuery<Promotion>({
    queryKey: ['promotions', id],
    queryFn: () => api.get<Promotion>(`/promotions/${id}`),
    enabled: !!id,
  });
}

export function useCreatePromotion() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/promotions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}

export function useUpdatePromotion(id: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put(`/promotions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}

export function useDeletePromotion() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/promotions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}

export function usePromotionCoupons(promotionId: string) {
  const api = useApi();
  return useQuery<Coupon[]>({
    queryKey: ['promotions', promotionId, 'coupons'],
    queryFn: () => api.get<Coupon[]>(`/promotions/${promotionId}/coupons`),
    enabled: !!promotionId,
  });
}

export function useCreateCoupon(promotionId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post(`/promotions/${promotionId}/coupons`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', promotionId, 'coupons'] });
    },
  });
}

export function useDeleteCoupon(promotionId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponId: string) =>
      api.delete(`/promotions/${promotionId}/coupons/${couponId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', promotionId, 'coupons'] });
    },
  });
}
