import { Injectable } from '@nestjs/common';
import { CartRepository } from '../domain/cart.repository';

export interface UpdateItemInput {
  storeId: string;
  customerId?: string;
  guestToken?: string;
  variantId: string;
  quantity: number;
}

@Injectable()
export class UpdateItemUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(input: UpdateItemInput): Promise<Cart | null> {
    let cart = input.customerId
      ? await this.cartRepository.findByCustomer(input.customerId, input.storeId)
      : input.guestToken
        ? await this.cartRepository.findByGuestToken(input.guestToken, input.storeId)
        : null;

    if (!cart) throw new Error('Cart not found');

    cart.updateItemQuantity(input.variantId, input.quantity);
    await this.cartRepository.update(cart);

    return cart;
  }
}
