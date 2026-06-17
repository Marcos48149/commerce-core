import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermission } from '../decorators/permission.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { AuthUser } from '../services/permission-evaluator.service';
import { RoleService } from '../services/role.service';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';

@ApiTags('IAM / Roles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('iam/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @RequirePermission('role.read')
  async list(@CurrentUser() user: AuthUser) {
    return this.roleService.list(user.tenantId);
  }

  @Post()
  @RequirePermission('role.write')
  async create(@Body() dto: CreateRoleDto, @CurrentUser() user: AuthUser) {
    return this.roleService.create(dto, user.tenantId);
  }

  @Get(':id')
  @RequirePermission('role.read')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.roleService.getById(id, user.tenantId);
  }

  @Put(':id')
  @RequirePermission('role.write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.roleService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('role.write')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.roleService.delete(id, user.tenantId);
  }
}
