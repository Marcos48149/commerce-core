import { AuditLog } from './audit-log.entity';

export interface AuditLogFilter {
  entityType?: string;
  entityId?: string;
  action?: string;
  adminId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class AuditLogRepository {
  abstract findById(id: string): Promise<AuditLog | null>;
  abstract findByStore(storeId: string, filter?: AuditLogFilter): Promise<PaginatedAuditLogs>;
  abstract findByTenant(tenantId: string, filter?: AuditLogFilter): Promise<PaginatedAuditLogs>;
  abstract save(log: AuditLog): Promise<void>;
}
