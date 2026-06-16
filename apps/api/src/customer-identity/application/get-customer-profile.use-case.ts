import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerRepository } from '../domain/customer.repository';

@Injectable()
export class GetCustomerProfileUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(customerId: string, storeId: string) {
    const customer = await this.customerRepository.findById(customerId, storeId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const addresses = await this.customerRepository.findAddressesByCustomer(customerId);

    return {
      id: customer.id,
      email: customer.email,
      displayName: customer.displayName,
      phone: customer.phone,
      createdAt: customer.createdAt,
      addresses: addresses.map((a) => ({
        id: a.id,
        type: a.type,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        province: a.province,
        postalCode: a.postalCode,
        country: a.country,
        isDefault: a.isDefault,
      })),
    };
  }
}
