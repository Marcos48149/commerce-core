import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ulid } from 'ulidx';
import { WebhookEndpoint } from '../domain/webhook.entity';
import { DomainEvent } from '../domain/domain-event';

@Injectable()
export class DeliverWebhookUseCase {
  private readonly logger = new Logger(DeliverWebhookUseCase.name);

  constructor(private readonly prisma: PrismaClient) {}

  async execute(endpoint: WebhookEndpoint, event: DomainEvent): Promise<void> {
    const deliveryId = ulid();
    const payload = JSON.stringify({
      id: event.id,
      type: event.type,
      source: event.source,
      timestamp: event.timestamp.toISOString(),
      data: event.data,
      storeId: event.storeId,
      tenantId: event.tenantId,
    });

    const signature = endpoint.signPayload(payload);

    const existing = await this.prisma.webhookDelivery.findFirst({
      where: { eventId: event.id, endpointId: endpoint.id },
    });

    if (existing && existing.status === 'delivered') {
      this.logger.debug(`Event ${event.id} already delivered to ${endpoint.id}, skipping`);
      return;
    }

    let lastError: string | null = null;
    let lastStatusCode: number | null = null;
    let lastResponse: any = null;
    let lastDuration: number | null = null;

    for (let attempt = 1; attempt <= endpoint.retryCount; attempt++) {
      const start = Date.now();

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), endpoint.timeoutMs);

        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event.type,
            'X-Webhook-Delivery-Id': deliveryId,
          },
          body: payload,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        lastDuration = Date.now() - start;
        lastStatusCode = response.status;
        lastResponse = { status: response.status, statusText: response.statusText };

        const responseBody = await response.text();

        if (response.ok) {
          await this.recordDelivery(deliveryId, endpoint.id, event, payload, attempt, lastStatusCode, lastResponse, lastDuration, null, 'delivered');
          return;
        }

        lastError = `HTTP ${response.status}: ${responseBody.substring(0, 500)}`;
      } catch (err: any) {
        lastDuration = Date.now() - start;
        lastError = err.message ?? 'Unknown error';
      }

      this.logger.warn(
        `Webhook delivery ${deliveryId} to ${endpoint.url} attempt ${attempt}/${endpoint.retryCount} failed: ${lastError}`,
      );

      if (attempt < endpoint.retryCount) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    await this.recordDelivery(deliveryId, endpoint.id, event, payload, endpoint.retryCount, lastStatusCode, lastResponse, lastDuration, lastError, 'failed');
  }

  private async recordDelivery(
    id: string,
    endpointId: string,
    event: DomainEvent,
    payload: string,
    attempt: number,
    statusCode: number | null,
    response: any,
    durationMs: number | null,
    error: string | null,
    status: string,
  ): Promise<void> {
    const existing = await this.prisma.webhookDelivery.findUnique({ where: { id } }).catch(() => null);
    if (existing) return;

    await this.prisma.webhookDelivery.create({
      data: {
        id,
        endpointId,
        eventId: event.id,
        eventType: event.type,
        payload: JSON.parse(payload) as any,
        response: response ?? undefined,
        statusCode,
        status,
        attempt,
        durationMs,
        error,
      },
    }).catch((err) => {
      this.logger.error(`Failed to record webhook delivery: ${err.message}`);
    });
  }
}
