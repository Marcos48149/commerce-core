import { Stock } from './stock.entity';

export interface StockAdjustmentLog {
  id: string;
  stockId: string;
  variantId: string;
  storeId: string;
  type: string;
  quantity: number;
  reason: string;
  referenceId: string | null;
  createdAt: Date;
}

import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class InventoryRepository {
  abstract findByVariant(variantId: string, storeId: string): Promise<Stock | null>;
  abstract findByProduct(productId: string, storeId: string): Promise<Stock[]>;
  abstract findLowStock(storeId: string, threshold?: number): Promise<Stock[]>;
  abstract save(stock: Stock): Promise<void>;
  abstract update(stock: Stock): Promise<void>;
  abstract createAdjustmentLog(log: Omit<StockAdjustmentLog, 'id' | 'createdAt'>): Promise<void>;
}
