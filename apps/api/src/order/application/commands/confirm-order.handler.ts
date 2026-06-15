import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { OrderRepository } from '../../domain/order.repository';
import { OrderStatus } from '../../domain/order.entity';
import { LogActionUseCase } from '../../../audit-log/application/log-action.use-case';

export class ConfirmOrderCommand {
  constructor(
    public readonly orderId: string,
    public readonly storeId: string,
  ) {}
}

@CommandHandler(ConfirmOrderCommand)
export class ConfirmOrderHandler implements ICommandHandler<ConfirmOrderCommand> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventBus: EventBus,
    private readonly logAction: LogActionUseCase,
  ) {}

  async execute(command: ConfirmOrderCommand): Promise<void> {
    const order = await this.orderRepository.findById(command.orderId, command.storeId);
    if (!order) throw new Error('Order not found');

    order.transition(OrderStatus.PAID);
    await this.orderRepository.update(order);

    await this.logAction.execute({
      tenantId: order.tenantId,
      storeId: command.storeId,
      entityType: 'order',
      entityId: command.orderId,
      action: 'order.paid',
      newValue: { status: OrderStatus.PAID, orderNumber: order.orderNumber } as any,
    });

    this.eventBus.publish(
      new OrderPaidEvent(order.id, command.storeId, order.tenantId, order.orderNumber),
    );
  }
}

export class OrderPaidEvent {
  constructor(
    public readonly orderId: string,
    public readonly storeId: string,
    public readonly tenantId: string,
    public readonly orderNumber: number,
  ) {}
}
