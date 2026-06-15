export class AuditLog {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly storeId: string | null,
    public readonly adminId: string | null,
    public readonly customerId: string | null,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly action: string,
    public readonly oldValue: Record<string, unknown> | null,
    public readonly newValue: Record<string, unknown> | null,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly metadata: Record<string, unknown>,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
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
  }): AuditLog {
    return new AuditLog(
      params.id,
      params.tenantId,
      params.storeId ?? null,
      params.adminId ?? null,
      params.customerId ?? null,
      params.entityType,
      params.entityId,
      params.action,
      params.oldValue ?? null,
      params.newValue ?? null,
      params.ipAddress ?? null,
      params.userAgent ?? null,
      params.metadata ?? {},
      new Date(),
    );
  }
}
