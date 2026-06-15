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
export class ModoAdapter implements PaymentProvider {
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
      ? 'https://sandbox.api.modo.com.ar/v1'
      : 'https://api.modo.com.ar/v1';

    const response = await fetch(`${baseUrl}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        transaction_amount: order.total.amount,
        description: `Order #${order.orderNumber}`,
        external_reference: order.id,
        payer: { email: order.customerEmail },
      }),
    });

    if (!response.ok) throw new Error(`Modo API error: ${response.statusText}`);
    const data = await response.json();

    return {
      sessionId: data.session_id?.toString(),
      url: data.checkout_url,
      status: 'PENDING',
    };
  }

  async getStatus(sessionId: string): Promise<string> {
    const baseUrl = this.sandbox
      ? 'https://sandbox.api.modo.com.ar/v1'
      : 'https://api.modo.com.ar/v1';

    const response = await fetch(`${baseUrl}/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) throw new Error(`Modo API error: ${response.statusText}`);
    const data = await response.json();
    return data.status;
  }

  async refund(transactionId: string, amount?: Money): Promise<RefundResult> {
    const baseUrl = this.sandbox
      ? 'https://sandbox.api.modo.com.ar/v1'
      : 'https://api.modo.com.ar/v1';

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

    if (!response.ok) throw new Error(`Modo refund error: ${response.statusText}`);
    const data = await response.json();

    return {
      transactionId: data.id?.toString(),
      status: data.status,
      amount: amount ?? { amount: 0, currency: 'ARS' },
    };
  }

  async verifyWebhook(payload: unknown, headers: Record<string, string>): Promise<PaymentEvent> {
    const data = payload as any;
    const signature = headers['x-modo-signature'] ?? '';

    const statusMap: Record<string, 'payment.paid' | 'payment.rejected' | 'payment.refunded'> = {
      'payment.approved': 'payment.paid',
      'payment.rejected': 'payment.rejected',
      'payment.refunded': 'payment.refunded',
    };

    return {
      event: statusMap[data.event ?? data.type] ?? 'payment.rejected',
      sessionId: data.session_id?.toString() ?? '',
      transactionId: data.payment_id?.toString(),
      amount: { amount: data.amount ?? 0, currency: 'ARS' },
      metadata: { signature },
    };
  }
}
