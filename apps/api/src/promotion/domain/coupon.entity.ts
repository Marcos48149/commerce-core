export class Coupon {
  private constructor(
    public readonly id: string,
    public readonly promotionId: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    public readonly code: string,
    private _maxUsage: number | null,
    private _currentUsage: number,
    private _maxPerCustomer: number | null,
    private _isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: {
    id: string;
    promotionId: string;
    tenantId: string;
    storeId: string;
    code: string;
    maxUsage?: number | null;
    maxPerCustomer?: number | null;
  }): Coupon {
    return new Coupon(
      params.id,
      params.promotionId,
      params.tenantId,
      params.storeId,
      params.code.toUpperCase(),
      params.maxUsage ?? null,
      0,
      params.maxPerCustomer ?? null,
      true,
      new Date(),
      new Date(),
      null,
    );
  }

  get isActive(): boolean { return this._isActive; }
  get maxUsage(): number | null { return this._maxUsage; }
  get currentUsage(): number { return this._currentUsage; }
  get maxPerCustomer(): number | null { return this._maxPerCustomer; }

  isValid(): boolean {
    if (!this._isActive) return false;
    if (this._maxUsage !== null && this._currentUsage >= this._maxUsage) return false;
    return true;
  }

  incrementUsage(): void {
    if (this._maxUsage !== null && this._currentUsage >= this._maxUsage) {
      throw new Error('Coupon usage limit exceeded');
    }
    this._currentUsage++;
  }

  activate(): void { this._isActive = true; }
  deactivate(): void { this._isActive = false; }

  update(params: {
    maxUsage?: number | null;
    maxPerCustomer?: number | null;
    isActive?: boolean;
  }): void {
    if (params.maxUsage !== undefined) this._maxUsage = params.maxUsage;
    if (params.maxPerCustomer !== undefined) this._maxPerCustomer = params.maxPerCustomer;
    if (params.isActive !== undefined) this._isActive = params.isActive;
  }

  softDelete(): void {
    (this as { deletedAt: Date | null }).deletedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
