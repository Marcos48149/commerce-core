import { Injectable } from '@nestjs/common';
import { CouponRepository } from '../domain/coupon.repository';
import { PromotionRepository } from '../domain/promotion.repository';

export interface ValidateCouponInput {
  code: string;
  storeId: string;
  customerId?: string;
}

export interface ValidateCouponResult {
  valid: boolean;
  promotionId?: string;
  promotionName?: string;
  discountDescription?: string;
  error?: string;
}

@Injectable()
export class ValidateCouponUseCase {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly promotionRepository: PromotionRepository,
  ) {}

  async execute(input: ValidateCouponInput): Promise<ValidateCouponResult> {
    const coupon = await this.couponRepository.findByCode(input.code.toUpperCase(), input.storeId);
    if (!coupon) {
      return { valid: false, error: 'Coupon not found' };
    }

    if (!coupon.isValid()) {
      return { valid: false, error: 'Coupon is expired or fully used' };
    }

    const promotion = await this.promotionRepository.findById(coupon.promotionId, input.storeId);
    if (!promotion) {
      return { valid: false, error: 'Associated promotion not found' };
    }

    if (!promotion.isCurrentlyActive()) {
      return { valid: false, error: 'Promotion is not active' };
    }

    return {
      valid: true,
      promotionId: promotion.id,
      promotionName: promotion.name,
      discountDescription: promotion.config.discountPercent
        ? `${promotion.config.discountPercent}% off`
        : `$${promotion.config.discountValue} off`,
    };
  }
}
