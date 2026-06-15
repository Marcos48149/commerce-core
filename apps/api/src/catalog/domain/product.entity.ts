import { Slug } from './value-objects';

export class Product {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    public name: string,
    public slug: Slug,
    public description: string | null,
    public isActive: boolean,
    public readonly metadata: Record<string, unknown>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: {
    id: string;
    tenantId: string;
    storeId: string;
    name: string;
    slug: Slug;
    description?: string | null;
    metadata?: Record<string, unknown>;
  }): Product {
    return new Product(
      params.id,
      params.tenantId,
      params.storeId,
      params.name,
      params.slug,
      params.description ?? null,
      true,
      params.metadata ?? {},
      new Date(),
      new Date(),
      null,
    );
  }

  update(params: { name?: string; slug?: Slug; description?: string | null; isActive?: boolean; metadata?: Record<string, unknown> }): void {
    if (params.name !== undefined) this.name = params.name;
    if (params.slug !== undefined) this.slug = params.slug;
    if (params.description !== undefined) this.description = params.description;
    if (params.isActive !== undefined) this.isActive = params.isActive;
    if (params.metadata !== undefined) Object.assign(this.metadata, params.metadata);
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
