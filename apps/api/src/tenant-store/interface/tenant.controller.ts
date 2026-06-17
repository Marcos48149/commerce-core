import {
  Controller, Get, Put,
  Body, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../iam/guards/permission.guard';
import { RequirePermission } from '../../iam/decorators/permission.decorator';
import { CurrentUser } from '../../iam/decorators/current-user.decorator';
import type { AuthUser } from '../../iam/services/permission-evaluator.service';
import { ManageTenantUseCase } from '../application/manage-tenant.use-case';
import { UpdateTenantDto } from './tenant-store.dto';

@ApiTags('Tenant Store / Tenant')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('tenant')
export class TenantController {
  constructor(
    private readonly manageTenant: ManageTenantUseCase,
  ) {}

  @Get()
  @RequirePermission('tenant.read')
  async get(@CurrentUser() user: AuthUser) {
    return this.manageTenant.get(user.tenantId);
  }

  @Put()
  @RequirePermission('tenant.write')
  async update(@Body() dto: UpdateTenantDto, @CurrentUser() user: AuthUser) {
    return this.manageTenant.update(user.tenantId, dto);
  }
}
