export interface EmailProvider {
  send(params: {
    to: string;
    subject: string;
    body: string;
    type: string;
  }): Promise<{ success: boolean; error?: string }>;
}

export interface NotificationTemplate {
  id: string;
  tenantId: string;
  storeId: string;
  type: string;
  subject: string;
  body: string;
  isActive: boolean;
}

export interface NotificationLogData {
  id: string;
  tenantId: string;
  storeId: string;
  templateId: string | null;
  to: string;
  type: string;
  subject: string;
  status: 'sent' | 'failed';
  error: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
