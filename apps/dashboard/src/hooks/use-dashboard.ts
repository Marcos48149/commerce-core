'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from './use-api';

export interface MetricData {
  current: number;
  previous: number;
  trend: number;
}

export interface DashboardSummary {
  products: MetricData;
  pendingOrders: MetricData;
  customers: MetricData;
  monthlyRevenue: MetricData;
}

export interface RecentOrder {
  id: string;
  orderNumber: number;
  customerName: string | null;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentOrders: RecentOrder[];
}

export function useDashboardSummary() {
  const api = useApi();

  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const data = await api.get<DashboardData>('/dashboard/summary');
      return data.summary;
    },
    refetchInterval: 60_000,
  });
}

export function useRecentOrders() {
  const api = useApi();

  return useQuery<RecentOrder[]>({
    queryKey: ['dashboard', 'recent-orders'],
    queryFn: async () => {
      const data = await api.get<DashboardData>('/dashboard/summary');
      return data.recentOrders;
    },
    refetchInterval: 30_000,
  });
}
