import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantRepository } from '../domain/tenant.repository';

export interface UpdateTenantInput {
  name?: string;
  slug?: string;
}

@Injectable()
export class ManageTenantUseCase {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async get(tenantId: string) {
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }

  async update(tenantId: string, input: UpdateTenantInput) {
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    tenant.update(input);
    await this.tenantRepository.update(tenant);

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}
