import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InventoryRepository, StockAdjustmentLog } from '../domain/inventory.repository';
import { Stock } from '../domain/stock.entity';

@Injectable()
export class PrismaInventoryRepository implements InventoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(row: any): Stock {
    return Stock.create({
      id: row.id,
      variantId: row.variantId,
      productId: row.productId,
      tenantId: row.tenantId,
      storeId: row.storeId,
      available: row.available,
      reserved: row.reserved,
      lowStockThreshold: row.lowStockThreshold,
    });
  }

  async findByVariant(variantId: string, storeId: string): Promise<Stock | null> {
    const row = await this.prisma.stock.findUnique({
      where: { variantId_storeId: { variantId, storeId } },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByProduct(productId: string, storeId: string): Promise<Stock[]> {
    const rows = await this.prisma.stock.findMany({
      where: { productId, storeId },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findLowStock(storeId: string, threshold?: number): Promise<Stock[]> {
    const rows = await this.prisma.stock.findMany({
      where: {
        storeId,
        available: { lte: threshold ?? 5 },
      },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(stock: Stock): Promise<void> {
    await this.prisma.stock.create({
      data: {
        id: stock['id'],
        variantId: stock['variantId'],
        productId: stock['productId'],
        tenantId: stock['tenantId'],
        storeId: stock['storeId'],
        available: stock.available,
        reserved: stock.reserved,
        lowStockThreshold: stock.lowStockThreshold,
      },
    });
  }

  async update(stock: Stock): Promise<void> {
    await this.prisma.stock.update({
      where: { id: stock['id'] },
      data: {
        available: stock.available,
        reserved: stock.reserved,
        lowStockThreshold: stock.lowStockThreshold,
      },
    });
  }

  async createAdjustmentLog(log: Omit<StockAdjustmentLog, 'id' | 'createdAt'>): Promise<void> {
    await this.prisma.stockAdjustment.create({
      data: {
        stockId: log.stockId,
        variantId: log.variantId,
        storeId: log.storeId,
        type: log.type,
        quantity: log.quantity,
        reason: log.reason,
        referenceId: log.referenceId,
      },
    });
  }
}
