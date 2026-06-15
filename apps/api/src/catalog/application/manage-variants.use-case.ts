import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UlidService } from '../../common/ulid.service';
import { CatalogRepository } from '../domain/catalog.repository';
import { Variant } from '../domain/variant.entity';
import { Money, Sku, Weight, Dimensions } from '../domain/value-objects';

export interface AddVariantInput {
  productId: string;
  storeId: string;
  tenantId: string;
  sku: string;
  name: string;
  price: number;
  currency?: string;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  weight?: number | null;
  weightUnit?: 'g' | 'kg' | 'lb' | 'oz';
  barcode?: string | null;
  sortOrder?: number;
}

export interface UpdateVariantInput {
  id: string;
  storeId: string;
  sku?: string;
  name?: string;
  price?: number;
  currency?: string;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  weight?: number | null;
  weightUnit?: 'g' | 'kg' | 'lb' | 'oz';
  barcode?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ManageVariantsResult {
  variant: Variant;
}

@Injectable()
export class ManageVariantsUseCase {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly ulidService: UlidService,
  ) {}

  async addVariant(input: AddVariantInput): Promise<ManageVariantsResult> {
    const product = await this.catalogRepository.findProductById(input.productId, input.storeId);
    if (!product || product.isDeleted()) {
      throw new NotFoundException('Product not found');
    }

    const sku = Sku.create(input.sku);
    const existing = await this.catalogRepository.findVariantBySku(input.storeId, sku.value);
    if (existing) {
      throw new ConflictException(`Variant with SKU '${sku.value}' already exists in this store`);
    }

    const variant = Variant.create({
      id: this.ulidService.generate(),
      productId: input.productId,
      tenantId: input.tenantId,
      storeId: input.storeId,
      sku,
      name: input.name,
      price: Money.create(input.price, input.currency),
      compareAtPrice: input.compareAtPrice != null ? Money.create(input.compareAtPrice, input.currency) : null,
      costPrice: input.costPrice != null ? Money.create(input.costPrice, input.currency) : null,
      weight: input.weight != null ? Weight.create(input.weight, input.weightUnit) : null,
      barcode: input.barcode,
      sortOrder: input.sortOrder,
    });

    await this.catalogRepository.saveVariant(variant);

    return { variant };
  }

  async updateVariant(input: UpdateVariantInput): Promise<ManageVariantsResult> {
    const variant = await this.catalogRepository.findVariantById(input.id, input.storeId);
    if (!variant || variant.isDeleted()) {
      throw new NotFoundException('Variant not found');
    }

    const updateParams: Parameters<Variant['update']>[0] = {};

    if (input.sku) {
      const sku = Sku.create(input.sku);
      const existing = await this.catalogRepository.findVariantBySku(input.storeId, sku.value);
      if (existing && existing.id !== input.id) {
        throw new ConflictException(`Variant with SKU '${sku.value}' already exists in this store`);
      }
      updateParams.sku = sku;
    }

    if (input.name !== undefined) updateParams.name = input.name;
    if (input.price !== undefined) updateParams.price = Money.create(input.price, input.currency);
    if (input.compareAtPrice !== undefined) {
      updateParams.compareAtPrice = input.compareAtPrice != null ? Money.create(input.compareAtPrice, input.currency) : null;
    }
    if (input.costPrice !== undefined) {
      updateParams.costPrice = input.costPrice != null ? Money.create(input.costPrice, input.currency) : null;
    }
    if (input.weight !== undefined) {
      updateParams.weight = input.weight != null ? Weight.create(input.weight, input.weightUnit) : null;
    }
    if (input.barcode !== undefined) updateParams.barcode = input.barcode;
    if (input.isActive !== undefined) updateParams.isActive = input.isActive;
    if (input.sortOrder !== undefined) updateParams.sortOrder = input.sortOrder;

    variant.update(updateParams);
    await this.catalogRepository.updateVariant(variant);

    return { variant };
  }

  async deleteVariant(id: string, storeId: string): Promise<void> {
    const variant = await this.catalogRepository.findVariantById(id, storeId);
    if (!variant || variant.isDeleted()) {
      throw new NotFoundException('Variant not found');
    }

    await this.catalogRepository.deleteVariant(id, storeId);
  }
}
