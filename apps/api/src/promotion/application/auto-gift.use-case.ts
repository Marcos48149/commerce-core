import { Injectable, Logger } from '@nestjs/common';
import { PromotionRepository } from '../domain/promotion.repository';
import { PromotionType } from '../domain/promotion.entity';

export interface AutoGiftInput {
  storeId: string;
  tenantId: string;
  subtotal: number;
}

export interface AutoGiftResult {
  giftApplied: boolean;
  giftVariantId?: string;
  giftProductId?: string;
}

@Injectable()
export class AutoGiftUseCase {
  private readonly logger = new Logger(AutoGiftUseCase.name);

  constructor(
    private readonly promotionRepository: PromotionRepository,
  ) {}

  async execute(input: AutoGiftInput): Promise<AutoGiftResult> {
    const activePromotions = await this.promotionRepository.findActiveByStore(input.storeId);
    const autoGifts = activePromotions.filter(
      (p) => p.type === PromotionType.AUTOMATIC_GIFT && p.isCurrentlyActive(),
    );

    for (const gift of autoGifts) {
      if (gift.minCartAmount !== null && input.subtotal < gift.minCartAmount) {
        continue;
      }

      const giftVariantId = gift.config.giftVariantId;
      const giftProductId = gift.config.giftProductId;

      if (!giftVariantId || !giftProductId) {
        this.logger.warn(`Auto-gift promotion ${gift.id} missing giftVariantId or giftProductId`);
        continue;
      }

      gift.incrementUsage();
      await this.promotionRepository.update(gift);

      return {
        giftApplied: true,
        giftVariantId,
        giftProductId,
      };
    }

    return { giftApplied: false };
  }
}
