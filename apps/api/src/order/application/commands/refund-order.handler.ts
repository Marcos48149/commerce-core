import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { OrderRepository } from '../../domain/order.repository';
import { OrderStatus } from '../../domain/order.entity';
import { LogActionUseCase } from '../../../audit-log/application/log-action.use-case';

export class RefundOrderCommand {
  constructor(
    public readonly orderId: string,
    public readonly storeId: string,
    public readonly reason?: string,
  ) {}
}

@CommandHandler(RefundOrderCommand)
export class RefundOrderHandler implements ICommandHandler<RefundOrderCommand> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventBus: EventBus,
    private readonly logAction: LogActionUseCase,
  ) {}

  async execute(command: RefundOrderCommand): Promise<void> {
    const order = await this.orderRepository.findById(command.orderId, command.storeId);
    if (!order) throw new Error('Order not found');

    const previousStatus = order.status;
    order.transition(OrderStatus.REFUNDED);

    if (command.reason) {
      order.addNote(`Refunded: ${command.reason}`);
    }

    await this.orderRepository.update(order);

    await this.logAction.execute({
      tenantId: order.tenantId,
      storeId: command.storeId,
      entityType: 'order',
      entityId: command.orderId,
      action: 'order.refunded',
      oldValue: { status: previousStatus } as any,
      newValue: { status: OrderStatus.REFUNDED, reason: command.reason } as any,
    });

    this.eventBus.publish(
      new OrderRefundedEvent(order.id, command.storeId, order.tenantId, order.orderNumber),
    );
  }
}

export class OrderRefundedEvent {
  constructor(
    public readonly orderId: string,
    public readonly storeId: string,
    public readonly tenantId: string,
    public readonly orderNumber: number,
  ) {}
}
