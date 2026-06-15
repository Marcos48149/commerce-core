import { Cart } from './cart.entity';

export interface CartRepository {
  findById(id: string, storeId: string): Promise<Cart | null>;
  findByCustomer(customerId: string, storeId: string): Promise<Cart | null>;
  findByGuestToken(guestToken: string, storeId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
  update(cart: Cart): Promise<void>;
  delete(id: string, storeId: string): Promise<void>;
}
