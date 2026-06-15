export enum PromotionType {
  PRODUCT_FIXED = 'PRODUCT_FIXED',
  PRODUCT_PERCENTAGE = 'PRODUCT_PERCENTAGE',
  CATEGORY_DISCOUNT = 'CATEGORY_DISCOUNT',
  CART_PERCENTAGE = 'CART_PERCENTAGE',
  PAYMENT_METHOD_DISCOUNT = 'PAYMENT_METHOD_DISCOUNT',
  COUPON = 'COUPON',
  BXGY = 'BXGY',
  AUTOMATIC_GIFT = 'AUTOMATIC_GIFT',
}

export interface PromotionConfig {
  discountValue?: number;
  discountPercent?: number;
  maxDiscount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  giftVariantId?: string;
  giftProductId?: string;
  minQuantity?: number;
}

export class Promotion {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    public readonly name: string,
    public readonly type: PromotionType,
    public readonly config: PromotionConfig,
    public readonly startsAt: Date,
    public readonly endsAt: Date | null,
    public readonly minQuantity: number | null,
    public readonly minCartAmount: number | null,
    public readonly targetProductId: string | null,
    public readonly targetCategoryId: string | null,
    public readonly targetPaymentMethod: string | null,
    private _isActive: boolean,
    private _maxUsage: number | null,
    private _currentUsage: number,
    public readonly priority: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: {
    id: string;
    tenantId: string;
    storeId: string;
    name: string;
    type: PromotionType;
    config: PromotionConfig;
    startsAt: Date;
    endsAt?: Date | null;
    minQuantity?: number | null;
    minCartAmount?: number | null;
    targetProductId?: string | null;
    targetCategoryId?: string | null;
    targetPaymentMethod?: string | null;
    maxUsage?: number | null;
    priority?: number;
  }): Promotion {
    return new Promotion(
      params.id,
      params.tenantId,
      params.storeId,
      params.name,
      params.type,
      params.config,
      params.startsAt,
      params.endsAt ?? null,
      params.minQuantity ?? null,
      params.minCartAmount ?? null,
      params.targetProductId ?? null,
      params.targetCategoryId ?? null,
      params.targetPaymentMethod ?? null,
      true,
      params.maxUsage ?? null,
      0,
      params.priority ?? 0,
      new Date(),
      new Date(),
      null,
    );
  }

  get isActive(): boolean { return this._isActive; }
  get maxUsage(): number | null { return this._maxUsage; }
  get currentUsage(): number { return this._currentUsage; }

  isCurrentlyActive(): boolean {
    const now = new Date();
    if (now < this.startsAt) return false;
    if (this.endsAt && now > this.endsAt) return false;
    if (!this._isActive) return false;
    if (this._maxUsage !== null && this._currentUsage >= this._maxUsage) return false;
    return true;
  }

  incrementUsage(): void {
    if (this._maxUsage !== null && this._currentUsage >= this._maxUsage) {
      throw new Error('Promotion usage limit exceeded');
    }
    this._currentUsage++;
  }

  activate(): void { this._isActive = true; }
  deactivate(): void { this._isActive = false; }

  update(params: {
    name?: string;
    config?: PromotionConfig;
    startsAt?: Date;
    endsAt?: Date | null;
    minQuantity?: number | null;
    minCartAmount?: number | null;
    targetProductId?: string | null;
    targetCategoryId?: string | null;
    targetPaymentMethod?: string | null;
    maxUsage?: number | null;
    priority?: number;
    isActive?: boolean;
  }): void {
    if (params.name !== undefined) (this as { name: string }).name = params.name;
    if (params.config !== undefined) (this as { config: PromotionConfig }).config = params.config;
    if (params.startsAt !== undefined) (this as { startsAt: Date }).startsAt = params.startsAt;
    if (params.endsAt !== undefined) (this as { endsAt: Date | null }).endsAt = params.endsAt;
    if (params.minQuantity !== undefined) (this as { minQuantity: number | null }).minQuantity = params.minQuantity;
    if (params.minCartAmount !== undefined) (this as { minCartAmount: number | null }).minCartAmount = params.minCartAmount;
    if (params.targetProductId !== undefined) (this as { targetProductId: string | null }).targetProductId = params.targetProductId;
    if (params.targetCategoryId !== undefined) (this as { targetCategoryId: string | null }).targetCategoryId = params.targetCategoryId;
    if (params.targetPaymentMethod !== undefined) (this as { targetPaymentMethod: string | null }).targetPaymentMethod = params.targetPaymentMethod;
    if (params.maxUsage !== undefined) this._maxUsage = params.maxUsage;
    if (params.priority !== undefined) (this as { priority: number }).priority = params.priority;
    if (params.isActive !== undefined) this._isActive = params.isActive;
  }

  softDelete(): void {
    (this as { deletedAt: Date | null }).deletedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
