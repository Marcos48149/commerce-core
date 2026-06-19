'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from './use-api';
import type { PaginatedResult } from '@commerce/shared';
import type { OrderStatus } from './use-orders';

export interface Customer {
  id: string;
  email: string;
  displayName: string | null;
  phone: string | null;
  totalOrders: number;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  type: string;
  line1: string;
  line2: string | null;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface CustomerDetail extends Customer {
  addresses: CustomerAddress[];
}

export interface CustomerOrder {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export function useCustomers(filters: CustomerFilters = {}) {
  const api = useApi();
  const { page = 1, limit = 20, search } = filters;

  return useQuery<PaginatedResult<Customer>>({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (search) params.search = search;
      return api.get<PaginatedResult<Customer>>('/customers', { params });
    },
  });
}

export function useCustomer(id: string) {
  const api = useApi();
  return useQuery<CustomerDetail>({
    queryKey: ['customers', id],
    queryFn: () => api.get<CustomerDetail>(`/customers/${id}`),
    enabled: !!id,
  });
}

export function useCustomerOrders(
  customerId: string,
  filters: CustomerFilters = {},
) {
  const api = useApi();
  const { page = 1, limit = 20 } = filters;

  return useQuery<PaginatedResult<CustomerOrder>>({
    queryKey: ['customers', customerId, 'orders', filters],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      return api.get<PaginatedResult<CustomerOrder>>(
        `/customers/${customerId}/orders`,
        { params },
      );
    },
    enabled: !!customerId,
  });
}
