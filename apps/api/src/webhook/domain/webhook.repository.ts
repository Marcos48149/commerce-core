import { WebhookEndpoint } from './webhook.entity';
import { WebhookEventType } from './domain-event';

export interface WebhookRepository {
  findById(id: string, storeId: string): Promise<WebhookEndpoint | null>;
  findByStore(storeId: string): Promise<WebhookEndpoint[]>;
  findByEvent(eventType: WebhookEventType, storeId: string): Promise<WebhookEndpoint[]>;
  findByEventAcrossStores(eventType: WebhookEventType, tenantId: string): Promise<WebhookEndpoint[]>;
  save(webhook: WebhookEndpoint): Promise<void>;
  update(webhook: WebhookEndpoint): Promise<void>;
  delete(id: string, storeId: string): Promise<void>;
}
