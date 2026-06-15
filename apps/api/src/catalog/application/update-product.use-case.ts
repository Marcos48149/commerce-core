import { Injectable, NotFoundException } from '@nestjs/common';
import { CatalogRepository } from '../domain/catalog.repository';
import { Product } from '../domain/product.entity';
import { Slug } from '../domain/value-objects';

export interface UpdateProductInput {
  id: string;
  storeId: string;
  tenantId: string;
  name?: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateProductResult {
  product: Product;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly catalogRepository: CatalogRepository,
  ) {}

  async execute(input: UpdateProductInput): Promise<UpdateProductResult> {
    const product = await this.catalogRepository.findProductById(input.id, input.storeId);
    if (!product || product.isDeleted()) {
      throw new NotFoundException('Product not found');
    }

    if (input.slug) {
      const slug = Slug.create(input.slug);
      const existing = await this.catalogRepository.findProductBySlug(input.storeId, slug.value);
      if (existing && existing.id !== input.id) {
        throw new Error('A product with this slug already exists in this store');
      }
      product.update({ slug });
    }

    product.update({
      name: input.name,
      description: input.description,
      isActive: input.isActive,
      metadata: input.metadata,
    });

    await this.catalogRepository.updateProduct(product);

    return { product };
  }
}
