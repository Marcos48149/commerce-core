export class Address {
  private constructor(
    public readonly id: string,
    public readonly customerId: string,
    public type: string,
    public line1: string,
    public line2: string | null,
    public city: string,
    public province: string,
    public postalCode: string,
    public country: string,
    public isDefault: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: {
    id: string;
    customerId: string;
    type: string;
    line1: string;
    line2?: string | null;
    city: string;
    province: string;
    postalCode: string;
    country?: string;
    isDefault?: boolean;
  }): Address {
    return new Address(
      params.id,
      params.customerId,
      params.type,
      params.line1,
      params.line2 ?? null,
      params.city,
      params.province,
      params.postalCode,
      params.country ?? 'AR',
      params.isDefault ?? false,
      new Date(),
      new Date(),
      null,
    );
  }

  update(params: {
    type?: string;
    line1?: string;
    line2?: string | null;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
  }): void {
    if (params.type !== undefined) this.type = params.type;
    if (params.line1 !== undefined) this.line1 = params.line1;
    if (params.line2 !== undefined) this.line2 = params.line2;
    if (params.city !== undefined) this.city = params.city;
    if (params.province !== undefined) this.province = params.province;
    if (params.postalCode !== undefined) this.postalCode = params.postalCode;
    if (params.country !== undefined) this.country = params.country;
    if (params.isDefault !== undefined) this.isDefault = params.isDefault;
  }

  softDelete(): void {
    (this as { deletedAt: Date | null }).deletedAt = new Date();
  }
}
