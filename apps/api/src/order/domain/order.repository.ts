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

export interface OrderRepository {
  findById(id: string, storeId: string): Promise<Order | null>;
  findByStore(storeId: string, filter: OrderFilter): Promise<PaginatedOrders>;
  findByCustomer(customerId: string, storeId: string): Promise<Order[]>;
  findByOrderNumber(storeId: string, orderNumber: number): Promise<Order | null>;
  findMaxOrderNumber(storeId: string): Promise<number>;
  save(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
}
