export class AdminEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly storeId: string | null,
    public readonly email: string,
    public readonly displayName: string,
    public readonly isSuperAdmin: boolean,
    public readonly isActive: boolean,
    public readonly lastLoginAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
    public readonly roles?: { id: string; name: string }[],
  ) {}

  static fromPrisma(data: Record<string, any>): AdminEntity {
    return new AdminEntity(
      data.id,
      data.tenantId,
      data.storeId,
      data.email,
      data.displayName,
      data.isSuperAdmin,
      data.isActive,
      data.lastLoginAt,
      data.createdAt,
      data.updatedAt,
      data.deletedAt,
      data.roles?.map((r: Record<string, any>) => ({
        id: r.role?.id ?? r.roleId,
        name: r.role?.name,
      })),
    );
  }

  toResponse() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      storeId: this.storeId,
      email: this.email,
      displayName: this.displayName,
      isSuperAdmin: this.isSuperAdmin,
      isActive: this.isActive,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      roles: this.roles,
    };
  }
}
