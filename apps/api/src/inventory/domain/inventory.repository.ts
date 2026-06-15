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

export interface InventoryRepository {
  findByVariant(variantId: string, storeId: string): Promise<Stock | null>;
  findByProduct(productId: string, storeId: string): Promise<Stock[]>;
  findLowStock(storeId: string, threshold?: number): Promise<Stock[]>;
  save(stock: Stock): Promise<void>;
  update(stock: Stock): Promise<void>;
  createAdjustmentLog(log: Omit<StockAdjustmentLog, 'id' | 'createdAt'>): Promise<void>;
}
