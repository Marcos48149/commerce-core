import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UlidService } from '../../common/ulid.service';
import { CatalogRepository } from '../domain/catalog.repository';
import { Category } from '../domain/category.entity';
import { Slug } from '../domain/value-objects';

export interface CreateCategoryInput {
  tenantId: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  id: string;
  storeId: string;
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ManageCategoriesResult {
  category: Category;
}

@Injectable()
export class ManageCategoriesUseCase {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly ulidService: UlidService,
  ) {}

  async create(input: CreateCategoryInput): Promise<ManageCategoriesResult> {
    const slug = Slug.create(input.slug);
    const existing = await this.catalogRepository.findCategoryBySlug(input.storeId, slug.value);
    if (existing) {
      throw new ConflictException('A category with this slug already exists in this store');
    }

    const category = Category.create({
      id: this.ulidService.generate(),
      tenantId: input.tenantId,
      storeId: input.storeId,
      name: input.name,
      slug,
      description: input.description,
      imageUrl: input.imageUrl,
      parentId: input.parentId,
      sortOrder: input.sortOrder,
    });

    await this.catalogRepository.saveCategory(category);
    return { category };
  }

  async update(input: UpdateCategoryInput): Promise<ManageCategoriesResult> {
    const category = await this.catalogRepository.findCategoryById(input.id, input.storeId);
    if (!category || category.isDeleted()) {
      throw new NotFoundException('Category not found');
    }

    const updateParams: Parameters<Category['update']>[0] = {};

    if (input.slug) {
      const slug = Slug.create(input.slug);
      const existing = await this.catalogRepository.findCategoryBySlug(input.storeId, slug.value);
      if (existing && existing.id !== input.id) {
        throw new ConflictException('A category with this slug already exists in this store');
      }
      updateParams.slug = slug;
    }

    if (input.name !== undefined) updateParams.name = input.name;
    if (input.description !== undefined) updateParams.description = input.description;
    if (input.imageUrl !== undefined) updateParams.imageUrl = input.imageUrl;
    if (input.parentId !== undefined) updateParams.parentId = input.parentId;
    if (input.sortOrder !== undefined) updateParams.sortOrder = input.sortOrder;
    if (input.isActive !== undefined) updateParams.isActive = input.isActive;

    category.update(updateParams);
    await this.catalogRepository.updateCategory(category);

    return { category };
  }

  async delete(id: string, storeId: string): Promise<void> {
    const category = await this.catalogRepository.findCategoryById(id, storeId);
    if (!category || category.isDeleted()) {
      throw new NotFoundException('Category not found');
    }

    await this.catalogRepository.deleteCategory(id, storeId);
  }
}
