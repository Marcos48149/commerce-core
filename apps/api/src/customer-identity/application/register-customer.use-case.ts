import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UlidService } from '../../common/ulid.service';
import { CustomerRepository } from '../domain/customer.repository';
import { Customer } from '../domain/customer.entity';
import { CustomerTokenService } from './customer-token.service';
import * as bcrypt from 'bcrypt';

export interface RegisterCustomerInput {
  tenantId: string;
  storeId: string;
  email: string;
  password: string;
  displayName?: string;
}

@Injectable()
export class RegisterCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly prisma: PrismaClient,
    private readonly ulidService: UlidService,
    private readonly tokenService: CustomerTokenService,
  ) {}

  async execute(input: RegisterCustomerInput) {
    // Resolve tenant slug → tenant id
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: input.tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const tenantId = tenant.id;

    // Resolve (tenantId, store slug) → store id
    const store = await this.prisma.store.findFirst({ where: { tenantId, slug: input.storeId } });
    if (!store) throw new NotFoundException('Store not found');
    const storeId = store.id;

    const existing = await this.customerRepository.findByEmail(storeId, input.email);
    if (existing) {
      throw new ConflictException('A customer with this email already exists in this store');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const customer = Customer.create({
      id: this.ulidService.generate(),
      tenantId,
      storeId,
      email: input.email,
      displayName: input.displayName,
    });

    await this.customerRepository.save(customer, passwordHash);

    const tokens = await this.tokenService.generateTokens({
      sub: customer.id,
      email: customer.email,
      storeId: customer.storeId,
    });

    return {
      customer: {
        id: customer.id,
        email: customer.email,
        displayName: customer.displayName,
      },
      ...tokens,
    };
  }
}
