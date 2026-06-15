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
import { AddItemUseCase } from '../application/add-item.use-case';
import { UpdateItemUseCase } from '../application/update-item.use-case';
import { RemoveItemUseCase } from '../application/remove-item.use-case';
import { ApplyCouponUseCase } from '../application/apply-coupon.use-case';
import { CalculateShippingUseCase } from '../application/calculate-shipping.use-case';
import { InitiateCheckoutUseCase } from '../application/initiate-checkout.use-case';
import { MergeCartUseCase } from '../application/merge-cart.use-case';
import { CartRepository } from '../domain/cart.repository';
import {
  AddItemDto, UpdateItemDto, RemoveItemDto,
  ApplyCouponDto, CalculateShippingDto, InitiateCheckoutDto,
} from './cart.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(
    private readonly addItemUseCase: AddItemUseCase,
    private readonly updateItemUseCase: UpdateItemUseCase,
    private readonly removeItemUseCase: RemoveItemUseCase,
    private readonly applyCouponUseCase: ApplyCouponUseCase,
    private readonly calculateShippingUseCase: CalculateShippingUseCase,
    private readonly initiateCheckoutUseCase: InitiateCheckoutUseCase,
    private readonly mergeCartUseCase: MergeCartUseCase,
    private readonly cartRepository: CartRepository,
  ) {}

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Get()
  @RequirePermission('order.read')
  async getCart(@CurrentUser() user: AuthUser) {
    const cart = await this.cartRepository.findByCustomer(user.id, user.storeId!);
    return cart ?? { items: [] };
  }

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Post('items')
  @RequirePermission('order.write')
  async addItem(@Body() dto: AddItemDto, @CurrentUser() user: AuthUser) {
    return this.addItemUseCase.execute({
      tenantId: user.tenantId,
      storeId: user.storeId!,
      customerId: user.id,
      ...dto,
    });
  }

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Put('items')
  @RequirePermission('order.write')
  async updateItem(@Body() dto: UpdateItemDto, @CurrentUser() user: AuthUser) {
    return this.updateItemUseCase.execute({
      storeId: user.storeId!,
      customerId: user.id,
      ...dto,
    });
  }

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Delete('items')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('order.write')
  async removeItem(@Body() dto: RemoveItemDto, @CurrentUser() user: AuthUser) {
    return this.removeItemUseCase.execute({
      storeId: user.storeId!,
      customerId: user.id,
      ...dto,
    });
  }

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Post('coupon')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('order.write')
  async applyCoupon(@Body() dto: ApplyCouponDto, @CurrentUser() user: AuthUser) {
    return this.applyCouponUseCase.execute({
      storeId: user.storeId!,
      customerId: user.id,
      ...dto,
    });
  }

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Post('shipping')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('order.write')
  async calculateShipping(@Body() dto: CalculateShippingDto, @CurrentUser() user: AuthUser) {
    return this.calculateShippingUseCase.execute({
      storeId: user.storeId!,
      customerId: user.id,
      ...dto,
    });
  }

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('order.write')
  async checkout(@Body() dto: InitiateCheckoutDto, @CurrentUser() user: AuthUser) {
    return this.initiateCheckoutUseCase.execute({
      tenantId: user.tenantId,
      storeId: user.storeId!,
      customerId: user.id,
      ...dto,
    });
  }

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('order.write')
  async mergeCart(@CurrentUser() user: AuthUser) {
    return this.mergeCartUseCase.execute({
      tenantId: user.tenantId,
      storeId: user.storeId!,
      customerId: user.id,
      guestToken: (user as any).guestToken ?? '',
    });
  }
}
