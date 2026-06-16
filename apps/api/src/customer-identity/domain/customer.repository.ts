import { Injectable } from '@nestjs/common';
import { Customer } from './customer.entity';
import { Address } from './address.entity';

@Injectable()
export abstract class CustomerRepository {
  abstract findByEmail(storeId: string, email: string): Promise<Customer | null>;
  abstract findById(id: string, storeId: string): Promise<Customer | null>;
  abstract findPasswordHash(id: string): Promise<string | null>;
  abstract save(customer: Customer, passwordHash: string): Promise<void>;
  abstract update(customer: Customer): Promise<void>;

  abstract findAddressesByCustomer(customerId: string): Promise<Address[]>;
  abstract findAddressById(id: string, customerId: string): Promise<Address | null>;
  abstract saveAddress(address: Address): Promise<void>;
  abstract updateAddress(address: Address): Promise<void>;
  abstract deleteAddress(id: string, customerId: string): Promise<void>;
  abstract unsetDefaultAddresses(customerId: string): Promise<void>;
}
