import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { OrderCreatedEvent } from './commands/initiate-order.handler';
import { OrderPaidEvent } from './commands/confirm-order.handler';
import { OrderCancelledEvent } from './commands/cancel-order.handler';
import { OrderRepository } from '../domain/order.repository';
import { InventorySaga } from '../../inventory/application/inventory-saga';
import { EventBusService } from '../../webhook/application/event-bus.service';
import { SendNotificationUseCase } from '../../notification/application/send-notification.use-case';

@Injectable()
export class OrderSaga {
  private readonly logger = new Logger(OrderSaga.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly inventorySaga: InventorySaga,
    private readonly eventBus: EventBus,
    private readonly webhookEventBus: EventBusService,
    private readonly sendNotification: SendNotificationUseCase,
  ) {
    this.subscribe();
  }

  private subscribe(): void {
    this.eventBus.subscribe(async (event: any) => {
      if (event instanceof OrderCreatedEvent) {
        await this.handleOrderCreated(event).catch((err) =>
          this.logger.error(`OrderCreated saga failed: ${err.message}`, err.stack),
        );
      } else if (event instanceof OrderPaidEvent) {
        await this.handleOrderPaid(event).catch((err) =>
          this.logger.error(`OrderPaid saga failed: ${err.message}`, err.stack),
        );
      } else if (event instanceof OrderCancelledEvent) {
        await this.handleOrderCancelled(event).catch((err) =>
          this.logger.error(`OrderCancelled saga failed: ${err.message}`, err.stack),
        );
      }
    });
  }

  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    this.logger.log(`Order ${event.orderId} created — dispatching webhook`);

    await this.webhookEventBus.emit({
      type: 'order_created',
      source: 'order-service',
      data: {
        orderId: event.orderId,
        orderNumber: event.orderNumber,
        storeId: event.storeId,
      },
      storeId: event.storeId,
      tenantId: event.tenantId,
    });
  }

  async handleOrderPaid(event: OrderPaidEvent): Promise<void> {
    this.logger.log(`Order ${event.orderId} paid — starting saga`);

    const order = await this.orderRepository.findById(event.orderId, event.storeId);
    if (!order) {
      this.logger.error(`Order ${event.orderId} not found in saga`);
      return;
    }

    for (const item of order.items) {
      const confirmed = await this.inventorySaga.confirmOrRestore(
        item.variantId,
        event.storeId,
        item.quantity,
        `order-${event.orderId}`,
      );

      if (!confirmed) {
        this.logger.error(
          `Failed to confirm inventory for variant ${item.variantId} on order ${event.orderId}`,
        );
      }
    }

    await this.webhookEventBus.emit({
      type: 'order_paid',
      source: 'order-service',
      data: {
        orderId: event.orderId,
        orderNumber: event.orderNumber,
        storeId: event.storeId,
      },
      storeId: event.storeId,
      tenantId: event.tenantId,
    });

    await this.sendNotification.execute({
      tenantId: event.tenantId,
      storeId: event.storeId,
      to: order.customerId ?? '',
      type: 'order_confirmation',
      metadata: {
        orderId: event.orderId,
        orderNumber: event.orderNumber,
      },
    });

    this.logger.log(`Order ${event.orderId} — inventory deducted, webhook and notification dispatched`);
  }

  async handleOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    this.logger.log(`Order ${event.orderId} cancelled — restoring inventory`);

    if (event.previousStatus === 'PENDING_PAYMENT') {
      return;
    }

    const order = await this.orderRepository.findById(event.orderId, event.storeId);
    if (!order) {
      this.logger.error(`Order ${event.orderId} not found in saga`);
      return;
    }

    for (const item of order.items) {
      await this.inventorySaga.cancel(
        item.variantId,
        event.storeId,
        item.quantity,
        `cancel-order-${event.orderId}`,
      );
    }

    await this.webhookEventBus.emit({
      type: 'order_cancelled',
      source: 'order-service',
      data: {
        orderId: event.orderId,
        orderNumber: event.orderNumber,
        storeId: event.storeId,
        previousStatus: event.previousStatus,
      },
      storeId: event.storeId,
      tenantId: event.tenantId,
    });

    this.logger.log(`Order ${event.orderId} — inventory restored, webhook dispatched`);
  }
}
