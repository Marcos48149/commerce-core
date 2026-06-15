import { Injectable, Logger } from '@nestjs/common';
import { ulid } from 'ulidx';
import { NotificationRepository } from '../domain/notification.repository';
import { EmailProvider } from '../domain/notification.entity';

export interface SendNotificationInput {
  tenantId: string;
  storeId: string;
  to: string;
  type: string;
  metadata?: Record<string, unknown>;
  templateOverrides?: { subject?: string; body?: string };
}

@Injectable()
export class SendNotificationUseCase {
  private readonly logger = new Logger(SendNotificationUseCase.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly emailProvider: EmailProvider,
  ) {}

  async execute(input: SendNotificationInput): Promise<void> {
    try {
      const template = await this.notificationRepository.findTemplateByType(input.type, input.storeId);
      if (!template && !input.templateOverrides) {
        this.logger.warn(`No template found for type ${input.type} in store ${input.storeId}`);
        return;
      }

      let subject = input.templateOverrides?.subject ?? template?.subject ?? 'Notification';
      let body = input.templateOverrides?.body ?? template?.body ?? '';

      if (input.metadata) {
        subject = this.interpolate(subject, input.metadata);
        body = this.interpolate(body, input.metadata);
      }

      const result = await this.emailProvider.send({
        to: input.to,
        subject,
        body,
        type: input.type,
      });

      await this.notificationRepository.saveLog({
        id: ulid(),
        tenantId: input.tenantId,
        storeId: input.storeId,
        templateId: template?.id ?? null,
        to: input.to,
        type: input.type,
        subject,
        status: result.success ? 'sent' : 'failed',
        error: result.error ?? null,
        metadata: input.metadata ?? {},
        createdAt: new Date(),
      });
    } catch (err: any) {
      this.logger.error(`Notification failed for ${input.type} to ${input.to}: ${err.message}`);
    }
  }

  private interpolate(text: string, data: Record<string, unknown>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const val = data[key];
      return val !== undefined ? String(val) : `{{${key}}}`;
    });
  }
}
