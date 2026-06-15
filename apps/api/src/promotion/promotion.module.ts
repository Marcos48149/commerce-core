import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { PromotionRepository } from './domain/promotion.repository';
import { CouponRepository } from './domain/coupon.repository';
import { PrismaPromotionRepository } from './infrastructure/prisma-promotion.repository';
import { PrismaCouponRepository } from './infrastructure/prisma-coupon.repository';
import { EvaluatePromotionsUseCase } from './application/evaluate-promotions.use-case';
import { ValidateCouponUseCase } from './application/validate-coupon.use-case';
import { ManagePromotionsUseCase } from './application/manage-promotions.use-case';
import { AutoGiftUseCase } from './application/auto-gift.use-case';
import { PromotionController } from './interface/promotion.controller';

@Module({
  imports: [IamModule],
  controllers: [PromotionController],
  providers: [
    { provide: PromotionRepository, useClass: PrismaPromotionRepository },
    { provide: CouponRepository, useClass: PrismaCouponRepository },
    EvaluatePromotionsUseCase,
    ValidateCouponUseCase,
    ManagePromotionsUseCase,
    AutoGiftUseCase,
  ],
  exports: [EvaluatePromotionsUseCase, AutoGiftUseCase],
})
export class PromotionModule {}
