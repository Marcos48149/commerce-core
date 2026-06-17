import { Injectable } from '@nestjs/common';
import { Store } from './store.entity';

@Injectable()
export abstract class StoreRepository {
  abstract findById(id: string, tenantId: string): Promise<Store | null>;
  abstract findByTenant(tenantId: string): Promise<Store[]>;
  abstract findBySlug(tenantId: string, slug: string): Promise<Store | null>;
  abstract save(store: Store): Promise<void>;
  abstract update(store: Store): Promise<void>;
  abstract delete(id: string, tenantId: string): Promise<void>;
}
