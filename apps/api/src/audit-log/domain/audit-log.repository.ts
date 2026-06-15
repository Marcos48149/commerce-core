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

export interface AuditLogRepository {
  findById(id: string): Promise<AuditLog | null>;
  findByStore(storeId: string, filter?: AuditLogFilter): Promise<PaginatedAuditLogs>;
  findByTenant(tenantId: string, filter?: AuditLogFilter): Promise<PaginatedAuditLogs>;
  save(log: AuditLog): Promise<void>;
}
