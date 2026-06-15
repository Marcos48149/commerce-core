import { Injectable, NotFoundException } from '@nestjs/common';
import { CatalogRepository } from '../domain/catalog.repository';
import { LogActionUseCase } from '../../audit-log/application/log-action.use-case';

export interface DeleteProductInput {
  id: string;
  storeId: string;
  tenantId?: string;
}

@Injectable()
export class DeleteProductUseCase {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly logAction: LogActionUseCase,
  ) {}

  async execute(input: DeleteProductInput): Promise<void> {
    const product = await this.catalogRepository.findProductById(input.id, input.storeId);
    if (!product || product.isDeleted()) {
      throw new NotFoundException('Product not found');
    }

    await this.catalogRepository.deleteProduct(input.id, input.storeId);

    if (input.tenantId) {
      await this.logAction.execute({
        tenantId: input.tenantId,
        storeId: input.storeId,
        entityType: 'product',
        entityId: input.id,
        action: 'product.deleted',
        oldValue: { name: product.name } as any,
      });
    }
  }
}
