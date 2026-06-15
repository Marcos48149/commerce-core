import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CouponRepository } from '../domain/coupon.repository';
import { Coupon } from '../domain/coupon.entity';

@Injectable()
export class PrismaCouponRepository implements CouponRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(row: any): Coupon {
    return Coupon.create({
      id: row.id,
      promotionId: row.promotionId,
      tenantId: row.tenantId,
      storeId: row.storeId,
      code: row.code,
      maxUsage: row.maxUsage,
      maxPerCustomer: row.maxPerCustomer,
    });
  }

  async findById(id: string, storeId: string): Promise<Coupon | null> {
    const row = await this.prisma.coupon.findFirst({
      where: { id, storeId, deletedAt: null },
    });
    return row ? this.toEntity(row) : null;
  }

  async findByCode(code: string, storeId: string): Promise<Coupon | null> {
    const row = await this.prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), storeId, deletedAt: null },
    });
    return row ? this.toEntity(row) : null;
  }

  async findByPromotion(promotionId: string, storeId: string): Promise<Coupon[]> {
    const rows = await this.prisma.coupon.findMany({
      where: { promotionId, storeId, deletedAt: null },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async save(coupon: Coupon): Promise<void> {
    await this.prisma.coupon.create({
      data: {
        id: coupon.id,
        promotionId: coupon.promotionId,
        tenantId: coupon.tenantId,
        storeId: coupon.storeId,
        code: coupon.code,
        maxUsage: coupon.maxUsage,
        maxPerCustomer: coupon.maxPerCustomer,
        currentUsage: coupon.currentUsage,
        isActive: coupon.isActive,
      },
    });
  }

  async update(coupon: Coupon): Promise<void> {
    await this.prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        maxUsage: coupon.maxUsage,
        maxPerCustomer: coupon.maxPerCustomer,
        isActive: coupon.isActive,
        currentUsage: coupon.currentUsage,
      },
    });
  }

  async delete(id: string, storeId: string): Promise<void> {
    await this.prisma.coupon.updateMany({
      where: { id, storeId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
