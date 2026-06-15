import { Cart } from './cart.entity';

import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class CartRepository {
  abstract findById(id: string, storeId: string): Promise<Cart | null>;
  abstract findByCustomer(customerId: string, storeId: string): Promise<Cart | null>;
  abstract findByGuestToken(guestToken: string, storeId: string): Promise<Cart | null>;
  abstract save(cart: Cart): Promise<void>;
  abstract update(cart: Cart): Promise<void>;
  abstract delete(id: string, storeId: string): Promise<void>;
}
