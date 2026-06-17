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
import { ApiKeyService } from '../services/api-key.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from '../dto/api-key.dto';

@ApiTags('IAM / API Keys')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('iam/api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  @RequirePermission('admin.read')
  async list(@CurrentUser() user: AuthUser) {
    return this.apiKeyService.list(user.id);
  }

  @Post()
  @RequirePermission('admin.write')
  async create(@Body() dto: CreateApiKeyDto, @CurrentUser() user: AuthUser) {
    return this.apiKeyService.create(dto, user.id, user.tenantId, user.storeId);
  }

  @Put(':id')
  @RequirePermission('admin.write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateApiKeyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.apiKeyService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('admin.write')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.apiKeyService.delete(id, user.id);
  }
}
