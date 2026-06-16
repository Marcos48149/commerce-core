import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterCustomerUseCase } from '../application/register-customer.use-case';
import { LoginCustomerUseCase } from '../application/login-customer.use-case';
import { RefreshCustomerTokenUseCase } from '../application/refresh-customer-token.use-case';
import { RegisterCustomerDto, LoginCustomerDto, RefreshCustomerTokenDto } from './customer-auth.dto';

@ApiTags('Customer Identity / Auth')
@Controller('customers/auth')
export class CustomerAuthController {
  constructor(
    private readonly registerCustomer: RegisterCustomerUseCase,
    private readonly loginCustomer: LoginCustomerUseCase,
    private readonly refreshToken: RefreshCustomerTokenUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterCustomerDto) {
    return this.registerCustomer.execute({
      tenantId: 'platform',
      storeId: dto.storeId ?? 'default',
      email: dto.email,
      password: dto.password,
      displayName: dto.displayName,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginCustomerDto) {
    return this.loginCustomer.execute({
      tenantId: 'platform',
      storeId: dto.storeId ?? 'default',
      email: dto.email,
      password: dto.password,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshCustomerTokenDto) {
    return this.refreshToken.execute(dto.refreshToken);
  }
}
