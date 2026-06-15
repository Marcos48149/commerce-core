import {
  Controller, Post, Body, Headers, Param,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { HandlePaymentWebhookCommand } from '../application/commands/handle-payment-webhook.handler';

@ApiTags('Payment Webhooks')
@Controller('payments/webhook')
export class PaymentWebhookController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: unknown,
    @Headers() headers: Record<string, string>,
  ) {
    const idempotencyKey = headers['x-idempotency-key']
      ?? headers['x-webhook-id']
      ?? `${provider}-${Date.now()}`;

    return this.commandBus.execute(
      new HandlePaymentWebhookCommand(provider, headers['x-store-id'] ?? '', idempotencyKey, payload, headers),
    );
  }
}
