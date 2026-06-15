import { ValidationError } from '@commerce/shared';

export type ShippingType = 'fixed' | 'free_over' | 'local_pickup' | 'zone_based';

export class ShippingZone {
  constructor(
    public readonly id: string,
    public readonly shippingMethodId: string,
    public readonly name: string,
    public readonly countries: string[],
    public readonly provinces: string[],
    public readonly postalCodes: string | null,
    public readonly cost: number | null,
    public readonly freeOver: number | null,
    public readonly estimatedDaysMin: number | null,
    public readonly estimatedDaysMax: number | null,
    public readonly isActive: boolean,
  ) {}

  matches(country: string, province?: string, postalCode?: string): boolean {
    if (!this.countries.includes(country)) return false;
    if (this.provinces.length > 0 && province && !this.provinces.includes(province)) return false;
    return true;
  }
}

export class ShippingMethod {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    public readonly name: string,
    public readonly type: ShippingType,
    private _cost: number | null,
    private _freeOver: number | null,
    private _isActive: boolean,
    public readonly sortOrder: number,
    private _config: Record<string, unknown>,
    public readonly zones: ShippingZone[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    tenantId: string;
    storeId: string;
    name: string;
    type: ShippingType;
    cost?: number | null;
    freeOver?: number | null;
    sortOrder?: number;
    config?: Record<string, unknown>;
  }): ShippingMethod {
    if (params.type === 'fixed' && (params.cost === null || params.cost === undefined)) {
      throw new ValidationError('Fixed shipping must have a cost');
    }

    return new ShippingMethod(
      params.id,
      params.tenantId,
      params.storeId,
      params.name,
      params.type,
      params.cost ?? null,
      params.freeOver ?? null,
      true,
      params.sortOrder ?? 0,
      params.config ?? {},
      [],
      new Date(),
      new Date(),
    );
  }

  get cost(): number | null { return this._cost; }
  get freeOver(): number | null { return this._freeOver; }
  get isActive(): boolean { return this._isActive; }
  get config(): Record<string, unknown> { return { ...this._config }; }

  calculate(subtotal: number, country: string, province?: string): number | null {
    if (!this._isActive) return null;

    switch (this.type) {
      case 'fixed':
        return this._cost!;

      case 'free_over':
        if (this._freeOver && subtotal >= this._freeOver) return 0;
        return this._cost;

      case 'local_pickup':
        return this._cost ?? 0;

      case 'zone_based': {
        const matchingZone = this.zones.find((z) => z.matches(country, province));
        if (!matchingZone) return null;
        if (matchingZone.freeOver && subtotal >= matchingZone.freeOver) return 0;
        return matchingZone.cost ?? this._cost ?? null;
      }

      default:
        return null;
    }
  }

  activate(): void { this._isActive = true; }
  deactivate(): void { this._isActive = false; }

  update(params: { name?: string; cost?: number | null; freeOver?: number | null; isActive?: boolean; sortOrder?: number; config?: Record<string, unknown> }): void {
    if (params.name !== undefined) (this as any).name = params.name;
    if (params.cost !== undefined) this._cost = params.cost;
    if (params.freeOver !== undefined) this._freeOver = params.freeOver;
    if (params.isActive !== undefined) this._isActive = params.isActive;
    if (params.sortOrder !== undefined) (this as any).sortOrder = params.sortOrder;
    if (params.config !== undefined) this._config = { ...this._config, ...params.config };
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      storeId: this.storeId,
      name: this.name,
      type: this.type,
      cost: this._cost,
      freeOver: this._freeOver,
      isActive: this._isActive,
      sortOrder: this.sortOrder,
      config: this._config,
      zones: this.zones,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
