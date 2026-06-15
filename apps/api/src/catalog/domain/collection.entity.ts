import { Slug } from './value-objects';

export class Collection {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    public name: string,
    public slug: Slug,
    public description: string | null,
    public imageUrl: string | null,
    public isActive: boolean,
    public sortOrder: number,
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
    imageUrl?: string | null;
    sortOrder?: number;
  }): Collection {
    return new Collection(
      params.id,
      params.tenantId,
      params.storeId,
      params.name,
      params.slug,
      params.description ?? null,
      params.imageUrl ?? null,
      true,
      params.sortOrder ?? 0,
      new Date(),
      new Date(),
      null,
    );
  }

  update(params: {
    name?: string;
    slug?: Slug;
    description?: string | null;
    imageUrl?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  }): void {
    if (params.name !== undefined) this.name = params.name;
    if (params.slug !== undefined) this.slug = params.slug;
    if (params.description !== undefined) this.description = params.description;
    if (params.imageUrl !== undefined) this.imageUrl = params.imageUrl;
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
