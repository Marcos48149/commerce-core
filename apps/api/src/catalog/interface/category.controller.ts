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
import { CatalogRepository } from '../domain/catalog.repository';
import { ManageCategoriesUseCase } from '../application/manage-categories.use-case';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@ApiTags('Catalog / Categories')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('catalog/categories')
export class CategoryController {
  constructor(
    private readonly manageCategories: ManageCategoriesUseCase,
    private readonly catalogRepository: CatalogRepository,
  ) {}

  @Post()
  @RequirePermission('category.write')
  async create(@Body() dto: CreateCategoryDto, @CurrentUser() user: AuthUser) {
    return this.manageCategories.create({
      tenantId: user.tenantId,
      storeId: user.storeId!,
      ...dto,
    });
  }

  @Get()
  @RequirePermission('category.read')
  async list(@CurrentUser() user: AuthUser) {
    return this.catalogRepository.findCategoriesByStore(user.storeId!);
  }

  @Get(':id')
  @RequirePermission('category.read')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.catalogRepository.findCategoryById(id, user.storeId!);
  }

  @Put(':id')
  @RequirePermission('category.write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.manageCategories.update({
      id,
      storeId: user.storeId!,
      ...dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('category.write')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.manageCategories.delete(id, user.storeId!);
  }
}
