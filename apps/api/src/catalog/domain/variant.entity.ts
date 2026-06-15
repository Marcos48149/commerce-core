import { Money, Sku, Weight, Dimensions } from './value-objects';

export class Variant {
  private constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    public sku: Sku,
    public name: string,
    public price: Money,
    public compareAtPrice: Money | null,
    public costPrice: Money | null,
    public weight: Weight | null,
    public dimensions: Dimensions | null,
    public barcode: string | null,
    public isActive: boolean,
    public sortOrder: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: {
    id: string;
    productId: string;
    tenantId: string;
    storeId: string;
    sku: Sku;
    name: string;
    price: Money;
    compareAtPrice?: Money | null;
    costPrice?: Money | null;
    weight?: Weight | null;
    dimensions?: Dimensions | null;
    barcode?: string | null;
    sortOrder?: number;
  }): Variant {
    return new Variant(
      params.id,
      params.productId,
      params.tenantId,
      params.storeId,
      params.sku,
      params.name,
      params.price,
      params.compareAtPrice ?? null,
      params.costPrice ?? null,
      params.weight ?? null,
      params.dimensions ?? null,
      params.barcode ?? null,
      true,
      params.sortOrder ?? 0,
      new Date(),
      new Date(),
      null,
    );
  }

  update(params: {
    sku?: Sku;
    name?: string;
    price?: Money;
    compareAtPrice?: Money | null;
    costPrice?: Money | null;
    weight?: Weight | null;
    dimensions?: Dimensions | null;
    barcode?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  }): void {
    if (params.sku !== undefined) this.sku = params.sku;
    if (params.name !== undefined) this.name = params.name;
    if (params.price !== undefined) this.price = params.price;
    if (params.compareAtPrice !== undefined) this.compareAtPrice = params.compareAtPrice;
    if (params.costPrice !== undefined) this.costPrice = params.costPrice;
    if (params.weight !== undefined) this.weight = params.weight;
    if (params.dimensions !== undefined) this.dimensions = params.dimensions;
    if (params.barcode !== undefined) this.barcode = params.barcode;
    if (params.isActive !== undefined) this.isActive = params.isActive;
    if (params.sortOrder !== undefined) this.sortOrder = params.sortOrder;
  }

  softDelete(): void {
    (this as { deletedAt: Date | null }).deletedAt = new Date();
  }

  restore(): void {
    (this as { deletedAt: Date | null }).deletedAt = null;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
