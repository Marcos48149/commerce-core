import { Injectable } from '@nestjs/common';
import { UlidService } from '../../common/ulid.service';
import { CatalogRepository } from '../domain/catalog.repository';
import { Product } from '../domain/product.entity';
import { Money, Slug } from '../domain/value-objects';

export interface CreateProductInput {
  tenantId: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string | null;
  metadata?: Record<string, unknown>;
  variants?: CreateVariantInput[];
}

export interface CreateVariantInput {
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

export interface CreateProductResult {
  product: Product;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly ulidService: UlidService,
  ) {}

  async execute(input: CreateProductInput): Promise<CreateProductResult> {
    const slug = Slug.create(input.slug);

    const existing = await this.catalogRepository.findProductBySlug(input.storeId, slug.value);
    if (existing) {
      throw new Error('A product with this slug already exists in this store');
    }

    const product = Product.create({
      id: this.ulidService.generate(),
      tenantId: input.tenantId,
      storeId: input.storeId,
      name: input.name,
      slug,
      description: input.description,
      metadata: input.metadata,
    });

    await this.catalogRepository.saveProduct(product);

    return { product };
  }
}
