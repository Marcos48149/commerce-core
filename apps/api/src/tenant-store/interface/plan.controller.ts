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
import { ManagePlansUseCase } from '../application/manage-plans.use-case';
import { CreatePlanDto, UpdatePlanDto } from './tenant-store.dto';

@ApiTags('Tenant Store / Plans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('plans')
export class PlanController {
  constructor(
    private readonly managePlans: ManagePlansUseCase,
  ) {}

  @Get()
  @RequirePermission('tenant.read')
  async list(@CurrentUser() user: AuthUser) {
    return this.managePlans.list(user.tenantId);
  }

  @Post()
  @RequirePermission('tenant.write')
  async create(@Body() dto: CreatePlanDto, @CurrentUser() user: AuthUser) {
    return this.managePlans.create({
      tenantId: user.tenantId,
      ...dto,
    });
  }

  @Get(':id')
  @RequirePermission('tenant.read')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.managePlans.getById(id, user.tenantId);
  }

  @Put(':id')
  @RequirePermission('tenant.write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.managePlans.update({
      id,
      tenantId: user.tenantId,
      ...dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('tenant.write')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.managePlans.delete(id, user.tenantId);
  }
}
