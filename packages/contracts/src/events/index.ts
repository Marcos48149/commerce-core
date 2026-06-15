export interface DomainEvent {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  data: Record<string, unknown>;
  storeId: string;
  tenantId: string;
}

export interface IOrderEvent extends DomainEvent {
  type:
    | 'order.created'
    | 'order.paid'
    | 'order.cancelled'
    | 'order.updated'
    | 'order.refunded';
  data: {
    orderId: string;
    orderNumber: number;
    total: number;
    currency: string;
    status: string;
    previousStatus?: string;
  };
}

export interface IInventoryEvent extends DomainEvent {
  type: 'inventory.updated';
  data: {
    variantId: string;
    previousStock: number;
    newStock: number;
    adjustment: number;
    reason: string;
  };
}

export interface ICustomerEvent extends DomainEvent {
  type: 'customer.created';
  data: {
    customerId: string;
    email: string;
  };
}
