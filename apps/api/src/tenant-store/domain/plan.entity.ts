export class Plan {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public name: string,
    public maxStores: number,
    public maxAdmins: number,
    public maxProducts: number,
    public maxWebhooks: number,
    public features: Record<string, unknown>,
    public monthlyPrice: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: {
    id: string;
    tenantId: string;
    name: string;
    maxStores?: number;
    maxAdmins?: number;
    maxProducts?: number;
    maxWebhooks?: number;
    features?: Record<string, unknown>;
    monthlyPrice: number;
  }): Plan {
    return new Plan(
      params.id,
      params.tenantId,
      params.name,
      params.maxStores ?? 1,
      params.maxAdmins ?? 10,
      params.maxProducts ?? 1000,
      params.maxWebhooks ?? 10,
      params.features ?? {},
      params.monthlyPrice,
      new Date(),
      new Date(),
      null,
    );
  }

  update(params: {
    name?: string;
    maxStores?: number;
    maxAdmins?: number;
    maxProducts?: number;
    maxWebhooks?: number;
    features?: Record<string, unknown>;
    monthlyPrice?: number;
  }): void {
    if (params.name !== undefined) this.name = params.name;
    if (params.maxStores !== undefined) this.maxStores = params.maxStores;
    if (params.maxAdmins !== undefined) this.maxAdmins = params.maxAdmins;
    if (params.maxProducts !== undefined) this.maxProducts = params.maxProducts;
    if (params.maxWebhooks !== undefined) this.maxWebhooks = params.maxWebhooks;
    if (params.features !== undefined) this.features = params.features;
    if (params.monthlyPrice !== undefined) this.monthlyPrice = params.monthlyPrice;
  }

  softDelete(): void {
    (this as { deletedAt: Date | null }).deletedAt = new Date();
  }
}
