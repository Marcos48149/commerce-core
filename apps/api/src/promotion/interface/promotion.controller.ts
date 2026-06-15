import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../iam/guards/permission.guard';
import { RequirePermission } from '../../iam/decorators/permission.decorator';
import { CurrentUser } from '../../iam/decorators/current-user.decorator';
import type { AuthUser } from '../../iam/services/permission-evaluator.service';
import { ManagePromotionsUseCase } from '../application/manage-promotions.use-case';
import { ValidateCouponUseCase } from '../application/validate-coupon.use-case';
import {
  CreatePromotionDto, UpdatePromotionDto, PromotionQueryDto,
  AddCouponDto, CouponQueryDto,
} from './promotion.dto';

@ApiTags('Promotions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller()
export class PromotionController {
  constructor(
    private readonly managePromotions: ManagePromotionsUseCase,
    private readonly validateCoupon: ValidateCouponUseCase,
  ) {}

  @Post('promotions')
  @RequirePermission('promotion.write')
  async create(@Body() dto: CreatePromotionDto, @CurrentUser() user: AuthUser) {
    return this.managePromotions.create({
      tenantId: user.tenantId,
      storeId: user.storeId!,
      name: dto.name,
      type: dto.type,
      config: (dto.config ?? {}) as any,
      startsAt: new Date(dto.startsAt),
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      minQuantity: dto.minQuantity,
      minCartAmount: dto.minCartAmount,
      targetProductId: dto.targetProductId,
      targetCategoryId: dto.targetCategoryId,
      targetPaymentMethod: dto.targetPaymentMethod,
      maxUsage: dto.maxUsage,
      priority: dto.priority,
    });
  }

  @Get('promotions')
  @RequirePermission('promotion.read')
  async list(@Query() query: PromotionQueryDto, @CurrentUser() user: AuthUser) {
    return this.managePromotions.findByStore(user.storeId!, query);
  }

  @Get('promotions/:id')
  @RequirePermission('promotion.read')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.managePromotions.findById(id, user.storeId!);
  }

  @Put('promotions/:id')
  @RequirePermission('promotion.write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.managePromotions.update({
      id,
      storeId: user.storeId!,
      ...dto,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
    });
  }

  @Delete('promotions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('promotion.write')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.managePromotions.delete(id, user.storeId!);
  }

  @Post('promotions/:promotionId/coupons')
  @RequirePermission('promotion.write')
  async addCoupon(
    @Param('promotionId') promotionId: string,
    @Body() dto: AddCouponDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.managePromotions.addCoupon({
      promotionId,
      tenantId: user.tenantId,
      storeId: user.storeId!,
      code: dto.code,
      maxUsage: dto.maxUsage,
      maxPerCustomer: dto.maxPerCustomer,
    });
  }

  @Get('promotions/:promotionId/coupons')
  @RequirePermission('promotion.read')
  async listCoupons(
    @Param('promotionId') promotionId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.managePromotions.listCoupons(promotionId, user.storeId!);
  }

  @Delete('promotions/:promotionId/coupons/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('promotion.write')
  async deleteCoupon(
    @Param('promotionId') _promotionId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.managePromotions.deleteCoupon(id, user.storeId!);
  }

  @Post('coupons/validate')
  @RequirePermission('promotion.read')
  async validateCouponEndpoint(
    @Body() dto: CouponQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.validateCoupon.execute({
      code: dto.code,
      storeId: user.storeId!,
    });
  }
}
