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

export interface PromotionRepository {
  findById(id: string, storeId: string): Promise<Promotion | null>;
  findByStore(storeId: string, filter?: PromotionFilter): Promise<PaginatedPromotions>;
  findActiveByStore(storeId: string): Promise<Promotion[]>;
  save(promotion: Promotion): Promise<void>;
  update(promotion: Promotion): Promise<void>;
  delete(id: string, storeId: string): Promise<void>;
}
