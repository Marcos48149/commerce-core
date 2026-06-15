import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OrderRepository, OrderFilter } from '../../domain/order.repository';
import { OrderStatus } from '../../domain/order.entity';

export class ListOrdersQuery {
  constructor(
    public readonly storeId: string,
    public readonly filter: OrderFilter,
  ) {}
}

@QueryHandler(ListOrdersQuery)
export class ListOrdersHandler implements IQueryHandler<ListOrdersQuery> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: ListOrdersQuery): Promise<any> {
    const result = await this.orderRepository.findByStore(query.storeId, query.filter);
    return {
      ...result,
      data: result.data.map((o) => o.toJSON()),
    };
  }
}
