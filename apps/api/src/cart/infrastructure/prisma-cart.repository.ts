import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CartRepository } from '../domain/cart.repository';
import { Cart, CartItem } from '../domain/cart.entity';

@Injectable()
export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(row: any): Cart {
    const items = (row.items ?? []).map((ir: any) =>
      CartItem.reconstitute({
        id: ir.id,
        cartId: ir.cartId,
        variantId: ir.variantId,
        productId: ir.productId,
        storeId: ir.storeId,
        quantity: ir.quantity,
        unitPrice: Number(ir.unitPrice),
        totalPrice: Number(ir.totalPrice),
        createdAt: ir.createdAt,
        updatedAt: ir.updatedAt,
      }),
    );

    return Cart.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      storeId: row.storeId,
      customerId: row.customerId,
      guestToken: row.guestToken,
      couponCode: row.couponCode,
      currency: row.currency,
      subtotal: Number(row.subtotal),
      discount: Number(row.discount),
      shipping: Number(row.shipping),
      total: Number(row.total),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      items,
    });
  }

  async findById(id: string, storeId: string): Promise<Cart | null> {
    const row = await this.prisma.cart.findFirst({
      where: { id, storeId },
      include: { items: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByCustomer(customerId: string, storeId: string): Promise<Cart | null> {
    const row = await this.prisma.cart.findFirst({
      where: { customerId, storeId },
      include: { items: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByGuestToken(guestToken: string, storeId: string): Promise<Cart | null> {
    const row = await this.prisma.cart.findFirst({
      where: { guestToken, storeId },
      include: { items: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(cart: Cart): Promise<void> {
    const data = cart.toJSON();
    await this.prisma.cart.create({
      data: {
        id: data.id,
        tenantId: data.tenantId,
        storeId: data.storeId,
        customerId: data.customerId,
        guestToken: data.guestToken,
        couponCode: data.couponCode,
        currency: data.currency,
        subtotal: data.subtotal,
        discount: data.discount,
        shipping: data.shipping,
        total: data.total,
        items: {
          create: data.items.map((item: any) => ({
            id: item.id,
            variantId: item.variantId,
            productId: item.productId,
            storeId: item.storeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
    });
  }

  async update(cart: Cart): Promise<void> {
    const data = cart.toJSON();
    await this.prisma.cart.update({
      where: { id: data.id },
      data: {
        couponCode: data.couponCode,
        subtotal: data.subtotal,
        discount: data.discount,
        shipping: data.shipping,
        total: data.total,
      },
    });

    await this.prisma.cartItem.deleteMany({ where: { cartId: data.id } });
    for (const item of data.items) {
      await this.prisma.cartItem.create({
        data: {
          id: item.id,
          cartId: data.id,
          variantId: item.variantId,
          productId: item.productId,
          storeId: item.storeId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        },
      });
    }
  }

  async delete(id: string, storeId: string): Promise<void> {
    await this.prisma.cart.deleteMany({
      where: { id, storeId },
    });
  }
}
