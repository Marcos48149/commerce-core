import { Injectable } from '@nestjs/common';
import { CartRepository } from '../domain/cart.repository';

export interface ApplyCouponInput {
  storeId: string;
  customerId?: string;
  guestToken?: string;
  couponCode: string;
}

@Injectable()
export class ApplyCouponUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(input: ApplyCouponInput): Promise<Cart> {
    let cart = input.customerId
      ? await this.cartRepository.findByCustomer(input.customerId, input.storeId)
      : input.guestToken
        ? await this.cartRepository.findByGuestToken(input.guestToken, input.storeId)
        : null;

    if (!cart) throw new Error('Cart not found');

    cart.applyCoupon(input.couponCode);
    await this.cartRepository.update(cart);

    return cart;
  }
}
