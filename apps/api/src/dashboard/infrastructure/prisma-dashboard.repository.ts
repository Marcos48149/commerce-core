import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  DashboardRepository,
  DashboardSummary,
  MetricValue,
  RecentOrderItem,
} from '../domain/dashboard.repository';

@Injectable()
export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getSummary(storeId: string): Promise<DashboardSummary> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [productsCurrent, productsPrevious] = await Promise.all([
      this.prisma.product.count({ where: { storeId, deletedAt: null } }),
      this.prisma.product.count({
        where: { storeId, deletedAt: null, createdAt: { lt: currentMonthStart } },
      }),
    ]);

    const [pendingOrdersCurrent, pendingOrdersPrevious] = await Promise.all([
      this.prisma.order.count({ where: { storeId, status: 'PENDING_PAYMENT' } }),
      this.prisma.order.count({
        where: { storeId, status: 'PENDING_PAYMENT', createdAt: { lt: currentMonthStart } },
      }),
    ]);

    const [customersCurrent, customersPrevious] = await Promise.all([
      this.prisma.customer.count({ where: { storeId, deletedAt: null } }),
      this.prisma.customer.count({
        where: { storeId, deletedAt: null, createdAt: { lt: currentMonthStart } },
      }),
    ]);

    const [currentRevenue, previousRevenue] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          storeId,
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: currentMonthStart },
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          storeId,
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: previousMonthStart, lte: previousMonthEnd },
        },
        _sum: { total: true },
      }),
    ]);

    return {
      products: this.toMetric(productsCurrent, productsPrevious),
      pendingOrders: this.toMetric(pendingOrdersCurrent, pendingOrdersPrevious),
      customers: this.toMetric(customersCurrent, customersPrevious),
      monthlyRevenue: this.toMetric(
        Number(currentRevenue._sum.total ?? 0),
        Number(previousRevenue._sum.total ?? 0),
      ),
    };
  }

  async getRecentOrders(storeId: string, limit = 10): Promise<RecentOrderItem[]> {
    const rows = await this.prisma.order.findMany({
      where: { storeId },
      include: {
        customer: { select: { displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return rows.map((r) => ({
      id: r.id,
      orderNumber: r.orderNumber,
      customerName: r.customer?.displayName ?? null,
      status: r.status,
      total: Number(r.total),
      currency: r.currency,
      createdAt: r.createdAt,
    }));
  }

  private toMetric(current: number, previous: number): MetricValue {
    return {
      current,
      previous,
      trend: previous === 0 ? (current === 0 ? 0 : 100) : Number((((current - previous) / previous) * 100).toFixed(2)),
    };
  }
}
