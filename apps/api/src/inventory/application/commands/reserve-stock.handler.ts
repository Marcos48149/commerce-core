import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InventoryRepository } from '../../domain/inventory.repository';
import { Stock } from '../../domain/stock.entity';

export class ReserveStockCommand {
  constructor(
    public readonly variantId: string,
    public readonly productId: string,
    public readonly storeId: string,
    public readonly tenantId: string,
    public readonly quantity: number,
    public readonly referenceId?: string,
  ) {}
}

export interface ReserveStockResult {
  success: boolean;
  stock: Stock;
}

@CommandHandler(ReserveStockCommand)
export class ReserveStockHandler implements ICommandHandler<ReserveStockCommand> {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(command: ReserveStockCommand): Promise<ReserveStockResult> {
    let stock = await this.inventoryRepository.findByVariant(
      command.variantId,
      command.storeId,
    );

    if (!stock) {
      throw new Error('Stock record not found for this variant');
    }

    stock.reserve(command.quantity);
    await this.inventoryRepository.update(stock);

    await this.inventoryRepository.createAdjustmentLog({
      stockId: stock.id,
      variantId: command.variantId,
      storeId: command.storeId,
      type: 'reserve',
      quantity: command.quantity,
      reason: command.referenceId
        ? `Reserved for reference ${command.referenceId}`
        : 'Manual reservation',
      referenceId: command.referenceId ?? null,
    });

    return { success: true, stock };
  }
}
