export class Tenant {
  private constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: { id: string; name: string; slug: string }): Tenant {
    return new Tenant(
      params.id,
      params.name,
      params.slug,
      new Date(),
      new Date(),
      null,
    );
  }

  update(params: { name?: string; slug?: string }): void {
    if (params.name !== undefined) this.name = params.name;
    if (params.slug !== undefined) this.slug = params.slug;
  }

  softDelete(): void {
    (this as { deletedAt: Date | null }).deletedAt = new Date();
  }
}
