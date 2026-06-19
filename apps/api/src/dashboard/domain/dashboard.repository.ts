import { Injectable } from '@nestjs/common';

export interface MetricValue {
  current: number;
  previous: number;
  trend: number;
}

export interface DashboardSummary {
  products: MetricValue;
  pendingOrders: MetricValue;
  customers: MetricValue;
  monthlyRevenue: MetricValue;
}

export interface RecentOrderItem {
  id: string;
  orderNumber: number;
  customerName: string | null;
  status: string;
  total: number;
  currency: string;
  createdAt: Date;
}

@Injectable()
export abstract class DashboardRepository {
  abstract getSummary(storeId: string): Promise<DashboardSummary>;
  abstract getRecentOrders(storeId: string, limit?: number): Promise<RecentOrderItem[]>;
}
