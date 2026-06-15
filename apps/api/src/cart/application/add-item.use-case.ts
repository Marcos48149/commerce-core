import { Injectable } from '@nestjs/common';
import { UlidService } from '../../common/ulid.service';
import { CartRepository } from '../domain/cart.repository';
import { Cart, CartItem } from '../domain/cart.entity';

export interface AddItemInput {
  tenantId: string;
  storeId: string;
  customerId?: string;
  guestToken?: string;
  variantId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

@Injectable()
export class AddItemUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly ulidService: UlidService,
  ) {}

  async execute(input: AddItemInput): Promise<Cart> {
    let cart: Cart | null = null;

    if (input.customerId) {
      cart = await this.cartRepository.findByCustomer(input.customerId, input.storeId);
    } else if (input.guestToken) {
      cart = await this.cartRepository.findByGuestToken(input.guestToken, input.storeId);
    }

    if (!cart) {
      if (input.customerId) {
        cart = Cart.createCustomer({
          id: this.ulidService.generate(),
          tenantId: input.tenantId,
          storeId: input.storeId,
          customerId: input.customerId,
        });
      } else if (input.guestToken) {
        cart = Cart.createGuest({
          id: this.ulidService.generate(),
          tenantId: input.tenantId,
          storeId: input.storeId,
          guestToken: input.guestToken,
        });
      } else {
        throw new Error('Either customerId or guestToken must be provided');
      }

      const item = CartItem.create({
        id: this.ulidService.generate(),
        cartId: cart.id,
        variantId: input.variantId,
        productId: input.productId,
        storeId: input.storeId,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
      });

      cart.addItem(item);
      await this.cartRepository.save(cart);
    } else {
      const item = CartItem.create({
        id: this.ulidService.generate(),
        cartId: cart.id,
        variantId: input.variantId,
        productId: input.productId,
        storeId: input.storeId,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
      });

      cart.addItem(item);
      await this.cartRepository.update(cart);
    }

    return cart;
  }
}
