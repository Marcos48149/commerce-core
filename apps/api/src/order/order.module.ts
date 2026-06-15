import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IamModule } from '../iam/iam.module';
import { InventoryModule } from '../inventory/inventory.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { WebhookModule } from '../webhook/webhook.module';
import { NotificationModule } from '../notification/notification.module';
import { OrderRepository } from './domain/order.repository';
import { PrismaOrderRepository } from './infrastructure/prisma-order.repository';
import { InitiateOrderHandler } from './application/commands/initiate-order.handler';
import { ConfirmOrderHandler } from './application/commands/confirm-order.handler';
import { CancelOrderHandler } from './application/commands/cancel-order.handler';
import { RefundOrderHandler } from './application/commands/refund-order.handler';
import { GetOrderHandler } from './application/queries/get-order.handler';
import { ListOrdersHandler } from './application/queries/list-orders.handler';
import { OrderSaga } from './application/order-saga';
import { OrderController } from './interface/order.controller';

const CommandHandlers = [
  InitiateOrderHandler,
  ConfirmOrderHandler,
  CancelOrderHandler,
  RefundOrderHandler,
];

const QueryHandlers = [
  GetOrderHandler,
  ListOrdersHandler,
];

@Module({
  imports: [CqrsModule, IamModule, InventoryModule, AuditLogModule, WebhookModule, NotificationModule],
  controllers: [OrderController],
  providers: [
    { provide: OrderRepository, useClass: PrismaOrderRepository },
    ...CommandHandlers,
    ...QueryHandlers,
    OrderSaga,
  ],
  exports: [OrderRepository],
})
export class OrderModule {}
