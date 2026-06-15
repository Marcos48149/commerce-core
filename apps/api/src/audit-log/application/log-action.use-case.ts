import { Injectable } from '@nestjs/common';
import { UlidService } from '../../common/ulid.service';
import { AuditLogRepository } from '../domain/audit-log.repository';
import { AuditLog } from '../domain/audit-log.entity';

export interface LogActionInput {
  tenantId: string;
  storeId?: string | null;
  adminId?: string | null;
  customerId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class LogActionUseCase {
  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    private readonly ulidService: UlidService,
  ) {}

  async execute(input: LogActionInput): Promise<void> {
    const log = AuditLog.create({
      id: this.ulidService.generate(),
      ...input,
    });
    await this.auditLogRepository.save(log);
  }
}
