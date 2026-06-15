import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InventoryRepository } from '../../domain/inventory.repository';
import { Stock } from '../../domain/stock.entity';
import { LogActionUseCase } from '../../../audit-log/application/log-action.use-case';

export class AdjustStockCommand {
  constructor(
    public readonly variantId: string,
    public readonly storeId: string,
    public readonly quantity: number,
    public readonly reason: string,
    public readonly referenceId?: string,
    public readonly tenantId?: string,
  ) {}
}

export interface AdjustStockResult {
  success: boolean;
  stock: Stock;
}

@CommandHandler(AdjustStockCommand)
export class AdjustStockHandler implements ICommandHandler<AdjustStockCommand> {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly logAction: LogActionUseCase,
  ) {}

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

    if (command.tenantId) {
      await this.logAction.execute({
        tenantId: command.tenantId,
        storeId: command.storeId,
        entityType: 'stock',
        entityId: stock.id,
        action: command.quantity > 0 ? 'stock.added' : 'stock.removed',
        newValue: { variantId: command.variantId, quantity: command.quantity, reason: command.reason } as any,
      });
    }

    return { success: true, stock };
  }
}
