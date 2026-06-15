import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider } from '../../domain/notification.entity';

@Injectable()
export class ResendAdapter implements EmailProvider {
  private readonly logger = new Logger(ResendAdapter.name);
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    if (!this.apiKey) {
      this.logger.warn('RESEND_API_KEY not set — emails will be logged only');
    }
  }

  async send(params: {
    to: string;
    subject: string;
    body: string;
    type: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.apiKey) {
      this.logger.log(`[EMAIL LOG] To: ${params.to}, Subject: ${params.subject}, Type: ${params.type}`);
      return { success: true };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? 'noreply@commercecore.app',
          to: params.to,
          subject: params.subject,
          html: params.body,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        this.logger.error(`Resend API error: ${response.status} ${errBody}`);
        return { success: false, error: `Resend API returned ${response.status}` };
      }

      return { success: true };
    } catch (err: any) {
      this.logger.error(`Resend request failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}
