import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NotificationRepository, NotificationTemplateData } from '../domain/notification.repository';
import { NotificationLogData } from '../domain/notification.entity';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findTemplateByType(type: string, storeId: string): Promise<NotificationTemplateData | null> {
    const row = await this.prisma.notificationTemplate.findFirst({
      where: { type, storeId, isActive: true, deletedAt: null },
    });
    if (!row) return null;

    return {
      id: row.id,
      tenantId: row.tenantId,
      storeId: row.storeId,
      type: row.type,
      subject: row.subject,
      body: row.body,
      isActive: row.isActive,
      deletedAt: row.deletedAt,
    };
  }

  async saveLog(log: NotificationLogData): Promise<void> {
    await this.prisma.notificationLog.create({
      data: {
        id: log.id,
        tenantId: log.tenantId,
        storeId: log.storeId,
        templateId: log.templateId,
        to: log.to,
        type: log.type,
        subject: log.subject,
        status: log.status,
        error: log.error,
        metadata: log.metadata as any,
      },
    });
  }
}
