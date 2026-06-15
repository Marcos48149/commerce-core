import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentRepository } from './domain/payment.repository';
import { PrismaPaymentRepository } from './infrastructure/prisma-payment.repository';
import { MercadoPagoAdapter } from './application/adapters/mercadopago.adapter';
import { PaywayAdapter } from './application/adapters/payway.adapter';
import { ModoAdapter } from './application/adapters/modo.adapter';
import { NaranjaXAdapter } from './application/adapters/naranja-x.adapter';
import { HandlePaymentWebhookHandler } from './application/commands/handle-payment-webhook.handler';
import { PaymentWebhookController } from './interface/payment-webhook.controller';

@Module({
  imports: [CqrsModule],
  controllers: [PaymentWebhookController],
  providers: [
    { provide: PaymentRepository, useClass: PrismaPaymentRepository },
    MercadoPagoAdapter,
    PaywayAdapter,
    ModoAdapter,
    NaranjaXAdapter,
    HandlePaymentWebhookHandler,
  ],
  exports: [PaymentRepository, MercadoPagoAdapter, PaywayAdapter, ModoAdapter, NaranjaXAdapter],
})
export class PaymentModule {}
