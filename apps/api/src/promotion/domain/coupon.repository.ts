import { Coupon } from './coupon.entity';

export interface CouponRepository {
  findById(id: string, storeId: string): Promise<Coupon | null>;
  findByCode(code: string, storeId: string): Promise<Coupon | null>;
  findByPromotion(promotionId: string, storeId: string): Promise<Coupon[]>;
  save(coupon: Coupon): Promise<void>;
  update(coupon: Coupon): Promise<void>;
  delete(id: string, storeId: string): Promise<void>;
}
