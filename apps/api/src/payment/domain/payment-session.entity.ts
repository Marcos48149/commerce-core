import { ValidationError } from '@commerce/shared';

export enum PaymentSessionStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export class PaymentSession {
  private constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly storeId: string,
    public readonly providerId: string,
    private _providerSessionId: string | null,
    private _status: PaymentSessionStatus,
    public readonly amount: number,
    public readonly currency: string,
    private _idempotencyKey: string | null,
    private _metadata: Record<string, unknown>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    orderId: string;
    storeId: string;
    providerId: string;
    amount: number;
    currency?: string;
    idempotencyKey?: string;
    metadata?: Record<string, unknown>;
  }): PaymentSession {
    return new PaymentSession(
      params.id,
      params.orderId,
      params.storeId,
      params.providerId,
      null,
      PaymentSessionStatus.PENDING,
      params.amount,
      params.currency ?? 'ARS',
      params.idempotencyKey ?? null,
      params.metadata ?? {},
      new Date(),
      new Date(),
    );
  }

  get status(): PaymentSessionStatus { return this._status; }
  get providerSessionId(): string | null { return this._providerSessionId; }
  get idempotencyKey(): string | null { return this._idempotencyKey; }
  get metadata(): Record<string, unknown> { return { ...this._metadata }; }

  authorize(providerSessionId: string): void {
    if (this._status !== PaymentSessionStatus.PENDING) {
      throw new ValidationError('Can only authorize a PENDING session');
    }
    this._providerSessionId = providerSessionId;
    this._status = PaymentSessionStatus.AUTHORIZED;
  }

  confirm(): void {
    if (this._status !== PaymentSessionStatus.AUTHORIZED && this._status !== PaymentSessionStatus.PENDING) {
      throw new ValidationError('Can only confirm an AUTHORIZED or PENDING session');
    }
    this._status = PaymentSessionStatus.PAID;
  }

  reject(reason?: string): void {
    if (this._status !== PaymentSessionStatus.PENDING && this._status !== PaymentSessionStatus.AUTHORIZED) {
      throw new ValidationError('Can only reject a PENDING or AUTHORIZED session');
    }
    this._status = PaymentSessionStatus.REJECTED;
    if (reason) {
      this._metadata = { ...this._metadata, rejectionReason: reason };
    }
  }

  refund(): void {
    if (this._status !== PaymentSessionStatus.PAID) {
      throw new ValidationError('Can only refund a PAID session');
    }
    this._status = PaymentSessionStatus.REFUNDED;
  }

  cancel(): void {
    if (this._status === PaymentSessionStatus.PAID || this._status === PaymentSessionStatus.REFUNDED) {
      throw new ValidationError('Cannot cancel a PAID or REFUNDED session');
    }
    this._status = PaymentSessionStatus.CANCELLED;
  }

  setProviderSessionId(sessionId: string): void {
    this._providerSessionId = sessionId;
  }

  setMetadata(metadata: Record<string, unknown>): void {
    this._metadata = { ...this._metadata, ...metadata };
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      storeId: this.storeId,
      providerId: this.providerId,
      providerSessionId: this._providerSessionId,
      status: this._status,
      amount: this.amount,
      currency: this.currency,
      idempotencyKey: this._idempotencyKey,
      metadata: this._metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
