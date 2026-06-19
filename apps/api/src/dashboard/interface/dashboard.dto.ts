export class DashboardSummaryDto {
  summary!: {
    products: { current: number; previous: number; trend: number };
    pendingOrders: { current: number; previous: number; trend: number };
    customers: { current: number; previous: number; trend: number };
    monthlyRevenue: { current: number; previous: number; trend: number };
  };
  recentOrders!: Array<{
    id: string;
    orderNumber: number;
    customerName: string | null;
    status: string;
    total: number;
    currency: string;
    createdAt: Date;
  }>;
}
