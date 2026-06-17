import { Injectable } from '@nestjs/common';
import { Tenant } from './tenant.entity';

@Injectable()
export abstract class TenantRepository {
  abstract findById(id: string): Promise<Tenant | null>;
  abstract findBySlug(slug: string): Promise<Tenant | null>;
  abstract save(tenant: Tenant): Promise<void>;
  abstract update(tenant: Tenant): Promise<void>;
}
