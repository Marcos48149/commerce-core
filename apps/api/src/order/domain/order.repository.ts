import { Order, OrderStatus } from './order.entity';

export interface OrderFilter {
  status?: OrderStatus;
  customerId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class OrderRepository {
  abstract findById(id: string, storeId: string): Promise<Order | null>;
  abstract findByStore(storeId: string, filter: OrderFilter): Promise<PaginatedOrders>;
  abstract findByCustomer(customerId: string, storeId: string): Promise<Order[]>;
  abstract findByOrderNumber(storeId: string, orderNumber: number): Promise<Order | null>;
  abstract findMaxOrderNumber(storeId: string): Promise<number>;
  abstract save(order: Order): Promise<void>;
  abstract update(order: Order): Promise<void>;
}
