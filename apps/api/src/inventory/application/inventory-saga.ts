import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ReserveStockCommand } from './commands/reserve-stock.handler';
import { ConfirmStockCommand } from './commands/confirm-stock.handler';
import { CancelReservationCommand } from './commands/cancel-reservation.handler';

export interface ReserveRequest {
  variantId: string;
  productId: string;
  storeId: string;
  tenantId: string;
  quantity: number;
  referenceId: string;
}

export interface ReserveResponse {
  success: boolean;
  rejectionReason?: string;
}

export type SagaStep = 'reserved' | 'confirmed' | 'cancelled';

@Injectable()
export class InventorySaga {
  private readonly logger = new Logger(InventorySaga.name);

  constructor(private readonly commandBus: CommandBus) {}

  async reserve(request: ReserveRequest): Promise<ReserveResponse> {
    try {
      await this.commandBus.execute(
        new ReserveStockCommand(
          request.variantId,
          request.productId,
          request.storeId,
          request.tenantId,
          request.quantity,
          request.referenceId,
        ),
      );

      this.logger.log(
        `Reserved ${request.quantity} of variant ${request.variantId} for ${request.referenceId}`,
      );

      return { success: true };
    } catch (error: any) {
      this.logger.warn(
        `Reservation failed for variant ${request.variantId}: ${error.message}`,
      );

      return {
        success: false,
        rejectionReason: error.message || 'Insufficient stock',
      };
    }
  }

  async confirm(variantId: string, storeId: string, quantity: number, referenceId: string): Promise<boolean> {
    try {
      await this.commandBus.execute(
        new ConfirmStockCommand(variantId, storeId, quantity, referenceId),
      );

      this.logger.log(
        `Confirmed ${quantity} of variant ${variantId} for ${referenceId}`,
      );

      return true;
    } catch (error: any) {
      this.logger.error(
        `Confirmation failed for variant ${variantId}: ${error.message}`,
      );
      return false;
    }
  }

  async cancel(variantId: string, storeId: string, quantity: number, referenceId: string): Promise<boolean> {
    try {
      await this.commandBus.execute(
        new CancelReservationCommand(variantId, storeId, quantity, referenceId),
      );

      this.logger.log(
        `Cancelled reservation for ${quantity} of variant ${variantId} (ref: ${referenceId})`,
      );

      return true;
    } catch (error: any) {
      this.logger.error(
        `Cancellation failed for variant ${variantId}: ${error.message}`,
      );
      return false;
    }
  }

  async reserveOrRestore(
    variantId: string,
    productId: string,
    storeId: string,
    tenantId: string,
    quantity: number,
    referenceId: string,
  ): Promise<ReserveResponse> {
    const reserveResult = await this.reserve({
      variantId,
      productId,
      storeId,
      tenantId,
      quantity,
      referenceId,
    });

    if (!reserveResult.success) {
      return reserveResult;
    }

    return { success: true };
  }

  async confirmOrRestore(
    variantId: string,
    storeId: string,
    quantity: number,
    referenceId: string,
  ): Promise<boolean> {
    const confirmed = await this.confirm(variantId, storeId, quantity, referenceId);

    if (!confirmed) {
      this.logger.warn(
        `Could not confirm reservation for ${variantId} (ref: ${referenceId}) — restoring stock`,
      );
      await this.cancel(variantId, storeId, quantity, referenceId);
      return false;
    }

    return true;
  }
}
