import { Slug } from './value-objects';

export class Category {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    public parentId: string | null,
    public name: string,
    public slug: Slug,
    public description: string | null,
    public imageUrl: string | null,
    public sortOrder: number,
    public isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: {
    id: string;
    tenantId: string;
    storeId: string;
    parentId?: string | null;
    name: string;
    slug: Slug;
    description?: string | null;
    imageUrl?: string | null;
    sortOrder?: number;
  }): Category {
    return new Category(
      params.id,
      params.tenantId,
      params.storeId,
      params.parentId ?? null,
      params.name,
      params.slug,
      params.description ?? null,
      params.imageUrl ?? null,
      params.sortOrder ?? 0,
      true,
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
    sortOrder?: number;
    isActive?: boolean;
    parentId?: string | null;
  }): void {
    if (params.name !== undefined) this.name = params.name;
    if (params.slug !== undefined) this.slug = params.slug;
    if (params.description !== undefined) this.description = params.description;
    if (params.imageUrl !== undefined) this.imageUrl = params.imageUrl;
    if (params.sortOrder !== undefined) this.sortOrder = params.sortOrder;
    if (params.isActive !== undefined) this.isActive = params.isActive;
    if (params.parentId !== undefined) this.parentId = params.parentId;
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
