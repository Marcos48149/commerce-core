import { PaymentSession } from './payment-session.entity';

import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class PaymentRepository {
  abstract findById(id: string, storeId: string): Promise<PaymentSession | null>;
  abstract findByOrder(orderId: string, storeId: string): Promise<PaymentSession[]>;
  abstract findByIdempotencyKey(key: string): Promise<PaymentSession | null>;
  abstract findActiveProvider(storeId: string, code: string): Promise<{ id: string; config: Record<string, unknown> } | null>;
  abstract save(session: PaymentSession): Promise<void>;
  abstract update(session: PaymentSession): Promise<void>;
}
