import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerRepository } from '../domain/customer.repository';

export interface UpdateProfileInput {
  customerId: string;
  storeId: string;
  displayName?: string;
  phone?: string;
}

@Injectable()
export class UpdateCustomerProfileUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(input: UpdateProfileInput) {
    const customer = await this.customerRepository.findById(input.customerId, input.storeId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    customer.update({
      displayName: input.displayName,
      phone: input.phone,
    });

    await this.customerRepository.update(customer);

    return {
      id: customer.id,
      email: customer.email,
      displayName: customer.displayName,
      phone: customer.phone,
    };
  }
}
