import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CustomerRepository } from '../domain/customer.repository';
import { Customer } from '../domain/customer.entity';
import { Address } from '../domain/address.entity';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(storeId: string, email: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({
      where: { storeId_email: { storeId, email } },
    });
    return row ? this.toCustomer(row) : null;
  }

  async findById(id: string, storeId: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findFirst({
      where: { id, storeId, deletedAt: null },
    });
    return row ? this.toCustomer(row) : null;
  }

  async findPasswordHash(id: string): Promise<string | null> {
    const row = await this.prisma.customer.findUnique({
      where: { id },
      select: { passwordHash: true },
    });
    return row?.passwordHash ?? null;
  }

  async save(customer: Customer, passwordHash: string): Promise<void> {
    await this.prisma.customer.create({
      data: {
        id: customer.id,
        tenantId: customer.tenantId,
        storeId: customer.storeId,
        email: customer.email,
        passwordHash,
        displayName: customer.displayName,
        phone: customer.phone,
        isActive: customer.isActive,
      },
    });
  }

  async update(customer: Customer): Promise<void> {
    await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        email: customer.email,
        displayName: customer.displayName,
        phone: customer.phone,
        isActive: customer.isActive,
        deletedAt: customer['deletedAt'],
      },
    });
  }

  async findAddressesByCustomer(customerId: string): Promise<Address[]> {
    const rows = await this.prisma.address.findMany({
      where: { customerId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toAddress(r));
  }

  async findAddressById(id: string, customerId: string): Promise<Address | null> {
    const row = await this.prisma.address.findFirst({
      where: { id, customerId, deletedAt: null },
    });
    return row ? this.toAddress(row) : null;
  }

  async saveAddress(address: Address): Promise<void> {
    await this.prisma.address.create({
      data: {
        id: address.id,
        customerId: address.customerId,
        type: address.type,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
      },
    });
  }

  async updateAddress(address: Address): Promise<void> {
    await this.prisma.address.update({
      where: { id: address.id },
      data: {
        type: address.type,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
        deletedAt: address['deletedAt'],
      },
    });
  }

  async deleteAddress(id: string, customerId: string): Promise<void> {
    await this.prisma.address.updateMany({
      where: { id, customerId },
      data: { deletedAt: new Date() },
    });
  }

  async unsetDefaultAddresses(customerId: string): Promise<void> {
    await this.prisma.address.updateMany({
      where: { customerId, isDefault: true },
      data: { isDefault: false },
    });
  }

  private toCustomer(row: any): Customer {
    return Customer.create({
      id: row.id,
      tenantId: row.tenantId,
      storeId: row.storeId,
      email: row.email,
      displayName: row.displayName,
      phone: row.phone,
    });
  }

  private toAddress(row: any): Address {
    return Address.create({
      id: row.id,
      customerId: row.customerId,
      type: row.type,
      line1: row.line1,
      line2: row.line2,
      city: row.city,
      province: row.province,
      postalCode: row.postalCode,
      country: row.country,
      isDefault: row.isDefault,
    });
  }
}
