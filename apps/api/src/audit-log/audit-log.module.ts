import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { AuditLogRepository } from './domain/audit-log.repository';
import { PrismaAuditLogRepository } from './infrastructure/prisma-audit-log.repository';
import { LogActionUseCase } from './application/log-action.use-case';
import { QueryAuditLogUseCase } from './application/query-audit-log.use-case';
import { AuditLogController } from './interface/audit-log.controller';

@Module({
  imports: [IamModule],
  controllers: [AuditLogController],
  providers: [
    { provide: AuditLogRepository, useClass: PrismaAuditLogRepository },
    LogActionUseCase,
    QueryAuditLogUseCase,
  ],
  exports: [LogActionUseCase, AuditLogRepository],
})
export class AuditLogModule {}
