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
import { AdminService } from '../services/admin.service';
import {
  CreateAdminDto, UpdateAdminDto, UpdateProfileDto, ChangePasswordDto, AssignRoleDto,
} from '../dto/admin.dto';

@ApiTags('IAM / Admins')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('iam')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.adminService.getProfile(user.id);
  }

  @Put('me')
  async updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser() user: AuthUser) {
    return this.adminService.updateProfile(user.id, dto);
  }

  @Put('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: AuthUser) {
    await this.adminService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }

  @Get('admins')
  @RequirePermission('admin.read')
  async list(@CurrentUser() user: AuthUser) {
    return this.adminService.list(user.tenantId);
  }

  @Post('admins')
  @RequirePermission('admin.write')
  async create(@Body() dto: CreateAdminDto, @CurrentUser() user: AuthUser) {
    return this.adminService.create(dto, user.tenantId, user.storeId);
  }

  @Get('admins/:id')
  @RequirePermission('admin.read')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.adminService.getById(id, user.tenantId);
  }

  @Put('admins/:id')
  @RequirePermission('admin.write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.adminService.update(id, dto, user.tenantId);
  }

  @Delete('admins/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('admin.write')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.adminService.softDelete(id, user.tenantId);
  }

  @Post('admins/:id/roles')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('admin.write')
  async assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() user: AuthUser,
  ) {
    await this.adminService.assignRole(id, dto.roleId, user.tenantId);
  }

  @Delete('admins/:id/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('admin.write')
  async removeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.adminService.removeRole(id, roleId, user.tenantId);
  }
}
