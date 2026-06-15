import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IamModule } from '../iam/iam.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { InventoryRepository } from './domain/inventory.repository';
import { PrismaInventoryRepository } from './infrastructure/prisma-inventory.repository';
import { ReserveStockHandler } from './application/commands/reserve-stock.handler';
import { ConfirmStockHandler } from './application/commands/confirm-stock.handler';
import { CancelReservationHandler } from './application/commands/cancel-reservation.handler';
import { AdjustStockHandler } from './application/commands/adjust-stock.handler';
import { GetStockHandler } from './application/queries/get-stock.handler';
import { InventorySaga } from './application/inventory-saga';
import { InventoryController } from './interface/inventory.controller';

@Module({
  imports: [CqrsModule, IamModule, AuditLogModule],
  controllers: [InventoryController],
  providers: [
    { provide: InventoryRepository, useClass: PrismaInventoryRepository },
    ReserveStockHandler,
    ConfirmStockHandler,
    CancelReservationHandler,
    AdjustStockHandler,
    GetStockHandler,
    InventorySaga,
  ],
  exports: [InventorySaga, InventoryRepository],
})
export class InventoryModule {}
