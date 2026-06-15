import { createHmac } from 'crypto';
import { WebhookEventType } from './domain-event';

export class WebhookEndpoint {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    private _url: string,
    private _secret: string,
    private _events: WebhookEventType[],
    private _isActive: boolean,
    private _retryCount: number,
    private _timeoutMs: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: {
    id: string;
    tenantId: string;
    storeId: string;
    url: string;
    secret: string;
    events: WebhookEventType[];
    retryCount?: number;
    timeoutMs?: number;
  }): WebhookEndpoint {
    return new WebhookEndpoint(
      params.id,
      params.tenantId,
      params.storeId,
      params.url,
      params.secret,
      params.events,
      true,
      params.retryCount ?? 3,
      params.timeoutMs ?? 5000,
      new Date(),
      new Date(),
      null,
    );
  }

  get url(): string { return this._url; }
  get secret(): string { return this._secret; }
  get events(): WebhookEventType[] { return [...this._events]; }
  get isActive(): boolean { return this._isActive; }
  get retryCount(): number { return this._retryCount; }
  get timeoutMs(): number { return this._timeoutMs; }

  matchesEvent(eventType: string): boolean {
    return this._events.includes(eventType as WebhookEventType);
  }

  signPayload(payload: string): string {
    return createHmac('sha256', this._secret).update(payload).digest('hex');
  }

  update(params: {
    url?: string;
    secret?: string;
    events?: WebhookEventType[];
    isActive?: boolean;
    retryCount?: number;
    timeoutMs?: number;
  }): void {
    if (params.url !== undefined) this._url = params.url;
    if (params.secret !== undefined) this._secret = params.secret;
    if (params.events !== undefined) this._events = params.events;
    if (params.isActive !== undefined) this._isActive = params.isActive;
    if (params.retryCount !== undefined) this._retryCount = params.retryCount;
    if (params.timeoutMs !== undefined) this._timeoutMs = params.timeoutMs;
  }

  activate(): void { this._isActive = true; }
  deactivate(): void { this._isActive = false; }

  softDelete(): void {
    (this as { deletedAt: Date | null }).deletedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
