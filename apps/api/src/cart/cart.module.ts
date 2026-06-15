import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IamModule } from '../iam/iam.module';
import { PromotionModule } from '../promotion/promotion.module';
import { CartRepository } from './domain/cart.repository';
import { PrismaCartRepository } from './infrastructure/prisma-cart.repository';
import { AddItemUseCase } from './application/add-item.use-case';
import { UpdateItemUseCase } from './application/update-item.use-case';
import { RemoveItemUseCase } from './application/remove-item.use-case';
import { ApplyCouponUseCase } from './application/apply-coupon.use-case';
import { CalculateShippingUseCase } from './application/calculate-shipping.use-case';
import { InitiateCheckoutUseCase } from './application/initiate-checkout.use-case';
import { MergeCartUseCase } from './application/merge-cart.use-case';
import { CartController } from './interface/cart.controller';

@Module({
  imports: [CqrsModule, IamModule, PromotionModule],
  controllers: [CartController],
  providers: [
    { provide: CartRepository, useClass: PrismaCartRepository },
    AddItemUseCase,
    UpdateItemUseCase,
    RemoveItemUseCase,
    ApplyCouponUseCase,
    CalculateShippingUseCase,
    InitiateCheckoutUseCase,
    MergeCartUseCase,
  ],
  exports: [CartRepository],
})
export class CartModule {}
