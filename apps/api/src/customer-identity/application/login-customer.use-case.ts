import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CustomerRepository } from '../domain/customer.repository';
import { CustomerTokenService } from './customer-token.service';
import * as bcrypt from 'bcrypt';

export interface LoginCustomerInput {
  tenantId: string;
  storeId: string;
  email: string;
  password: string;
}

@Injectable()
export class LoginCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly prisma: PrismaClient,
    private readonly tokenService: CustomerTokenService,
  ) {}

  async execute(input: LoginCustomerInput) {
    // Resolve tenant slug → tenant id
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: input.tenantId } });
    if (!tenant) throw new UnauthorizedException('Invalid credentials');

    // Resolve store slug → store id (slug is unique within a tenant)
    const store = await this.prisma.store.findFirst({ where: { tenantId: tenant.id, slug: input.storeId } });
    if (!store) throw new UnauthorizedException('Invalid credentials');
    const storeId = store.id;

    const customer = await this.customerRepository.findByEmail(storeId, input.email);
    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordHash = await this.customerRepository.findPasswordHash(customer.id);
    if (!passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(input.password, passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });

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
