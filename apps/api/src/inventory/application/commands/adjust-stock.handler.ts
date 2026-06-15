import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InventoryRepository } from '../../domain/inventory.repository';
import { Stock } from '../../domain/stock.entity';

export class AdjustStockCommand {
  constructor(
    public readonly variantId: string,
    public readonly storeId: string,
    public readonly quantity: number,
    public readonly reason: string,
    public readonly referenceId?: string,
  ) {}
}

export interface AdjustStockResult {
  success: boolean;
  stock: Stock;
}

@CommandHandler(AdjustStockCommand)
export class AdjustStockHandler implements ICommandHandler<AdjustStockCommand> {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(command: AdjustStockCommand): Promise<AdjustStockResult> {
    const stock = await this.inventoryRepository.findByVariant(
      command.variantId,
      command.storeId,
    );

    if (!stock) {
      throw new Error('Stock record not found for this variant');
    }

    stock.adjust(command.quantity);
    await this.inventoryRepository.update(stock);

    await this.inventoryRepository.createAdjustmentLog({
      stockId: stock.id,
      variantId: command.variantId,
      storeId: command.storeId,
      type: command.quantity > 0 ? 'add' : 'remove',
      quantity: command.quantity,
      reason: command.reason,
      referenceId: command.referenceId ?? null,
    });

    return { success: true, stock };
  }
}
