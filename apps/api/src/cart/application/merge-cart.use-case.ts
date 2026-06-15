import { Injectable } from '@nestjs/common';
import { CartRepository } from '../domain/cart.repository';
import { Cart } from '../domain/cart.entity';
import { UlidService } from '../../common/ulid.service';

export interface MergeCartInput {
  tenantId: string;
  storeId: string;
  customerId: string;
  guestToken: string;
}

@Injectable()
export class MergeCartUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly ulidService: UlidService,
  ) {}

  async execute(input: MergeCartInput): Promise<Cart> {
    const guestCart = await this.cartRepository.findByGuestToken(input.guestToken, input.storeId);
    let customerCart = await this.cartRepository.findByCustomer(input.customerId, input.storeId);

    if (!guestCart) {
      if (customerCart) return customerCart;
      throw new Error('No cart found to merge');
    }

    if (!customerCart) {
      customerCart = Cart.createCustomer({
        id: this.ulidService.generate(),
        tenantId: input.tenantId,
        storeId: input.storeId,
        customerId: input.customerId,
      });
    }

    customerCart.mergeGuestCart(guestCart);

    await this.cartRepository.delete(guestCart.id, input.storeId);
    await this.cartRepository.update(customerCart);
    return customerCart;
  }
}
