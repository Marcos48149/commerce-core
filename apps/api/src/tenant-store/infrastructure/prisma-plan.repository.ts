import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PlanRepository } from '../domain/plan.repository';
import { Plan } from '../domain/plan.entity';

@Injectable()
export class PrismaPlanRepository implements PlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string, tenantId: string): Promise<Plan | null> {
    const row = await this.prisma.plan.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    return row ? this.toPlan(row) : null;
  }

  async findByTenant(tenantId: string): Promise<Plan[]> {
    const rows = await this.prisma.plan.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toPlan(r));
  }

  async save(plan: Plan): Promise<void> {
    await this.prisma.plan.create({
      data: {
        id: plan.id,
        tenantId: plan.tenantId,
        name: plan.name,
        maxStores: plan.maxStores,
        maxAdmins: plan.maxAdmins,
        maxProducts: plan.maxProducts,
        maxWebhooks: plan.maxWebhooks,
        features: plan.features as any,
        monthlyPrice: plan.monthlyPrice,
      },
    });
  }

  async update(plan: Plan): Promise<void> {
    await this.prisma.plan.update({
      where: { id: plan.id },
      data: {
        name: plan.name,
        maxStores: plan.maxStores,
        maxAdmins: plan.maxAdmins,
        maxProducts: plan.maxProducts,
        maxWebhooks: plan.maxWebhooks,
        features: plan.features as any,
        monthlyPrice: plan.monthlyPrice,
        deletedAt: (plan as any).deletedAt,
      },
    });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.plan.updateMany({
      where: { id, tenantId },
      data: { deletedAt: new Date() },
    });
  }

  private toPlan(row: any): Plan {
    return Plan.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      maxStores: row.maxStores,
      maxAdmins: row.maxAdmins,
      maxProducts: row.maxProducts,
      maxWebhooks: row.maxWebhooks,
      features: row.features as Record<string, unknown>,
      monthlyPrice: Number(row.monthlyPrice),
    });
  }
}
