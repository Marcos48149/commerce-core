import { ShippingMethod } from './shipping-method.entity';

export interface ShippingRepository {
  findById(id: string, storeId: string): Promise<ShippingMethod | null>;
  findByStore(storeId: string): Promise<ShippingMethod[]>;
  findActiveByStore(storeId: string): Promise<ShippingMethod[]>;
  save(method: ShippingMethod): Promise<void>;
  update(method: ShippingMethod): Promise<void>;
  delete(id: string, storeId: string): Promise<void>;
}
