import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InventoryRepository } from '../../domain/inventory.repository';
import { Stock } from '../../domain/stock.entity';

export class CancelReservationCommand {
  constructor(
    public readonly variantId: string,
    public readonly storeId: string,
    public readonly quantity: number,
    public readonly referenceId?: string,
  ) {}
}

export interface CancelReservationResult {
  success: boolean;
  stock: Stock;
}

@CommandHandler(CancelReservationCommand)
export class CancelReservationHandler implements ICommandHandler<CancelReservationCommand> {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(command: CancelReservationCommand): Promise<CancelReservationResult> {
    const stock = await this.inventoryRepository.findByVariant(
      command.variantId,
      command.storeId,
    );

    if (!stock) {
      throw new Error('Stock record not found for this variant');
    }

    stock.cancelReservation(command.quantity);
    await this.inventoryRepository.update(stock);

    await this.inventoryRepository.createAdjustmentLog({
      stockId: stock.id,
      variantId: command.variantId,
      storeId: command.storeId,
      type: 'cancel_reservation',
      quantity: command.quantity,
      reason: command.referenceId
        ? `Reservation cancelled for reference ${command.referenceId}`
        : 'Manual cancellation',
      referenceId: command.referenceId ?? null,
    });

    return { success: true, stock };
  }
}
