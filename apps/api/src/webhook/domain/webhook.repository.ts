import { WebhookEndpoint } from './webhook.entity';
import { WebhookEventType } from './domain-event';

import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class WebhookRepository {
  abstract findById(id: string, storeId: string): Promise<WebhookEndpoint | null>;
  abstract findByStore(storeId: string): Promise<WebhookEndpoint[]>;
  abstract findByEvent(eventType: WebhookEventType, storeId: string): Promise<WebhookEndpoint[]>;
  abstract findByEventAcrossStores(eventType: WebhookEventType, tenantId: string): Promise<WebhookEndpoint[]>;
  abstract save(webhook: WebhookEndpoint): Promise<void>;
  abstract update(webhook: WebhookEndpoint): Promise<void>;
  abstract delete(id: string, storeId: string): Promise<void>;
}
