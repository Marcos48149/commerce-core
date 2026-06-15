import { Injectable } from '@nestjs/common';
import { Cart } from '../domain/cart.entity';
import { CartRepository } from '../domain/cart.repository';

export interface CalculateShippingInput {
  storeId: string;
  customerId?: string;
  guestToken?: string;
  shippingCost: number;
}

@Injectable()
export class CalculateShippingUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(input: CalculateShippingInput): Promise<Cart> {
    let cart = input.customerId
      ? await this.cartRepository.findByCustomer(input.customerId, input.storeId)
      : input.guestToken
        ? await this.cartRepository.findByGuestToken(input.guestToken, input.storeId)
        : null;

    if (!cart) throw new Error('Cart not found');

    cart.setShipping(input.shippingCost);
    await this.cartRepository.update(cart);

    return cart;
  }
}
