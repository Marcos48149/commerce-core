import { Injectable, NotFoundException } from '@nestjs/common';
import { UlidService } from '../../common/ulid.service';
import { CustomerRepository } from '../domain/customer.repository';
import { Address } from '../domain/address.entity';

export interface CreateAddressInput {
  customerId: string;
  type: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  id: string;
  customerId: string;
  type?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

@Injectable()
export class ManageAddressesUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly ulidService: UlidService,
  ) {}

  async list(customerId: string) {
    const addresses = await this.customerRepository.findAddressesByCustomer(customerId);
    return addresses.map((a) => ({
      id: a.id,
      type: a.type,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      province: a.province,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault,
    }));
  }

  async create(input: CreateAddressInput) {
    if (input.isDefault) {
      await this.customerRepository.unsetDefaultAddresses(input.customerId);
    }

    const address = Address.create({
      id: this.ulidService.generate(),
      customerId: input.customerId,
      type: input.type,
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      province: input.province,
      postalCode: input.postalCode,
      country: input.country,
      isDefault: input.isDefault,
    });

    await this.customerRepository.saveAddress(address);

    return {
      id: address.id,
      type: address.type,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    };
  }

  async update(input: UpdateAddressInput) {
    const address = await this.customerRepository.findAddressById(input.id, input.customerId);
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (input.isDefault) {
      await this.customerRepository.unsetDefaultAddresses(input.customerId);
    }

    address.update({
      type: input.type,
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      province: input.province,
      postalCode: input.postalCode,
      country: input.country,
      isDefault: input.isDefault,
    });

    await this.customerRepository.updateAddress(address);

    return {
      id: address.id,
      type: address.type,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    };
  }

  async delete(id: string, customerId: string) {
    const address = await this.customerRepository.findAddressById(id, customerId);
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.customerRepository.deleteAddress(id, customerId);
  }
}
