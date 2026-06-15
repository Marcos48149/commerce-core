import { Injectable, NotFoundException } from '@nestjs/common';
import { CatalogRepository } from '../domain/catalog.repository';
import { Product } from '../domain/product.entity';
import { Variant } from '../domain/variant.entity';
import { InventoryRepository } from '../../inventory/domain/inventory.repository';

export interface GetProductInput {
  id: string;
  storeId: string;
  includeVariants?: boolean;
}

export interface VariantWithStock extends Variant {
  available?: number;
  reserved?: number;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
}

export interface GetProductResult {
  product: Product;
  variants?: VariantWithStock[];
}

@Injectable()
export class GetProductUseCase {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly inventoryRepository?: InventoryRepository,
  ) {}

  async execute(input: GetProductInput): Promise<GetProductResult> {
    const product = await this.catalogRepository.findProductById(input.id, input.storeId);
    if (!product || product.isDeleted()) {
      throw new NotFoundException('Product not found');
    }

    const result: GetProductResult = { product };

    if (input.includeVariants) {
      const variants = await this.catalogRepository.findVariantsByProduct(input.id, input.storeId);
      result.variants = variants;

      if (this.inventoryRepository) {
        result.variants = await Promise.all(
          variants.map(async (variant) => {
            const stock = await this.inventoryRepository!.findByVariant(variant.id, input.storeId);
            const variantWithStock: VariantWithStock = variant;
            if (stock) {
              variantWithStock.available = stock.available;
              variantWithStock.reserved = stock.reserved;
              variantWithStock.isLowStock = stock.isLowStock;
              variantWithStock.isOutOfStock = stock.isOutOfStock;
            }
            return variantWithStock;
          }),
        );
      }
    }

    return result;
  }
}
