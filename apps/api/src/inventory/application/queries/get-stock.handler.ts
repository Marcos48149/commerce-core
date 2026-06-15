import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InventoryRepository } from '../../domain/inventory.repository';
import { Stock } from '../../domain/stock.entity';

export class GetStockQuery {
  constructor(
    public readonly variantId: string,
    public readonly storeId: string,
  ) {}
}

export interface GetStockResult {
  stock: Stock | null;
}

@QueryHandler(GetStockQuery)
export class GetStockHandler implements IQueryHandler<GetStockQuery> {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(query: GetStockQuery): Promise<GetStockResult> {
    const stock = await this.inventoryRepository.findByVariant(
      query.variantId,
      query.storeId,
    );
    return { stock };
  }
}
