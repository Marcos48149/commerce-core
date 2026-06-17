export class Store {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public planId: string | null,
    public name: string,
    public slug: string,
    public currency: string,
    public displayName: string | null,
    public email: string | null,
    public phone: string | null,
    public address: string | null,
    public logoUrl: string | null,
    public isActive: boolean,
    public settings: Record<string, unknown>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: {
    id: string;
    tenantId: string;
    planId?: string | null;
    name: string;
    slug: string;
    currency?: string;
    displayName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    logoUrl?: string | null;
    settings?: Record<string, unknown>;
  }): Store {
    return new Store(
      params.id,
      params.tenantId,
      params.planId ?? null,
      params.name,
      params.slug,
      params.currency ?? 'ARS',
      params.displayName ?? null,
      params.email ?? null,
      params.phone ?? null,
      params.address ?? null,
      params.logoUrl ?? null,
      true,
      params.settings ?? {},
      new Date(),
      new Date(),
      null,
    );
  }

  update(params: {
    planId?: string | null;
    name?: string;
    slug?: string;
    currency?: string;
    displayName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    logoUrl?: string | null;
    isActive?: boolean;
    settings?: Record<string, unknown>;
  }): void {
    if (params.planId !== undefined) this.planId = params.planId;
    if (params.name !== undefined) this.name = params.name;
    if (params.slug !== undefined) this.slug = params.slug;
    if (params.currency !== undefined) this.currency = params.currency;
    if (params.displayName !== undefined) this.displayName = params.displayName;
    if (params.email !== undefined) this.email = params.email;
    if (params.phone !== undefined) this.phone = params.phone;
    if (params.address !== undefined) this.address = params.address;
    if (params.logoUrl !== undefined) this.logoUrl = params.logoUrl;
    if (params.isActive !== undefined) this.isActive = params.isActive;
    if (params.settings !== undefined) this.settings = params.settings;
  }

  softDelete(): void {
    (this as { deletedAt: Date | null }).deletedAt = new Date();
  }
}
