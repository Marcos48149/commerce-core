import { NotificationLogData } from './notification.entity';

export interface NotificationTemplateData {
  id: string;
  tenantId: string;
  storeId: string;
  type: string;
  subject: string;
  body: string;
  isActive: boolean;
  deletedAt: Date | null;
}

import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class NotificationRepository {
  abstract findTemplateByType(type: string, storeId: string): Promise<NotificationTemplateData | null>;
  abstract saveLog(log: NotificationLogData): Promise<void>;
}
