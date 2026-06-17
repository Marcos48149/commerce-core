import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantRepository } from '../domain/tenant.repository';
import { Tenant } from '../domain/tenant.entity';

@Injectable()
export class PrismaTenantRepository implements TenantRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Tenant | null> {
    const row = await this.prisma.tenant.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? this.toTenant(row) : null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const row = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    return row && !row.deletedAt ? this.toTenant(row) : null;
  }

  async save(tenant: Tenant): Promise<void> {
    await this.prisma.tenant.create({
      data: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
    });
  }

  async update(tenant: Tenant): Promise<void> {
    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name: tenant.name,
        slug: tenant.slug,
        deletedAt: (tenant as any).deletedAt,
      },
    });
  }

  private toTenant(row: any): Tenant {
    return Tenant.create({
      id: row.id,
      name: row.name,
      slug: row.slug,
    });
  }
}
