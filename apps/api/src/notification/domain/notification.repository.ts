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

export interface NotificationRepository {
  findTemplateByType(type: string, storeId: string): Promise<NotificationTemplateData | null>;
  saveLog(log: NotificationLogData): Promise<void>;
}
