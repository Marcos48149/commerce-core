export interface DomainEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: Record<string, unknown>;
  storeId: string;
  tenantId: string;
}

export type WebhookEventType =
  | 'order_created'
  | 'order_paid'
  | 'order_cancelled'
  | 'order_updated'
  | 'inventory_updated'
  | 'customer_created';
