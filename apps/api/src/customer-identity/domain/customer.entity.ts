export class Customer {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    public email: string,
    public displayName: string | null,
    public phone: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: {
    id: string;
    tenantId: string;
    storeId: string;
    email: string;
    displayName?: string | null;
    phone?: string | null;
  }): Customer {
    return new Customer(
      params.id,
      params.tenantId,
      params.storeId,
      params.email,
      params.displayName ?? null,
      params.phone ?? null,
      true,
      new Date(),
      new Date(),
      null,
    );
  }

  update(params: { displayName?: string | null; phone?: string | null; email?: string }): void {
    if (params.displayName !== undefined) this.displayName = params.displayName;
    if (params.phone !== undefined) this.phone = params.phone;
    if (params.email !== undefined) this.email = params.email;
  }

  softDelete(): void {
    (this as { deletedAt: Date | null }).deletedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
