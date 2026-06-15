import { Injectable } from '@nestjs/common';
import { PrismaClient, PaymentStatus as PrismaPaymentStatus } from '@prisma/client';
import { PaymentRepository } from '../domain/payment.repository';
import { PaymentSession, PaymentSessionStatus } from '../domain/payment-session.entity';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(row: any): PaymentSession {
    return PaymentSession.create({
      id: row.id,
      orderId: row.orderId,
      storeId: row.storeId,
      providerId: row.providerId,
      amount: Number(row.amount),
      currency: row.currency,
      idempotencyKey: row.idempotencyKey ?? undefined,
      metadata: row.metadata ?? {},
    });
  }

  async findById(id: string, storeId: string): Promise<PaymentSession | null> {
    const row = await this.prisma.paymentSession.findFirst({
      where: { id, storeId },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByOrder(orderId: string, storeId: string): Promise<PaymentSession[]> {
    const rows = await this.prisma.paymentSession.findMany({
      where: { orderId, storeId },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findByIdempotencyKey(key: string): Promise<PaymentSession | null> {
    const row = await this.prisma.paymentSession.findUnique({
      where: { idempotencyKey: key },
    });
    return row ? this.toDomain(row) : null;
  }

  async findActiveProvider(storeId: string, code: string): Promise<{ id: string; config: Record<string, unknown> } | null> {
    const row = await this.prisma.paymentProvider.findFirst({
      where: { storeId, code, isActive: true, deletedAt: null },
    });
    return row ? { id: row.id, config: row.config as Record<string, unknown> } : null;
  }

  async save(session: PaymentSession): Promise<void> {
    const data = session.toJSON();
    await this.prisma.paymentSession.create({
      data: {
        id: data.id,
        orderId: data.orderId,
        storeId: data.storeId,
        providerId: data.providerId,
        providerSessionId: data.providerSessionId,
        status: data.status as PrismaPaymentStatus,
        amount: data.amount,
        currency: data.currency,
        idempotencyKey: data.idempotencyKey,
        metadata: data.metadata as any,
      },
    });
  }

  async update(session: PaymentSession): Promise<void> {
    const data = session.toJSON();
    await this.prisma.paymentSession.update({
      where: { id: data.id },
      data: {
        providerSessionId: data.providerSessionId,
        status: data.status as PrismaPaymentStatus,
        metadata: data.metadata as any,
      },
    });
  }
}
