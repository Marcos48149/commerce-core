import { Injectable } from '@nestjs/common';
import { UlidService } from '../../common/ulid.service';
import { PromotionRepository, PromotionFilter, PaginatedPromotions } from '../domain/promotion.repository';
import { CouponRepository } from '../domain/coupon.repository';
import { Promotion, PromotionType, PromotionConfig } from '../domain/promotion.entity';
import { Coupon } from '../domain/coupon.entity';

@Injectable()
export class ManagePromotionsUseCase {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly couponRepository: CouponRepository,
    private readonly ulidService: UlidService,
  ) {}

  async create(params: {
    tenantId: string;
    storeId: string;
    name: string;
    type: PromotionType;
    config: PromotionConfig;
    startsAt: Date;
    endsAt?: Date | null;
    minQuantity?: number | null;
    minCartAmount?: number | null;
    targetProductId?: string | null;
    targetCategoryId?: string | null;
    targetPaymentMethod?: string | null;
    maxUsage?: number | null;
    priority?: number;
  }): Promise<Promotion> {
    const promotion = Promotion.create({
      id: this.ulidService.generate(),
      ...params,
    });
    await this.promotionRepository.save(promotion);
    return promotion;
  }

  async update(params: {
    id: string;
    storeId: string;
    name?: string;
    config?: PromotionConfig;
    startsAt?: Date;
    endsAt?: Date | null;
    minQuantity?: number | null;
    minCartAmount?: number | null;
    targetProductId?: string | null;
    targetCategoryId?: string | null;
    targetPaymentMethod?: string | null;
    maxUsage?: number | null;
    priority?: number;
    isActive?: boolean;
  }): Promise<Promotion> {
    const promotion = await this.promotionRepository.findById(params.id, params.storeId);
    if (!promotion) throw new Error('Promotion not found');
    promotion.update(params);
    await this.promotionRepository.update(promotion);
    return promotion;
  }

  async delete(id: string, storeId: string): Promise<void> {
    await this.promotionRepository.delete(id, storeId);
  }

  async findById(id: string, storeId: string): Promise<Promotion | null> {
    return this.promotionRepository.findById(id, storeId);
  }

  async findByStore(storeId: string, filter?: PromotionFilter): Promise<PaginatedPromotions> {
    return this.promotionRepository.findByStore(storeId, filter);
  }

  async addCoupon(params: {
    promotionId: string;
    tenantId: string;
    storeId: string;
    code: string;
    maxUsage?: number | null;
    maxPerCustomer?: number | null;
  }): Promise<Coupon> {
    const promotion = await this.promotionRepository.findById(params.promotionId, params.storeId);
    if (!promotion) throw new Error('Promotion not found');

    const existing = await this.couponRepository.findByCode(params.code.toUpperCase(), params.storeId);
    if (existing) throw new Error('Coupon code already exists');

    const coupon = Coupon.create({
      id: this.ulidService.generate(),
      ...params,
    });
    await this.couponRepository.save(coupon);
    return coupon;
  }

  async listCoupons(promotionId: string, storeId: string): Promise<Coupon[]> {
    return this.couponRepository.findByPromotion(promotionId, storeId);
  }

  async deleteCoupon(id: string, storeId: string): Promise<void> {
    await this.couponRepository.delete(id, storeId);
  }
}
