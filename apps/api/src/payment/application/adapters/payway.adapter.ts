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
export class PaywayAdapter implements PaymentProvider {
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
      ? 'https://sandbox.api.payway.com.ar/v1'
      : 'https://api.payway.com.ar/v1';

    const response = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        amount: order.total.amount,
        description: `Order #${order.orderNumber}`,
        external_reference: order.id,
        customer: { email: order.customerEmail },
      }),
    });

    if (!response.ok) {
      throw new Error(`Payway API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      sessionId: data.id?.toString(),
      url: data.init_point ?? data.checkout_url,
      status: 'PENDING',
    };
  }

  async getStatus(sessionId: string): Promise<string> {
    const baseUrl = this.sandbox
      ? 'https://sandbox.api.payway.com.ar/v1'
      : 'https://api.payway.com.ar/v1';

    const response = await fetch(`${baseUrl}/payments/${sessionId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) throw new Error(`Payway API error: ${response.statusText}`);
    const data = await response.json();
    return data.status;
  }

  async refund(transactionId: string, amount?: Money): Promise<RefundResult> {
    const baseUrl = this.sandbox
      ? 'https://sandbox.api.payway.com.ar/v1'
      : 'https://api.payway.com.ar/v1';

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

    if (!response.ok) throw new Error(`Payway refund error: ${response.statusText}`);
    const data = await response.json();

    return {
      transactionId: data.id?.toString(),
      status: data.status,
      amount: amount ?? { amount: 0, currency: 'ARS' },
    };
  }

  async verifyWebhook(payload: unknown, headers: Record<string, string>): Promise<PaymentEvent> {
    const data = payload as any;
    const signature = headers['x-webhook-signature'] ?? '';

    const statusMap: Record<string, 'payment.paid' | 'payment.rejected' | 'payment.refunded'> = {
      approved: 'payment.paid',
      rejected: 'payment.rejected',
      refunded: 'payment.refunded',
    };

    return {
      event: statusMap[data.status] ?? 'payment.rejected',
      sessionId: data.payment_id?.toString() ?? '',
      transactionId: data.id?.toString(),
      amount: { amount: data.amount ?? 0, currency: 'ARS' },
      metadata: { signature },
    };
  }
}
