import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../iam/decorators/current-user.decorator';
import { GetCustomerProfileUseCase } from '../application/get-customer-profile.use-case';
import { UpdateCustomerProfileUseCase } from '../application/update-customer-profile.use-case';
import { ManageAddressesUseCase } from '../application/manage-addresses.use-case';
import { UpdateCustomerProfileDto, CreateAddressDto, UpdateAddressDto } from './customer-profile.dto';

interface CustomerUser {
  id: string;
  email: string;
  storeId: string;
}

@ApiTags('Customer Identity / Profile')
@ApiBearerAuth()
@UseGuards(AuthGuard('customer-jwt'))
@Controller('customers/me')
export class CustomerProfileController {
  constructor(
    private readonly getProfile: GetCustomerProfileUseCase,
    private readonly updateProfile: UpdateCustomerProfileUseCase,
    private readonly manageAddresses: ManageAddressesUseCase,
  ) {}

  @Get()
  async get(@CurrentUser() user: CustomerUser) {
    return this.getProfile.execute(user.id, user.storeId);
  }

  @Put()
  async update(@Body() dto: UpdateCustomerProfileDto, @CurrentUser() user: CustomerUser) {
    return this.updateProfile.execute({
      customerId: user.id,
      storeId: user.storeId,
      ...dto,
    });
  }

  @Get('addresses')
  async listAddresses(@CurrentUser() user: CustomerUser) {
    return this.manageAddresses.list(user.id);
  }

  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  async createAddress(@Body() dto: CreateAddressDto, @CurrentUser() user: CustomerUser) {
    return this.manageAddresses.create({ customerId: user.id, ...dto });
  }

  @Put('addresses/:id')
  async updateAddress(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @CurrentUser() user: CustomerUser,
  ) {
    return this.manageAddresses.update({ id, customerId: user.id, ...dto });
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(@Param('id') id: string, @CurrentUser() user: CustomerUser) {
    await this.manageAddresses.delete(id, user.id);
  }
}
