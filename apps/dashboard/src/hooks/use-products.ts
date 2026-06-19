'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';
import type { PaginatedResult } from '@commerce/shared';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  productId: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  images: string[];
  categories: { id: string; name: string }[];
  collections: { id: string; name: string }[];
  dimensions: { width: number | null; height: number | null; depth: number | null } | null;
  weight: number | null;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useProducts(filters: ProductFilters = {}) {
  const api = useApi();
  const { page = 1, limit = 20, search, categoryId, sortBy, sortOrder } = filters;

  return useQuery<PaginatedResult<Product>>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      return api.get<PaginatedResult<Product>>('/catalog/products', { params });
    },
  });
}

export function useProduct(id: string) {
  const api = useApi();
  return useQuery<Product>({
    queryKey: ['products', id],
    queryFn: () => api.get<Product>(`/catalog/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/catalog/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct(id: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put(`/catalog/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/catalog/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
