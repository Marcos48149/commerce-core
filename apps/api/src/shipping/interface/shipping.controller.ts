import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../iam/guards/permission.guard';
import { RequirePermission } from '../../iam/decorators/permission.decorator';
import { CurrentUser } from '../../iam/decorators/current-user.decorator';
import type { AuthUser } from '../../iam/services/permission-evaluator.service';
import { UlidService } from '../../common/ulid.service';
import { ShippingRepository } from '../domain/shipping.repository';
import { ShippingMethod } from '../domain/shipping-method.entity';
import { CalculateRateUseCase } from '../application/calculate-rate.use-case';
import { CreateShippingMethodDto, UpdateShippingMethodDto, CalculateRateDto } from './shipping.dto';

@ApiTags('Shipping')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('shipping')
export class ShippingController {
  constructor(
    private readonly shippingRepository: ShippingRepository,
    private readonly calculateRateUseCase: CalculateRateUseCase,
    private readonly ulidService: UlidService,
  ) {}

  @Post()
  @RequirePermission('shipping.write')
  async create(@Body() dto: CreateShippingMethodDto, @CurrentUser() user: AuthUser) {
    const method = ShippingMethod.create({
      id: this.ulidService.generate(),
      tenantId: user.tenantId,
      storeId: user.storeId!,
      name: dto.name,
      type: dto.type as any,
      cost: dto.cost,
      freeOver: dto.freeOver,
      sortOrder: dto.sortOrder,
    });

    await this.shippingRepository.save(method);
    return method;
  }

  @Get()
  @RequirePermission('shipping.read')
  async list(@CurrentUser() user: AuthUser) {
    return this.shippingRepository.findActiveByStore(user.storeId!);
  }

  @Get(':id')
  @RequirePermission('shipping.read')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.shippingRepository.findById(id, user.storeId!);
  }

  @Put(':id')
  @RequirePermission('shipping.write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateShippingMethodDto,
    @CurrentUser() user: AuthUser,
  ) {
    const method = await this.shippingRepository.findById(id, user.storeId!);
    if (!method) throw new Error('Shipping method not found');

    method.update(dto);
    await this.shippingRepository.update(method);
    return method;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('shipping.write')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.shippingRepository.delete(id, user.storeId!);
  }

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('order.read')
  async calculate(@Body() dto: CalculateRateDto, @CurrentUser() user: AuthUser) {
    return this.calculateRateUseCase.execute({
      storeId: user.storeId!,
      ...dto,
    });
  }
}
