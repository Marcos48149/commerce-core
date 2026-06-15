import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { WebhookRepository } from '../domain/webhook.repository';
import { WebhookEndpoint } from '../domain/webhook.entity';
import { WebhookEventType } from '../domain/domain-event';

@Injectable()
export class PrismaWebhookRepository implements WebhookRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(row: any): WebhookEndpoint {
    return WebhookEndpoint.create({
      id: row.id,
      tenantId: row.tenantId,
      storeId: row.storeId,
      url: row.url,
      secret: row.secret,
      events: row.events as WebhookEventType[],
      retryCount: row.retryCount,
      timeoutMs: row.timeoutMs,
    });
  }

  async findById(id: string, storeId: string): Promise<WebhookEndpoint | null> {
    const row = await this.prisma.webhookEndpoint.findFirst({
      where: { id, storeId, deletedAt: null },
    });
    return row ? this.toEntity(row) : null;
  }

  async findByStore(storeId: string): Promise<WebhookEndpoint[]> {
    const rows = await this.prisma.webhookEndpoint.findMany({
      where: { storeId, deletedAt: null },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findByEvent(eventType: WebhookEventType, storeId: string): Promise<WebhookEndpoint[]> {
    const rows = await this.prisma.webhookEndpoint.findMany({
      where: {
        storeId,
        isActive: true,
        deletedAt: null,
        events: { has: eventType },
      },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findByEventAcrossStores(eventType: WebhookEventType, tenantId: string): Promise<WebhookEndpoint[]> {
    const rows = await this.prisma.webhookEndpoint.findMany({
      where: {
        tenantId,
        isActive: true,
        deletedAt: null,
        events: { has: eventType },
      },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async save(webhook: WebhookEndpoint): Promise<void> {
    await this.prisma.webhookEndpoint.create({
      data: {
        id: webhook.id,
        tenantId: webhook.tenantId,
        storeId: webhook.storeId,
        url: webhook.url,
        secret: webhook.secret,
        events: webhook.events,
        isActive: webhook.isActive,
        retryCount: webhook.retryCount,
        timeoutMs: webhook.timeoutMs,
      },
    });
  }

  async update(webhook: WebhookEndpoint): Promise<void> {
    await this.prisma.webhookEndpoint.update({
      where: { id: webhook.id },
      data: {
        url: webhook.url,
        secret: webhook.secret,
        events: webhook.events,
        isActive: webhook.isActive,
        retryCount: webhook.retryCount,
        timeoutMs: webhook.timeoutMs,
      },
    });
  }

  async delete(id: string, storeId: string): Promise<void> {
    await this.prisma.webhookEndpoint.updateMany({
      where: { id, storeId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
