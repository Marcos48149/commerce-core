import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UlidService } from '../../../common/ulid.service';
import { OrderRepository } from '../../domain/order.repository';
import { Order, OrderStatus } from '../../domain/order.entity';

export class InitiateOrderCommand {
  constructor(
    public readonly tenantId: string,
    public readonly storeId: string,
    public readonly customerId: string | null,
    public readonly items: Array<{
      variantId: string;
      productId: string;
      quantity: number;
      unitPrice: number;
    }>,
    public readonly subtotal: number,
    public readonly discount: number,
    public readonly shipping: number,
    public readonly total: number,
    public readonly currency: string,
    public readonly couponCode?: string,
    public readonly notes?: string,
  ) {}
}

export interface InitiateOrderResult {
  orderId: string;
  orderNumber: number;
  total: number;
  currency: string;
}

@CommandHandler(InitiateOrderCommand)
export class InitiateOrderHandler implements ICommandHandler<InitiateOrderCommand> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly ulidService: UlidService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: InitiateOrderCommand): Promise<InitiateOrderResult> {
    const orderNumber = (await this.orderRepository.findMaxOrderNumber(command.storeId)) + 1;

    const order = Order.create({
      id: this.ulidService.generate(),
      tenantId: command.tenantId,
      storeId: command.storeId,
      customerId: command.customerId,
      orderNumber,
      currency: command.currency,
      subtotal: command.subtotal,
      discount: command.discount,
      shipping: command.shipping,
      total: command.total,
      couponCode: command.couponCode,
      notes: command.notes,
      items: command.items.map((i) => ({
        id: this.ulidService.generate(),
        variantId: i.variantId,
        productId: i.productId,
        productName: '',
        variantName: '',
        sku: '',
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.quantity * i.unitPrice,
      })),
    });

    await this.orderRepository.save(order);

    this.eventBus.publish(
      new OrderCreatedEvent(order.id, command.storeId, command.tenantId, orderNumber),
    );

    return {
      orderId: order.id,
      orderNumber,
      total: command.total,
      currency: command.currency,
    };
  }
}

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly storeId: string,
    public readonly tenantId: string,
    public readonly orderNumber: number,
  ) {}
}
