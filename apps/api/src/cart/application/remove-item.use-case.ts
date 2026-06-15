import { Injectable } from '@nestjs/common';
import { CartRepository } from '../domain/cart.repository';

export interface RemoveItemInput {
  storeId: string;
  customerId?: string;
  guestToken?: string;
  variantId: string;
}

@Injectable()
export class RemoveItemUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(input: RemoveItemInput): Promise<Cart | null> {
    let cart = input.customerId
      ? await this.cartRepository.findByCustomer(input.customerId, input.storeId)
      : input.guestToken
        ? await this.cartRepository.findByGuestToken(input.guestToken, input.storeId)
        : null;

    if (!cart) throw new Error('Cart not found');

    cart.removeItem(input.variantId);

    if (cart.isEmpty()) {
      await this.cartRepository.delete(cart.id, input.storeId);
      return null;
    }

    await this.cartRepository.update(cart);
    return cart;
  }
}
