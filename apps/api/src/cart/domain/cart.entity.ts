import { ValidationError } from '@commerce/shared';

export class CartItem {
  private constructor(
    public readonly id: string,
    public readonly cartId: string,
    public readonly variantId: string,
    public readonly productId: string,
    public readonly storeId: string,
    private _quantity: number,
    public readonly unitPrice: number,
    private _totalPrice: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    cartId: string;
    variantId: string;
    productId: string;
    storeId: string;
    quantity: number;
    unitPrice: number;
  }): CartItem {
    if (params.quantity < 1) throw new ValidationError('Quantity must be at least 1');
    if (params.unitPrice < 0) throw new ValidationError('Unit price must be non-negative');

    return new CartItem(
      params.id,
      params.cartId,
      params.variantId,
      params.productId,
      params.storeId,
      params.quantity,
      params.unitPrice,
      params.quantity * params.unitPrice,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    cartId: string;
    variantId: string;
    productId: string;
    storeId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
  }): CartItem {
    const item = new CartItem(
      params.id,
      params.cartId,
      params.variantId,
      params.productId,
      params.storeId,
      params.quantity,
      params.unitPrice,
      params.totalPrice,
      params.createdAt,
      params.updatedAt,
    );
    return item;
  }

  get quantity(): number { return this._quantity; }
  get totalPrice(): number { return this._totalPrice; }

  updateQuantity(quantity: number): void {
    if (quantity < 1) throw new ValidationError('Quantity must be at least 1');
    this._quantity = quantity;
    this._totalPrice = quantity * this.unitPrice;
  }

  recalcTotal(): void {
    this._totalPrice = this._quantity * this.unitPrice;
  }

  toJSON() {
    return {
      id: this.id,
      cartId: this.cartId,
      variantId: this.variantId,
      productId: this.productId,
      storeId: this.storeId,
      quantity: this._quantity,
      unitPrice: this.unitPrice,
      totalPrice: this._totalPrice,
    };
  }
}

export class Cart {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    private _customerId: string | null,
    private _guestToken: string | null,
    private _couponCode: string | null,
    public readonly currency: string,
    private _subtotal: number,
    private _discount: number,
    private _shipping: number,
    private _total: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    private _items: CartItem[],
  ) {}

  static reconstitute(params: {
    id: string;
    tenantId: string;
    storeId: string;
    customerId: string | null;
    guestToken: string | null;
    couponCode: string | null;
    currency: string;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    createdAt: Date;
    updatedAt: Date;
    items: CartItem[];
  }): Cart {
    const cart = new Cart(
      params.id,
      params.tenantId,
      params.storeId,
      params.customerId,
      params.guestToken,
      params.couponCode,
      params.currency,
      params.subtotal,
      params.discount,
      params.shipping,
      params.total,
      params.createdAt,
      params.updatedAt,
      params.items,
    );
    return cart;
  }

  static createGuest(params: {
    id: string;
    tenantId: string;
    storeId: string;
    guestToken: string;
    currency?: string;
  }): Cart {
    return new Cart(
      params.id,
      params.tenantId,
      params.storeId,
      null,
      params.guestToken,
      null,
      params.currency ?? 'ARS',
      0, 0, 0, 0,
      new Date(),
      new Date(),
      [],
    );
  }

  static createCustomer(params: {
    id: string;
    tenantId: string;
    storeId: string;
    customerId: string;
    currency?: string;
  }): Cart {
    return new Cart(
      params.id,
      params.tenantId,
      params.storeId,
      params.customerId,
      null,
      null,
      params.currency ?? 'ARS',
      0, 0, 0, 0,
      new Date(),
      new Date(),
      [],
    );
  }

  get customerId(): string | null { return this._customerId; }
  get guestToken(): string | null { return this._guestToken; }
  get couponCode(): string | null { return this._couponCode; }
  get subtotal(): number { return this._subtotal; }
  get discount(): number { return this._discount; }
  get shipping(): number { return this._shipping; }
  get total(): number { return this._total; }
  get items(): CartItem[] { return [...this._items]; }

  addItem(item: CartItem): void {
    const existing = this._items.find((i) => i.variantId === item.variantId);
    if (existing) {
      existing.updateQuantity(existing.quantity + item.quantity);
    } else {
      this._items.push(item);
    }
    this.recalcTotals();
  }

  updateItemQuantity(variantId: string, quantity: number): void {
    const item = this._items.find((i) => i.variantId === variantId);
    if (!item) throw new ValidationError('Item not found in cart');
    item.updateQuantity(quantity);
    this.recalcTotals();
  }

  removeItem(variantId: string): void {
    const idx = this._items.findIndex((i) => i.variantId === variantId);
    if (idx === -1) throw new ValidationError('Item not found in cart');
    this._items.splice(idx, 1);
    this.recalcTotals();
  }

  applyCoupon(code: string | null): void {
    this._couponCode = code;
  }

  setShipping(cost: number): void {
    if (cost < 0) throw new ValidationError('Shipping cost must be non-negative');
    this._shipping = cost;
    this.recalcTotals();
  }

  setDiscount(amount: number): void {
    if (amount < 0) throw new ValidationError('Discount must be non-negative');
    this._discount = amount;
    this.recalcTotals();
  }

  mergeGuestCart(guestCart: Cart): void {
    for (const guestItem of guestCart.items) {
      const existing = this._items.find((i) => i.variantId === guestItem.variantId);
      if (existing) {
        existing.updateQuantity(existing.quantity + guestItem.quantity);
      } else {
        this._items.push(guestItem);
      }
    }
    if (guestCart._couponCode && !this._couponCode) {
      this._couponCode = guestCart._couponCode;
    }
    this.recalcTotals();
  }

  setCustomer(customerId: string): void {
    if (this._customerId) throw new ValidationError('Cart already has a customer');
    this._customerId = customerId;
    this._guestToken = null;
  }

  isEmpty(): boolean {
    return this._items.length === 0;
  }

  private recalcTotals(): void {
    this._subtotal = this._items.reduce((sum, item) => sum + item.totalPrice, 0);
    this._total = Math.max(0, this._subtotal - this._discount + this._shipping);
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      storeId: this.storeId,
      customerId: this._customerId,
      guestToken: this._guestToken,
      couponCode: this._couponCode,
      currency: this.currency,
      subtotal: this._subtotal,
      discount: this._discount,
      shipping: this._shipping,
      total: this._total,
      items: this._items.map((i) => i.toJSON()),
    };
  }
}
