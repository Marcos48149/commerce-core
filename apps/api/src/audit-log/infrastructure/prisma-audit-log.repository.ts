import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuditLogRepository, AuditLogFilter, PaginatedAuditLogs } from '../domain/audit-log.repository';
import { AuditLog } from '../domain/audit-log.entity';

@Injectable()
export class PrismaAuditLogRepository implements AuditLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(row: any): AuditLog {
    return AuditLog.create({
      id: row.id,
      tenantId: row.tenantId,
      storeId: row.storeId,
      adminId: row.adminId,
      customerId: row.customerId,
      entityType: row.entityType,
      entityId: row.entityId,
      action: row.action,
      oldValue: row.oldValue as Record<string, unknown> | null,
      newValue: row.newValue as Record<string, unknown> | null,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      metadata: row.metadata as Record<string, unknown>,
    });
  }

  async findById(id: string): Promise<AuditLog | null> {
    const row = await this.prisma.auditLog.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByStore(storeId: string, filter?: AuditLogFilter): Promise<PaginatedAuditLogs> {
    return this.query({ storeId, ...filter });
  }

  async findByTenant(tenantId: string, filter?: AuditLogFilter): Promise<PaginatedAuditLogs> {
    return this.query({ tenantId, ...filter });
  }

  private async query(params: {
    tenantId?: string;
    storeId?: string;
    entityType?: string;
    entityId?: string;
    action?: string;
    adminId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<PaginatedAuditLogs> {
    const where: any = {};
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.storeId) where.storeId = params.storeId;
    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = params.entityId;
    if (params.action) where.action = params.action;
    if (params.adminId) where.adminId = params.adminId;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: data.map((r) => this.toEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async save(log: AuditLog): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        id: log.id,
        tenantId: log.tenantId,
        storeId: log.storeId,
        adminId: log.adminId,
        customerId: log.customerId,
        entityType: log.entityType,
        entityId: log.entityId,
        action: log.action,
        oldValue: log.oldValue as any,
        newValue: log.newValue as any,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        metadata: log.metadata as any,
      },
    });
  }
}
