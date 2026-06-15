import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OrderRepository } from '../../domain/order.repository';

export class GetOrderQuery {
  constructor(
    public readonly id: string,
    public readonly storeId: string,
  ) {}
}

@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: GetOrderQuery): Promise<any> {
    const order = await this.orderRepository.findById(query.id, query.storeId);
    return order ? order.toJSON() : null;
  }
}
