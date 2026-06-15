import { ValidationError } from '@commerce/shared';

export class Stock {
  private constructor(
    public readonly id: string,
    public readonly variantId: string,
    public readonly productId: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    private _available: number,
    private _reserved: number,
    private _lowStockThreshold: number | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    variantId: string;
    productId: string;
    tenantId: string;
    storeId: string;
    available?: number;
    reserved?: number;
    lowStockThreshold?: number | null;
  }): Stock {
    return new Stock(
      params.id,
      params.variantId,
      params.productId,
      params.tenantId,
      params.storeId,
      params.available ?? 0,
      params.reserved ?? 0,
      params.lowStockThreshold ?? 5,
      new Date(),
      new Date(),
    );
  }

  get available(): number {
    return this._available;
  }

  get reserved(): number {
    return this._reserved;
  }

  get lowStockThreshold(): number | null {
    return this._lowStockThreshold;
  }

  get onHand(): number {
    return this._available + this._reserved;
  }

  get isLowStock(): boolean {
    if (this._lowStockThreshold === null) return false;
    return this._available <= this._lowStockThreshold;
  }

  get isOutOfStock(): boolean {
    return this._available <= 0;
  }

  reserve(quantity: number): void {
    if (quantity <= 0) {
      throw new ValidationError('Reservation quantity must be positive');
    }
    if (quantity > this._available) {
      throw new ValidationError('Insufficient stock available');
    }
    this._available -= quantity;
    this._reserved += quantity;
  }

  confirmReservation(quantity: number): void {
    if (quantity <= 0) {
      throw new ValidationError('Confirmation quantity must be positive');
    }
    if (quantity > this._reserved) {
      throw new ValidationError('Cannot confirm more than reserved quantity');
    }
    this._reserved -= quantity;
  }

  cancelReservation(quantity: number): void {
    if (quantity <= 0) {
      throw new ValidationError('Cancellation quantity must be positive');
    }
    if (quantity > this._reserved) {
      throw new ValidationError('Cannot cancel more than reserved quantity');
    }
    this._reserved -= quantity;
    this._available += quantity;
  }

  adjust(quantity: number): void {
    const newAvailable = this._available + quantity;
    if (newAvailable < 0) {
      throw new ValidationError('Adjustment would result in negative stock');
    }
    this._available = newAvailable;
  }

  setLowStockThreshold(threshold: number | null): void {
    this._lowStockThreshold = threshold;
  }
}
