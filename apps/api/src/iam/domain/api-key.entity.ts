export class ApiKeyEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly adminId: string,
    public readonly storeId: string | null,
    public readonly name: string,
    public readonly prefix: string,
    public readonly scopes: Record<string, any>[],
    public readonly lastUsedAt: Date | null,
    public readonly expiresAt: Date | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static fromPrisma(data: Record<string, any>): ApiKeyEntity {
    return new ApiKeyEntity(
      data.id,
      data.tenantId,
      data.adminId,
      data.storeId,
      data.name,
      data.prefix,
      data.scopes,
      data.lastUsedAt,
      data.expiresAt,
      data.isActive,
      data.createdAt,
      data.updatedAt,
      data.deletedAt,
    );
  }

  toResponse() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      adminId: this.adminId,
      storeId: this.storeId,
      name: this.name,
      prefix: this.prefix,
      scopes: this.scopes,
      lastUsedAt: this.lastUsedAt,
      expiresAt: this.expiresAt,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
