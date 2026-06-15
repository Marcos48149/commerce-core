import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { WebhookRepository } from './domain/webhook.repository';
import { PrismaWebhookRepository } from './infrastructure/prisma-webhook.repository';
import { EventBusService } from './application/event-bus.service';
import { DeliverWebhookUseCase } from './application/deliver-webhook.use-case';
import { WebhookController } from './interface/webhook.controller';

@Module({
  imports: [IamModule],
  controllers: [WebhookController],
  providers: [
    { provide: WebhookRepository, useClass: PrismaWebhookRepository },
    EventBusService,
    DeliverWebhookUseCase,
  ],
  exports: [EventBusService, WebhookRepository],
})
export class WebhookModule {}
