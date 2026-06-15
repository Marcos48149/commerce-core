import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InventoryRepository } from '../../domain/inventory.repository';
import { Stock } from '../../domain/stock.entity';

export class ConfirmStockCommand {
  constructor(
    public readonly variantId: string,
    public readonly storeId: string,
    public readonly quantity: number,
    public readonly referenceId?: string,
  ) {}
}

export interface ConfirmStockResult {
  success: boolean;
  stock: Stock;
}

@CommandHandler(ConfirmStockCommand)
export class ConfirmStockHandler implements ICommandHandler<ConfirmStockCommand> {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(command: ConfirmStockCommand): Promise<ConfirmStockResult> {
    const stock = await this.inventoryRepository.findByVariant(
      command.variantId,
      command.storeId,
    );

    if (!stock) {
      throw new Error('Stock record not found for this variant');
    }

    stock.confirmReservation(command.quantity);
    await this.inventoryRepository.update(stock);

    await this.inventoryRepository.createAdjustmentLog({
      stockId: stock.id,
      variantId: command.variantId,
      storeId: command.storeId,
      type: 'confirm',
      quantity: command.quantity,
      reason: command.referenceId
        ? `Confirmed for reference ${command.referenceId}`
        : 'Manual confirmation',
      referenceId: command.referenceId ?? null,
    });

    return { success: true, stock };
  }
}
