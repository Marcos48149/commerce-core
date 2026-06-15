import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { PaymentRepository } from '../../domain/payment.repository';
import { ConfirmOrderCommand } from '../../../order/application/commands/confirm-order.handler';
import { CancelOrderCommand } from '../../../order/application/commands/cancel-order.handler';

export class HandlePaymentWebhookCommand {
  constructor(
    public readonly providerCode: string,
    public readonly storeId: string,
    public readonly idempotencyKey: string,
    public readonly payload: unknown,
    public readonly headers: Record<string, string>,
  ) {}
}

@CommandHandler(HandlePaymentWebhookCommand)
export class HandlePaymentWebhookHandler implements ICommandHandler<HandlePaymentWebhookCommand> {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: HandlePaymentWebhookCommand): Promise<{ status: string }> {
    const existing = await this.paymentRepository.findByIdempotencyKey(command.idempotencyKey);
    if (existing) {
      return { status: existing.status };
    }

    const provider = await this.paymentRepository.findActiveProvider(command.storeId, command.providerCode);
    if (!provider) throw new Error(`No active provider found: ${command.providerCode}`);

    let event: any;
    try {
      const { MercadoPagoAdapter } = await import('../adapters/mercadopago.adapter');
      const { PaywayAdapter } = await import('../adapters/payway.adapter');
      const { ModoAdapter } = await import('../adapters/modo.adapter');
      const { NaranjaXAdapter } = await import('../adapters/naranja-x.adapter');

      const adapterMap: Record<string, any> = {
        mercadopago: MercadoPagoAdapter,
        payway: PaywayAdapter,
        modo: ModoAdapter,
        naranjax: NaranjaXAdapter,
      };

      const AdapterClass = adapterMap[command.providerCode];
      if (!AdapterClass) throw new Error(`Unknown provider: ${command.providerCode}`);

      const adapter = new AdapterClass();
      adapter.configure(provider.config);
      event = await adapter.verifyWebhook(command.payload, command.headers);
    } catch {
      throw new Error('Failed to verify webhook payload');
    }

    const session = await this.paymentRepository.findById(event.sessionId, command.storeId);
    if (!session) throw new Error('Payment session not found');

    switch (event.event) {
      case 'payment.paid':
        session.confirm();
        await this.paymentRepository.update(session);
        await this.commandBus.execute(new ConfirmOrderCommand(session.orderId, command.storeId));
        break;

      case 'payment.rejected':
        session.reject('Payment rejected by provider');
        await this.paymentRepository.update(session);
        await this.commandBus.execute(new CancelOrderCommand(session.orderId, command.storeId, 'Payment rejected'));
        break;

      case 'payment.refunded':
        session.refund();
        await this.paymentRepository.update(session);
        break;

      default:
        throw new Error(`Unknown payment event: ${event.event}`);
    }

    return { status: session.status };
  }
}
