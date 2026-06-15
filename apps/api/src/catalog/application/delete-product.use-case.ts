import { Injectable, NotFoundException } from '@nestjs/common';
import { CatalogRepository } from '../domain/catalog.repository';

export interface DeleteProductInput {
  id: string;
  storeId: string;
}

@Injectable()
export class DeleteProductUseCase {
  constructor(
    private readonly catalogRepository: CatalogRepository,
  ) {}

  async execute(input: DeleteProductInput): Promise<void> {
    const product = await this.catalogRepository.findProductById(input.id, input.storeId);
    if (!product || product.isDeleted()) {
      throw new NotFoundException('Product not found');
    }

    await this.catalogRepository.deleteProduct(input.id, input.storeId);
  }
}
