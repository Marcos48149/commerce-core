import { Injectable } from '@nestjs/common';
import { AuditLogRepository, AuditLogFilter, PaginatedAuditLogs } from '../domain/audit-log.repository';

export interface QueryAuditLogInput {
  storeId?: string;
  tenantId: string;
  filter?: AuditLogFilter;
}

@Injectable()
export class QueryAuditLogUseCase {
  constructor(
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(input: QueryAuditLogInput): Promise<PaginatedAuditLogs> {
    if (input.storeId) {
      return this.auditLogRepository.findByStore(input.storeId, input.filter);
    }
    return this.auditLogRepository.findByTenant(input.tenantId, input.filter);
  }
}
