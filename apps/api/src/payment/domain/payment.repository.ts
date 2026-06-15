import { PaymentSession } from './payment-session.entity';

export interface PaymentRepository {
  findById(id: string, storeId: string): Promise<PaymentSession | null>;
  findByOrder(orderId: string, storeId: string): Promise<PaymentSession[]>;
  findByIdempotencyKey(key: string): Promise<PaymentSession | null>;
  findActiveProvider(storeId: string, code: string): Promise<{ id: string; config: Record<string, unknown> } | null>;
  save(session: PaymentSession): Promise<void>;
  update(session: PaymentSession): Promise<void>;
}
