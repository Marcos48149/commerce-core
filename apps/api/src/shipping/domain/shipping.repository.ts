import { ShippingMethod } from './shipping-method.entity';

import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class ShippingRepository {
  abstract findById(id: string, storeId: string): Promise<ShippingMethod | null>;
  abstract findByStore(storeId: string): Promise<ShippingMethod[]>;
  abstract findActiveByStore(storeId: string): Promise<ShippingMethod[]>;
  abstract save(method: ShippingMethod): Promise<void>;
  abstract update(method: ShippingMethod): Promise<void>;
  abstract delete(id: string, storeId: string): Promise<void>;
}
