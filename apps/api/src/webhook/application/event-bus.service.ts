import { Injectable, Logger } from '@nestjs/common';
import { ulid } from 'ulidx';
import { DomainEvent } from '../domain/domain-event';
import { WebhookRepository } from '../domain/webhook.repository';
import { DeliverWebhookUseCase } from './deliver-webhook.use-case';

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(
    private readonly webhookRepository: WebhookRepository,
    private readonly deliverWebhook: DeliverWebhookUseCase,
  ) {}

  async emit(event: Omit<DomainEvent, 'id' | 'timestamp'>): Promise<void> {
    const domainEvent: DomainEvent = {
      ...event,
      id: ulid(),
      timestamp: new Date(),
    };

    const endpoints = await this.webhookRepository.findByEventAcrossStores(
      event.type as any,
      event.tenantId,
    );

    const matching = endpoints.filter((ep) => ep.isActive && ep.matchesEvent(event.type));

    if (matching.length === 0) {
      this.logger.debug(`No webhook endpoints for event ${event.type}`);
      return;
    }

    await Promise.allSettled(
      matching.map((ep) =>
        this.deliverWebhook.execute(ep, domainEvent).catch((err) =>
          this.logger.error(`Webhook delivery failed: ${err.message}`),
        ),
      ),
    );
  }
}
