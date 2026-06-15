import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ShippingRepository } from '../domain/shipping.repository';
import { ShippingMethod, ShippingZone, ShippingType } from '../domain/shipping-method.entity';

@Injectable()
export class PrismaShippingRepository implements ShippingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(row: any): ShippingMethod {
    const method = ShippingMethod.create({
      id: row.id,
      tenantId: row.tenantId,
      storeId: row.storeId,
      name: row.name,
      type: row.type as ShippingType,
      cost: row.cost ? Number(row.cost) : null,
      freeOver: row.freeOver ? Number(row.freeOver) : null,
      sortOrder: row.sortOrder,
      config: row.config ?? {},
    });

    if (!row.isActive) method.deactivate();

    if (row.zones) {
      for (const z of row.zones) {
        (method as any).zones.push(
          new ShippingZone(
            z.id, z.shippingMethodId, z.name,
            z.countries ?? [], z.provinces ?? [],
            z.postalCodes, z.cost ? Number(z.cost) : null,
            z.freeOver ? Number(z.freeOver) : null,
            z.estimatedDaysMin, z.estimatedDaysMax, z.isActive,
          ),
        );
      }
    }

    return method;
  }

  async findById(id: string, storeId: string): Promise<ShippingMethod | null> {
    const row = await this.prisma.shippingMethod.findFirst({
      where: { id, storeId, deletedAt: null },
      include: { zones: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByStore(storeId: string): Promise<ShippingMethod[]> {
    const rows = await this.prisma.shippingMethod.findMany({
      where: { storeId, deletedAt: null },
      include: { zones: true },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findActiveByStore(storeId: string): Promise<ShippingMethod[]> {
    const rows = await this.prisma.shippingMethod.findMany({
      where: { storeId, isActive: true, deletedAt: null },
      include: { zones: true },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(method: ShippingMethod): Promise<void> {
    const data = method.toJSON();
    await this.prisma.shippingMethod.create({
      data: {
        id: data.id,
        tenantId: data.tenantId,
        storeId: data.storeId,
        name: data.name,
        type: data.type,
        cost: data.cost,
        freeOver: data.freeOver,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        config: data.config as any,
      },
    });
  }

  async update(method: ShippingMethod): Promise<void> {
    const data = method.toJSON();
    await this.prisma.shippingMethod.update({
      where: { id: data.id },
      data: {
        name: data.name,
        cost: data.cost,
        freeOver: data.freeOver,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        config: data.config as any,
      },
    });
  }

  async delete(id: string, storeId: string): Promise<void> {
    await this.prisma.shippingMethod.updateMany({
      where: { id, storeId },
      data: { deletedAt: new Date() },
    });
  }
}
