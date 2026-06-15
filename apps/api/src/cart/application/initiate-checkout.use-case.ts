import { Injectable } from '@nestjs/common';
import { CartRepository } from '../domain/cart.repository';
import { CommandBus } from '@nestjs/cqrs';
import { InitiateOrderCommand } from '../../order/application/commands/initiate-order.handler';
import { EvaluatePromotionsUseCase } from '../../promotion/application/evaluate-promotions.use-case';
import { AutoGiftUseCase } from '../../promotion/application/auto-gift.use-case';

export interface InitiateCheckoutInput {
  storeId: string;
  tenantId: string;
  customerId?: string;
  guestToken?: string;
  shippingCost?: number;
  notes?: string;
  paymentMethod?: string;
}

export interface InitiateCheckoutResult {
  orderId: string;
  orderNumber: number;
  total: number;
  currency: string;
  appliedPromotions?: Array<{
    promotionId: string;
    promotionName: string;
    type: string;
    discount: number;
  }>;
  autoGift?: {
    giftApplied: boolean;
    giftVariantId?: string;
    giftProductId?: string;
  };
}

@Injectable()
export class InitiateCheckoutUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly commandBus: CommandBus,
    private readonly evaluatePromotions: EvaluatePromotionsUseCase,
    private readonly autoGift: AutoGiftUseCase,
  ) {}

  async execute(input: InitiateCheckoutInput): Promise<InitiateCheckoutResult> {
    let cart = input.customerId
      ? await this.cartRepository.findByCustomer(input.customerId, input.storeId)
      : input.guestToken
        ? await this.cartRepository.findByGuestToken(input.guestToken, input.storeId)
        : null;

    if (!cart) throw new Error('Cart not found');
    if (cart.isEmpty()) throw new Error('Cannot checkout with empty cart');

    const promoResult = await this.evaluatePromotions.execute({
      storeId: input.storeId,
      tenantId: input.tenantId,
      items: cart.items.map((i) => ({
        variantId: i.variantId,
        productId: i.productId,
        categoryIds: [],
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      subtotal: cart.subtotal,
      paymentMethod: input.paymentMethod,
      customerId: input.customerId,
    });

    const autoGiftResult = await this.autoGift.execute({
      storeId: input.storeId,
      tenantId: input.tenantId,
      subtotal: promoResult.adjustedSubtotal,
    });

    if (promoResult.totalDiscount > 0) {
      cart.setDiscount(promoResult.totalDiscount);
    }

    const result = await this.commandBus.execute(
      new InitiateOrderCommand(
        input.tenantId,
        input.storeId,
        cart.customerId,
        cart.items.map((i) => ({
          variantId: i.variantId,
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        cart.subtotal,
        promoResult.totalDiscount,
        input.shippingCost ?? cart.shipping,
        promoResult.adjustedSubtotal + (input.shippingCost ?? cart.shipping),
        cart.currency,
        cart.couponCode ?? undefined,
        input.notes,
      ),
    );

    await this.cartRepository.delete(cart.id, input.storeId);

    return {
      ...result,
      appliedPromotions: promoResult.appliedPromotions.map((p) => ({
        promotionId: p.promotionId,
        promotionName: p.promotionName,
        type: p.type,
        discount: p.discount,
      })),
      autoGift: autoGiftResult,
    };
  }
}
