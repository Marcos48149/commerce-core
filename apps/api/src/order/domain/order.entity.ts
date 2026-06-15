import { ValidationError } from '@commerce/shared';

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export interface OrderItemData {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  metadata?: Record<string, unknown>;
}

export interface OrderSnapshot {
  customerId: string | null;
  items: Array<{
    variantId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  createdAt: string;
}

export class Order {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    private _customerId: string | null,
    private _orderNumber: number,
    private _status: OrderStatus,
    public readonly currency: string,
    private _subtotal: number,
    private _discount: number,
    private _shipping: number,
    private _tax: number,
    private _total: number,
    private _couponCode: string | null,
    private _notes: string | null,
    private _metadata: Record<string, unknown>,
    private _snapshot: OrderSnapshot,
    private _items: OrderItemData[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    tenantId: string;
    storeId: string;
    customerId: string | null;
    orderNumber: number;
    currency?: string;
    subtotal: number;
    discount: number;
    shipping: number;
    tax?: number;
    total: number;
    couponCode?: string | null;
    notes?: string | null;
    metadata?: Record<string, unknown>;
    items: Array<{
      id: string;
      variantId: string;
      productId: string;
      productName: string;
      variantName: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      metadata?: Record<string, unknown>;
    }>;
  }): Order {
    const now = new Date();

    const snapshot: OrderSnapshot = {
      customerId: params.customerId,
      items: params.items.map((i) => ({
        variantId: i.variantId,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      subtotal: params.subtotal,
      discount: params.discount,
      shipping: params.shipping,
      total: params.total,
      couponCode: params.couponCode ?? null,
      createdAt: now.toISOString(),
    };

    return new Order(
      params.id,
      params.tenantId,
      params.storeId,
      params.customerId,
      params.orderNumber,
      OrderStatus.PENDING_PAYMENT,
      params.currency ?? 'ARS',
      params.subtotal,
      params.discount,
      params.shipping,
      params.tax ?? 0,
      params.total,
      params.couponCode ?? null,
      params.notes ?? null,
      params.metadata ?? {},
      snapshot,
      params.items,
      now,
      now,
    );
  }

  get status(): OrderStatus { return this._status; }
  get orderNumber(): number { return this._orderNumber; }
  get customerId(): string | null { return this._customerId; }
  get subtotal(): number { return this._subtotal; }
  get discount(): number { return this._discount; }
  get shipping(): number { return this._shipping; }
  get tax(): number { return this._tax; }
  get total(): number { return this._total; }
  get couponCode(): string | null { return this._couponCode; }
  get notes(): string | null { return this._notes; }
  get metadata(): Record<string, unknown> { return { ...this._metadata }; }
  get snapshot(): OrderSnapshot { return { ...this._snapshot }; }
  get items(): OrderItemData[] { return [...this._items]; }

  transition(to: OrderStatus): void {
    const allowed = VALID_TRANSITIONS[this._status];
    if (!allowed.includes(to)) {
      throw new ValidationError(
        `Cannot transition from ${this._status} to ${to}`,
      );
    }
    this._status = to;
  }

  canTransitionTo(to: OrderStatus): boolean {
    return VALID_TRANSITIONS[this._status]?.includes(to) ?? false;
  }

  addNote(note: string): void {
    this._notes = this._notes ? `${this._notes}\n${note}` : note;
  }

  setMetadata(metadata: Record<string, unknown>): void {
    this._metadata = { ...this._metadata, ...metadata };
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      storeId: this.storeId,
      customerId: this._customerId,
      orderNumber: this._orderNumber,
      status: this._status,
      currency: this.currency,
      subtotal: this._subtotal,
      discount: this._discount,
      shipping: this._shipping,
      tax: this._tax,
      total: this._total,
      couponCode: this._couponCode,
      notes: this._notes,
      snapshot: this._snapshot,
      items: this._items,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
