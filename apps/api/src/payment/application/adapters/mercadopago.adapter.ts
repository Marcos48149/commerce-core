import { Injectable } from '@nestjs/common';
import type {
  PaymentProvider,
  PaymentSessionResult,
  PaymentEvent,
  PaymentOrderInfo,
  RefundResult,
} from '../../domain/payment-provider.interface';
import type { Money } from '@commerce/shared';

@Injectable()
export class MercadoPagoAdapter implements PaymentProvider {
  private apiKey: string = '';
  private secret: string = '';
  private sandbox: boolean = true;

  configure(config: { apiKey: string; secret: string; sandbox?: boolean }): void {
    this.apiKey = config.apiKey;
    this.secret = config.secret;
    this.sandbox = config.sandbox ?? true;
  }

  async createSession(order: PaymentOrderInfo): Promise<PaymentSessionResult> {
    const baseUrl = this.sandbox
      ? 'https://api.mercadopago.com/sandbox/v1'
      : 'https://api.mercadopago.com/v1';

    const response = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        transaction_amount: order.total.amount,
        description: `Order #${order.orderNumber}`,
        payer: { email: order.customerEmail },
        external_reference: order.id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mercado Pago API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      sessionId: data.id.toString(),
      url: data.init_point ?? data.sandbox_init_point,
      status: 'PENDING',
    };
  }

  async getStatus(sessionId: string): Promise<string> {
    const baseUrl = this.sandbox
      ? 'https://api.mercadopago.com/sandbox/v1'
      : 'https://api.mercadopago.com/v1';

    const response = await fetch(`${baseUrl}/payments/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Mercado Pago API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.status;
  }

  async refund(transactionId: string, amount?: Money): Promise<RefundResult> {
    const baseUrl = this.sandbox
      ? 'https://api.mercadopago.com/sandbox/v1'
      : 'https://api.mercadopago.com/v1';

    const body: any = {};
    if (amount) body.amount = amount.amount;

    const response = await fetch(`${baseUrl}/payments/${transactionId}/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Mercado Pago refund error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      transactionId: data.id.toString(),
      status: data.status,
      amount: amount ?? { amount: 0, currency: 'ARS' },
    };
  }

  async verifyWebhook(payload: unknown, headers: Record<string, string>): Promise<PaymentEvent> {
    const data = payload as any;
    const xSignature = headers['x-signature'] ?? '';
    const xRequestId = headers['x-request-id'] ?? '';

    const statusMap: Record<string, 'payment.paid' | 'payment.rejected' | 'payment.refunded'> = {
      approved: 'payment.paid',
      rejected: 'payment.rejected',
      refunded: 'payment.refunded',
      charged_back: 'payment.refunded',
    };

    const eventType = statusMap[data.action ?? data.status] ?? 'payment.rejected';

    return {
      event: eventType,
      sessionId: data.data?.id?.toString() ?? data.id?.toString() ?? '',
      transactionId: data.id?.toString(),
      amount: { amount: data.data?.amount ?? data.transaction_amount ?? 0, currency: 'ARS' },
      metadata: { xSignature, xRequestId },
    };
  }
}
