import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { StoreRepository } from '../domain/store.repository';
import { Store } from '../domain/store.entity';

@Injectable()
export class PrismaStoreRepository implements StoreRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string, tenantId: string): Promise<Store | null> {
    const row = await this.prisma.store.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    return row ? this.toStore(row) : null;
  }

  async findByTenant(tenantId: string): Promise<Store[]> {
    const rows = await this.prisma.store.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toStore(r));
  }

  async findBySlug(tenantId: string, slug: string): Promise<Store | null> {
    const row = await this.prisma.store.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
    });
    return row && !row.deletedAt ? this.toStore(row) : null;
  }

  async save(store: Store): Promise<void> {
    await this.prisma.store.create({
      data: {
        id: store.id,
        tenantId: store.tenantId,
        planId: store.planId,
        name: store.name,
        slug: store.slug,
        currency: store.currency,
        displayName: store.displayName,
        email: store.email,
        phone: store.phone,
        address: store.address,
        logoUrl: store.logoUrl,
        isActive: store.isActive,
        settings: store.settings as any,
      },
    });
  }

  async update(store: Store): Promise<void> {
    await this.prisma.store.update({
      where: { id: store.id },
      data: {
        planId: store.planId,
        name: store.name,
        slug: store.slug,
        currency: store.currency,
        displayName: store.displayName,
        email: store.email,
        phone: store.phone,
        address: store.address,
        logoUrl: store.logoUrl,
        isActive: store.isActive,
        settings: store.settings as any,
        deletedAt: (store as any).deletedAt,
      },
    });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.store.updateMany({
      where: { id, tenantId },
      data: { deletedAt: new Date() },
    });
  }

  private toStore(row: any): Store {
    return Store.create({
      id: row.id,
      tenantId: row.tenantId,
      planId: row.planId,
      name: row.name,
      slug: row.slug,
      currency: row.currency,
      displayName: row.displayName,
      email: row.email,
      phone: row.phone,
      address: row.address,
      logoUrl: row.logoUrl,
      settings: row.settings as Record<string, unknown>,
    });
  }
}
