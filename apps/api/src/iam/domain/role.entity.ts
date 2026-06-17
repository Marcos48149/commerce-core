export class RoleEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly scope: string,
    public readonly isSystem: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
    public readonly permissions?: { id: string; name: string }[],
    public readonly permissionCount?: number,
  ) {}

  static fromPrisma(data: Record<string, any>): RoleEntity {
    let permissions: { id: string; name: string }[] | undefined;
    let permissionCount: number | undefined;

    if (data.permissions) {
      const perms = data.permissions.map((rp: Record<string, any>) => ({
        id: rp.permission?.id ?? rp.permissionId,
        name: rp.permission?.name,
      }));
      permissions = perms;
      permissionCount = perms.length;
    }

    return new RoleEntity(
      data.id,
      data.tenantId,
      data.name,
      data.scope,
      data.isSystem,
      data.createdAt,
      data.updatedAt,
      data.deletedAt,
      permissions,
      permissionCount,
    );
  }

  toResponse() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      scope: this.scope,
      isSystem: this.isSystem,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      permissions: this.permissions,
      permissionCount: this.permissionCount,
    };
  }
}
