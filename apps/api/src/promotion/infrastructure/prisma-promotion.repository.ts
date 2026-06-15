import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PromotionRepository, PromotionFilter, PaginatedPromotions } from '../domain/promotion.repository';
import { Promotion, PromotionType, PromotionConfig } from '../domain/promotion.entity';

@Injectable()
export class PrismaPromotionRepository implements PromotionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(row: any): Promotion {
    return Promotion.create({
      id: row.id,
      tenantId: row.tenantId,
      storeId: row.storeId,
      name: row.name,
      type: row.type as PromotionType,
      config: (row.config ?? {}) as PromotionConfig,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      minQuantity: row.minQuantity,
      minCartAmount: row.minCartAmount ? Number(row.minCartAmount) : null,
      targetProductId: row.targetProductId,
      targetCategoryId: row.targetCategoryId,
      targetPaymentMethod: row.targetPaymentMethod,
      maxUsage: row.maxUsage,
      priority: row.priority,
    });
  }

  async findById(id: string, storeId: string): Promise<Promotion | null> {
    const row = await this.prisma.promotion.findFirst({
      where: { id, storeId, deletedAt: null },
    });
    return row ? this.toEntity(row) : null;
  }

  async findByStore(storeId: string, filter?: PromotionFilter): Promise<PaginatedPromotions> {
    const where: any = { storeId, deletedAt: null };
    if (filter?.type) where.type = filter.type;
    if (filter?.isActive !== undefined) where.isActive = filter.isActive;

    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.promotion.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.promotion.count({ where }),
    ]);

    return {
      data: data.map((r) => this.toEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findActiveByStore(storeId: string): Promise<Promotion[]> {
    const now = new Date();
    const rows = await this.prisma.promotion.findMany({
      where: {
        storeId,
        isActive: true,
        deletedAt: null,
        startsAt: { lte: now },
        AND: [
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: { priority: 'desc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async save(promotion: Promotion): Promise<void> {
    await this.prisma.promotion.create({
      data: {
        id: promotion.id,
        tenantId: promotion.tenantId,
        storeId: promotion.storeId,
        name: promotion.name,
        type: promotion.type,
        config: promotion.config as any,
        startsAt: promotion.startsAt,
        endsAt: promotion.endsAt,
        minQuantity: promotion.minQuantity,
        minCartAmount: promotion.minCartAmount,
        targetProductId: promotion.targetProductId,
        targetCategoryId: promotion.targetCategoryId,
        targetPaymentMethod: promotion.targetPaymentMethod,
        isActive: promotion.isActive,
        maxUsage: promotion.maxUsage,
        currentUsage: promotion.currentUsage,
        priority: promotion.priority,
      },
    });
  }

  async update(promotion: Promotion): Promise<void> {
    await this.prisma.promotion.update({
      where: { id: promotion.id },
      data: {
        name: promotion.name,
        config: promotion.config as any,
        startsAt: promotion.startsAt,
        endsAt: promotion.endsAt,
        minQuantity: promotion.minQuantity,
        minCartAmount: promotion.minCartAmount,
        targetProductId: promotion.targetProductId,
        targetCategoryId: promotion.targetCategoryId,
        targetPaymentMethod: promotion.targetPaymentMethod,
        isActive: promotion.isActive,
        maxUsage: promotion.maxUsage,
        currentUsage: promotion.currentUsage,
        priority: promotion.priority,
      },
    });
  }

  async delete(id: string, storeId: string): Promise<void> {
    await this.prisma.promotion.updateMany({
      where: { id, storeId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
