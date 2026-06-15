import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UlidService } from '../../common/ulid.service';
import { CatalogRepository } from '../domain/catalog.repository';
import { Collection } from '../domain/collection.entity';
import { Slug } from '../domain/value-objects';

export interface CreateCollectionInput {
  tenantId: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
}

export interface UpdateCollectionInput {
  id: string;
  storeId: string;
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ManageCollectionsResult {
  collection: Collection;
}

@Injectable()
export class ManageCollectionsUseCase {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly ulidService: UlidService,
  ) {}

  async create(input: CreateCollectionInput): Promise<ManageCollectionsResult> {
    const slug = Slug.create(input.slug);
    const existing = await this.catalogRepository.findCollectionBySlug(input.storeId, slug.value);
    if (existing) {
      throw new ConflictException('A collection with this slug already exists in this store');
    }

    const collection = Collection.create({
      id: this.ulidService.generate(),
      tenantId: input.tenantId,
      storeId: input.storeId,
      name: input.name,
      slug,
      description: input.description,
      imageUrl: input.imageUrl,
      sortOrder: input.sortOrder,
    });

    await this.catalogRepository.saveCollection(collection);
    return { collection };
  }

  async update(input: UpdateCollectionInput): Promise<ManageCollectionsResult> {
    const collection = await this.catalogRepository.findCollectionById(input.id, input.storeId);
    if (!collection || collection.isDeleted()) {
      throw new NotFoundException('Collection not found');
    }

    const updateParams: Parameters<Collection['update']>[0] = {};

    if (input.slug) {
      const slug = Slug.create(input.slug);
      const existing = await this.catalogRepository.findCollectionBySlug(input.storeId, slug.value);
      if (existing && existing.id !== input.id) {
        throw new ConflictException('A collection with this slug already exists in this store');
      }
      updateParams.slug = slug;
    }

    if (input.name !== undefined) updateParams.name = input.name;
    if (input.description !== undefined) updateParams.description = input.description;
    if (input.imageUrl !== undefined) updateParams.imageUrl = input.imageUrl;
    if (input.sortOrder !== undefined) updateParams.sortOrder = input.sortOrder;
    if (input.isActive !== undefined) updateParams.isActive = input.isActive;

    collection.update(updateParams);
    await this.catalogRepository.updateCollection(collection);

    return { collection };
  }

  async delete(id: string, storeId: string): Promise<void> {
    const collection = await this.catalogRepository.findCollectionById(id, storeId);
    if (!collection || collection.isDeleted()) {
      throw new NotFoundException('Collection not found');
    }

    await this.catalogRepository.deleteCollection(id, storeId);
  }
}
