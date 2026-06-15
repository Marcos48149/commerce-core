import { Module } from '@nestjs/common';
import { NotificationRepository } from './domain/notification.repository';
import { PrismaNotificationRepository } from './infrastructure/prisma-notification.repository';
import { ResendAdapter } from './application/adapters/resend.adapter';
import { SendNotificationUseCase } from './application/send-notification.use-case';

@Module({
  providers: [
    { provide: NotificationRepository, useClass: PrismaNotificationRepository },
    { provide: 'EmailProvider', useClass: ResendAdapter },
    SendNotificationUseCase,
  ],
  exports: [SendNotificationUseCase],
})
export class NotificationModule {}
