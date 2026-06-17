import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../iam/guards/permission.guard';
import { RequirePermission } from '../../iam/decorators/permission.decorator';
import { CurrentUser } from '../../iam/decorators/current-user.decorator';
import type { AuthUser } from '../../iam/services/permission-evaluator.service';
import { ManageStoresUseCase } from '../application/manage-stores.use-case';
import { CreateStoreDto, UpdateStoreDto } from './tenant-store.dto';

@ApiTags('Tenant Store / Stores')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('stores')
export class StoreController {
  constructor(
    private readonly manageStores: ManageStoresUseCase,
  ) {}

  @Get()
  @RequirePermission('store.read')
  async list(@CurrentUser() user: AuthUser) {
    return this.manageStores.list(user.tenantId);
  }

  @Post()
  @RequirePermission('store.write')
  async create(@Body() dto: CreateStoreDto, @CurrentUser() user: AuthUser) {
    return this.manageStores.create({
      tenantId: user.tenantId,
      ...dto,
    });
  }

  @Get(':id')
  @RequirePermission('store.read')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.manageStores.getById(id, user.tenantId);
  }

  @Put(':id')
  @RequirePermission('store.write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.manageStores.update({
      id,
      tenantId: user.tenantId,
      ...dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('store.write')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.manageStores.delete(id, user.tenantId);
  }
}
