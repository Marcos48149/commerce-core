import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CustomerRepository } from './domain/customer.repository';
import { PrismaCustomerRepository } from './infrastructure/prisma-customer.repository';
import { CustomerTokenService } from './application/customer-token.service';
import { CustomerJwtStrategy } from './application/customer-jwt.strategy';
import { RegisterCustomerUseCase } from './application/register-customer.use-case';
import { LoginCustomerUseCase } from './application/login-customer.use-case';
import { RefreshCustomerTokenUseCase } from './application/refresh-customer-token.use-case';
import { GetCustomerProfileUseCase } from './application/get-customer-profile.use-case';
import { UpdateCustomerProfileUseCase } from './application/update-customer-profile.use-case';
import { ManageAddressesUseCase } from './application/manage-addresses.use-case';
import { CustomerAuthController } from './interface/customer-auth.controller';
import { CustomerProfileController } from './interface/customer-profile.controller';

@Module({
  imports: [
    JwtModule.register({}),
  ],
  controllers: [CustomerAuthController, CustomerProfileController],
  providers: [
    { provide: CustomerRepository, useClass: PrismaCustomerRepository },
    CustomerTokenService,
    CustomerJwtStrategy,
    RegisterCustomerUseCase,
    LoginCustomerUseCase,
    RefreshCustomerTokenUseCase,
    GetCustomerProfileUseCase,
    UpdateCustomerProfileUseCase,
    ManageAddressesUseCase,
  ],
})
export class CustomerIdentityModule {}
