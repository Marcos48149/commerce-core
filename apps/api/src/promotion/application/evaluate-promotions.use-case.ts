import { Injectable } from '@nestjs/common';
import { PromotionRepository } from '../domain/promotion.repository';
import { Promotion, PromotionType } from '../domain/promotion.entity';

export interface EvaluatePromotionsInput {
  storeId: string;
  tenantId: string;
  items: Array<{
    variantId: string;
    productId: string;
    categoryIds: string[];
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  paymentMethod?: string;
  customerId?: string;
}

export interface AppliedPromotion {
  promotionId: string;
  promotionName: string;
  type: PromotionType;
  discount: number;
  description: string;
}

export interface EvaluatePromotionsResult {
  appliedPromotions: AppliedPromotion[];
  totalDiscount: number;
  adjustedSubtotal: number;
}

@Injectable()
export class EvaluatePromotionsUseCase {
  constructor(
    private readonly promotionRepository: PromotionRepository,
  ) {}

  async execute(input: EvaluatePromotionsInput): Promise<EvaluatePromotionsResult> {
    const activePromotions = await this.promotionRepository.findActiveByStore(input.storeId);
    const eligible = this.filterEligible(activePromotions, input);
    eligible.sort((a, b) => b.priority - a.priority);

    const appliedPromotions: AppliedPromotion[] = [];
    let totalDiscount = 0;

    for (const promo of eligible) {
      const result = this.calculateDiscount(promo, input);
      if (result !== null) {
        promo.incrementUsage();
        await this.promotionRepository.update(promo);
        appliedPromotions.push(result);
        totalDiscount += result.discount;
        break;
      }
    }

    return {
      appliedPromotions,
      totalDiscount,
      adjustedSubtotal: Math.max(0, input.subtotal - totalDiscount),
    };
  }

  private filterEligible(promotions: Promotion[], input: EvaluatePromotionsInput): Promotion[] {
    return promotions.filter((p) => {
      if (!p.isCurrentlyActive()) return false;

      if (p.minQuantity !== null) {
        const totalQty = input.items.reduce((sum, i) => sum + i.quantity, 0);
        if (totalQty < p.minQuantity) return false;
      }

      if (p.minCartAmount !== null && input.subtotal < p.minCartAmount) return false;

      if (p.type === PromotionType.PRODUCT_FIXED || p.type === PromotionType.PRODUCT_PERCENTAGE) {
        if (p.targetProductId === null) return false;
        const hasTarget = input.items.some((i) => i.productId === p.targetProductId);
        if (!hasTarget) return false;
      }

      if (p.type === PromotionType.CATEGORY_DISCOUNT) {
        if (p.targetCategoryId === null) return false;
        const hasCategory = input.items.some((i) =>
          i.categoryIds.includes(p.targetCategoryId!),
        );
        if (!hasCategory) return false;
      }

      if (p.type === PromotionType.PAYMENT_METHOD_DISCOUNT) {
        if (!input.paymentMethod || p.targetPaymentMethod !== input.paymentMethod) return false;
      }

      if (p.type === PromotionType.BXGY) {
        const buyQty = p.config.buyQuantity ?? 1;
        const totalQty = input.items.reduce((sum, i) => sum + i.quantity, 0);
        if (totalQty < buyQty) return false;
      }

      return true;
    });
  }

  private calculateDiscount(
    promo: Promotion,
    input: EvaluatePromotionsInput,
  ): AppliedPromotion | null {
    switch (promo.type) {
      case PromotionType.PRODUCT_FIXED: {
        const item = input.items.find((i) => i.productId === promo.targetProductId);
        if (!item) return null;
        const discount = Math.min(promo.config.discountValue ?? 0, item.unitPrice * item.quantity);
        return {
          promotionId: promo.id,
          promotionName: promo.name,
          type: promo.type,
          discount,
          description: `$${discount} off ${item.productId}`,
        };
      }

      case PromotionType.PRODUCT_PERCENTAGE: {
        const item = input.items.find((i) => i.productId === promo.targetProductId);
        if (!item) return null;
        const rawDiscount = (item.unitPrice * item.quantity) * ((promo.config.discountPercent ?? 0) / 100);
        const discount = promo.config.maxDiscount
          ? Math.min(rawDiscount, promo.config.maxDiscount)
          : rawDiscount;
        return {
          promotionId: promo.id,
          promotionName: promo.name,
          type: promo.type,
          discount,
          description: `${promo.config.discountPercent}% off ${item.productId}`,
        };
      }

      case PromotionType.CATEGORY_DISCOUNT: {
        const categoryItems = input.items.filter((i) =>
          i.categoryIds.includes(promo.targetCategoryId!),
        );
        const categoryTotal = categoryItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
        const rawDiscount = categoryTotal * ((promo.config.discountPercent ?? 0) / 100);
        const discount = promo.config.maxDiscount
          ? Math.min(rawDiscount, promo.config.maxDiscount)
          : rawDiscount;
        return {
          promotionId: promo.id,
          promotionName: promo.name,
          type: promo.type,
          discount,
          description: `${promo.config.discountPercent}% off category`,
        };
      }

      case PromotionType.CART_PERCENTAGE: {
        const rawDiscount = input.subtotal * ((promo.config.discountPercent ?? 0) / 100);
        const discount = promo.config.maxDiscount
          ? Math.min(rawDiscount, promo.config.maxDiscount)
          : rawDiscount;
        return {
          promotionId: promo.id,
          promotionName: promo.name,
          type: promo.type,
          discount,
          description: `${promo.config.discountPercent}% off cart`,
        };
      }

      case PromotionType.PAYMENT_METHOD_DISCOUNT: {
        const rawDiscount = input.subtotal * ((promo.config.discountPercent ?? 0) / 100);
        const discount = promo.config.maxDiscount
          ? Math.min(rawDiscount, promo.config.maxDiscount)
          : rawDiscount;
        return {
          promotionId: promo.id,
          promotionName: promo.name,
          type: promo.type,
          discount,
          description: `${promo.config.discountPercent}% off with ${input.paymentMethod}`,
        };
      }

      case PromotionType.COUPON: {
        if (promo.config.discountPercent) {
          const rawDiscount = input.subtotal * (promo.config.discountPercent / 100);
          const discount = promo.config.maxDiscount
            ? Math.min(rawDiscount, promo.config.maxDiscount)
            : rawDiscount;
          return {
            promotionId: promo.id,
            promotionName: promo.name,
            type: promo.type,
            discount,
            description: `Coupon: ${promo.config.discountPercent}% off`,
          };
        }
        const discount = Math.min(promo.config.discountValue ?? 0, input.subtotal);
        return {
          promotionId: promo.id,
          promotionName: promo.name,
          type: promo.type,
          discount,
          description: `Coupon: $${discount} off`,
        };
      }

      case PromotionType.BXGY: {
        const buyQty = promo.config.buyQuantity ?? 1;
        const getQty = promo.config.getQuantity ?? 1;
        const sorted = [...input.items].sort((a, b) => a.unitPrice - b.unitPrice);
        const freeItems = sorted.slice(0, Math.min(getQty, sorted.length));
        const discount = freeItems.reduce((s, i) => s + i.unitPrice * Math.min(i.quantity, getQty), 0);
        return {
          promotionId: promo.id,
          promotionName: promo.name,
          type: promo.type,
          discount,
          description: `Buy ${buyQty} get ${getQty} free`,
        };
      }

      default:
        return null;
    }
  }
}
