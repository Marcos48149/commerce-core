import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma, OrderStatus as PrismaOrderStatus } from '@prisma/client';
import { OrderRepository, OrderFilter, PaginatedOrders } from '../domain/order.repository';
import { Order, OrderStatus, OrderItemData } from '../domain/order.entity';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(row: any): Order {
    const items: OrderItemData[] = (row.items ?? []).map((i: any) => ({
      id: i.id,
      variantId: i.variantId,
      productId: i.productId,
      productName: i.productName,
      variantName: i.variantName,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
      metadata: i.metadata ?? {},
    }));

    return Order.create({
      id: row.id,
      tenantId: row.tenantId,
      storeId: row.storeId,
      customerId: row.customerId,
      orderNumber: row.orderNumber,
      currency: row.currency,
      subtotal: Number(row.subtotal),
      discount: Number(row.discount),
      shipping: Number(row.shipping),
      tax: Number(row.tax),
      total: Number(row.total),
      couponCode: row.couponCode,
      notes: row.notes,
      metadata: row.metadata ?? {},
      items,
    });
  }

  async findById(id: string, storeId: string): Promise<Order | null> {
    const row = await this.prisma.order.findFirst({
      where: { id, storeId },
      include: { items: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByStore(storeId: string, filter: OrderFilter): Promise<PaginatedOrders> {
    const where: Prisma.OrderWhereInput = { storeId };

    if (filter.status) where.status = filter.status as PrismaOrderStatus;
    if (filter.customerId) where.customerId = filter.customerId;

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    if (filter.sortBy) {
      orderBy[filter.sortBy as keyof Prisma.OrderOrderByWithRelationInput] = filter.sortOrder ?? 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({ where, skip, take: limit, orderBy, include: { items: true } }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: data.map((r) => this.toDomain(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCustomer(customerId: string, storeId: string): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: { customerId, storeId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findByOrderNumber(storeId: string, orderNumber: number): Promise<Order | null> {
    const row = await this.prisma.order.findFirst({
      where: { storeId, orderNumber },
      include: { items: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async findMaxOrderNumber(storeId: string): Promise<number> {
    const result = await this.prisma.order.aggregate({
      where: { storeId },
      _max: { orderNumber: true },
    });
    return result._max.orderNumber ?? 0;
  }

  async save(order: Order): Promise<void> {
    const data = order.toJSON();
    await this.prisma.order.create({
      data: {
        id: data.id,
        tenantId: data.tenantId,
        storeId: data.storeId,
        customerId: data.customerId,
        orderNumber: data.orderNumber,
        status: data.status as PrismaOrderStatus,
        currency: data.currency,
        subtotal: data.subtotal,
        discount: data.discount,
        shipping: data.shipping,
        tax: data.tax,
        total: data.total,
        couponCode: data.couponCode,
        notes: data.notes,
        metadata: data.metadata as Prisma.InputJsonValue,
        snapshot: data.snapshot as unknown as Prisma.InputJsonValue,
        items: {
          create: data.items.map((item: any) => ({
            id: item.id,
            variantId: item.variantId,
            productId: item.productId,
            storeId: data.storeId,
            productName: item.productName,
            variantName: item.variantName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            metadata: (item.metadata ?? {}) as Prisma.InputJsonValue,
          })),
        },
      },
    });
  }

  async update(order: Order): Promise<void> {
    const data = order.toJSON();
    await this.prisma.order.update({
      where: { id: data.id },
      data: {
        status: data.status as PrismaOrderStatus,
        notes: data.notes,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }
}
