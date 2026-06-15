import type { Money } from '@commerce/shared';

export interface PaymentSessionResult {
  sessionId: string;
  url: string;
  status: string;
}

export interface RefundResult {
  transactionId: string;
  status: string;
  amount: Money;
}

export interface PaymentEvent {
  event: 'payment.paid' | 'payment.rejected' | 'payment.refunded';
  sessionId: string;
  transactionId?: string;
  amount: Money;
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  createSession(order: PaymentOrderInfo): Promise<PaymentSessionResult>;
  getStatus(sessionId: string): Promise<string>;
  refund(transactionId: string, amount?: Money): Promise<RefundResult>;
  verifyWebhook(payload: unknown, headers: Record<string, string>): Promise<PaymentEvent>;
}

export interface PaymentOrderInfo {
  id: string;
  orderNumber: number;
  total: Money;
  items: Array<{ name: string; quantity: number; unitPrice: Money }>;
  customerEmail: string;
  customerName: string;
}

export interface ShippingRateRequest {
  origin: { postalCode: string; country: string };
  destination: { postalCode: string; country: string; province?: string };
  items: Array<{ weight: number; dimensions?: { length: number; width: number; height: number } }>;
}

export interface ShippingRate {
  id: string;
  name: string;
  cost: Money;
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
}

export interface LabelResult {
  trackingNumber: string;
  labelUrl: string;
  cost: Money;
}

export interface TrackingInfo {
  status: string;
  location?: string;
  estimatedDelivery?: Date;
  events: Array<{ date: Date; description: string; location?: string }>;
}

export interface ShippingProvider {
  calculateRate(request: ShippingRateRequest): Promise<ShippingRate[]>;
  createLabel(shipment: ShipmentInfo): Promise<LabelResult>;
  track(trackingNumber: string): Promise<TrackingInfo>;
}

export interface ShipmentInfo {
  orderId: string;
  rateId: string;
  origin: { address: string; postalCode: string; country: string };
  destination: { address: string; postalCode: string; country: string; province?: string };
  items: Array<{ name: string; quantity: number; weight?: number }>;
}

export interface EmailTemplate {
  id: string;
  subject: string;
  body: string;
  type: 'html' | 'text';
}

export interface EmailProvider {
  send(template: EmailTemplate, to: string, data: Record<string, unknown>): Promise<void>;
}
