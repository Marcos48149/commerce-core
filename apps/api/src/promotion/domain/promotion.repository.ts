import { Promotion, PromotionType } from './promotion.entity';

export interface PromotionFilter {
  type?: PromotionType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedPromotions {
  data: Promotion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class PromotionRepository {
  abstract findById(id: string, storeId: string): Promise<Promotion | null>;
  abstract findByStore(storeId: string, filter?: PromotionFilter): Promise<PaginatedPromotions>;
  abstract findActiveByStore(storeId: string): Promise<Promotion[]>;
  abstract save(promotion: Promotion): Promise<void>;
  abstract update(promotion: Promotion): Promise<void>;
  abstract delete(id: string, storeId: string): Promise<void>;
}
