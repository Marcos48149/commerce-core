import { Coupon } from './coupon.entity';

import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class CouponRepository {
  abstract findById(id: string, storeId: string): Promise<Coupon | null>;
  abstract findByCode(code: string, storeId: string): Promise<Coupon | null>;
  abstract findByPromotion(promotionId: string, storeId: string): Promise<Coupon[]>;
  abstract save(coupon: Coupon): Promise<void>;
  abstract update(coupon: Coupon): Promise<void>;
  abstract delete(id: string, storeId: string): Promise<void>;
}
