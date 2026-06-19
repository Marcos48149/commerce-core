'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';
import type { PaginatedResult } from '@commerce/shared';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface ShippingAddress {
  line1: string;
  line2: string | null;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  image: string | null;
}

export interface TimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp: string | null;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string | null;
  customerEmail: string | null;
  status: OrderStatus;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  currency: string;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail extends Order {
  shippingAddress: ShippingAddress | null;
  items: OrderItem[];
  timeline: TimelineEvent[];
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useOrders(filters: OrderFilters = {}) {
  const api = useApi();
  const { page = 1, limit = 20, status, search, dateFrom, dateTo, sortBy, sortOrder } = filters;

  return useQuery<PaginatedResult<Order>>({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (status) params.status = status;
      if (search) params.search = search;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      return api.get<PaginatedResult<Order>>('/orders', { params });
    },
  });
}

export function useOrder(id: string) {
  const api = useApi();
  return useQuery<OrderDetail>({
    queryKey: ['orders', id],
    queryFn: () => api.get<OrderDetail>(`/orders/${id}`),
    enabled: !!id,
  });
}

export function useConfirmOrder() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/orders/${id}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCancelOrder() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/orders/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useRefundOrder() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.post(`/orders/${id}/refund`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
