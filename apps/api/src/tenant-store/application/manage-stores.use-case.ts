import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UlidService } from '../../common/ulid.service';
import { StoreRepository } from '../domain/store.repository';
import { Store } from '../domain/store.entity';

export interface CreateStoreInput {
  tenantId: string;
  planId?: string | null;
  name: string;
  slug: string;
  currency?: string;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  settings?: Record<string, unknown>;
}

export interface UpdateStoreInput {
  id: string;
  tenantId: string;
  planId?: string | null;
  name?: string;
  slug?: string;
  currency?: string;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
  settings?: Record<string, unknown>;
}

@Injectable()
export class ManageStoresUseCase {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly ulidService: UlidService,
  ) {}

  async list(tenantId: string) {
    const stores = await this.storeRepository.findByTenant(tenantId);
    return stores.map((s) => this.toOutput(s));
  }

  async create(input: CreateStoreInput) {
    const existing = await this.storeRepository.findBySlug(input.tenantId, input.slug);
    if (existing) {
      throw new ConflictException('Store slug already exists');
    }

    const store = Store.create({
      id: this.ulidService.generate(),
      ...input,
    });

    await this.storeRepository.save(store);
    return this.toOutput(store);
  }

  async getById(id: string, tenantId: string) {
    const store = await this.storeRepository.findById(id, tenantId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return this.toOutput(store);
  }

  async update(input: UpdateStoreInput) {
    const store = await this.storeRepository.findById(input.id, input.tenantId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    store.update({
      planId: input.planId,
      name: input.name,
      slug: input.slug,
      currency: input.currency,
      displayName: input.displayName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      logoUrl: input.logoUrl,
      isActive: input.isActive,
      settings: input.settings,
    });

    await this.storeRepository.update(store);
    return this.toOutput(store);
  }

  async delete(id: string, tenantId: string) {
    const store = await this.storeRepository.findById(id, tenantId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    await this.storeRepository.delete(id, tenantId);
  }

  private toOutput(store: Store) {
    return {
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
      settings: store.settings,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
  }
}
