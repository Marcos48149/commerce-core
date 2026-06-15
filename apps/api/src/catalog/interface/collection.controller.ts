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
import { ManageCollectionsUseCase } from '../application/manage-collections.use-case';
import { CreateCollectionDto, UpdateCollectionDto } from './collection.dto';

@ApiTags('Catalog / Collections')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('catalog/collections')
export class CollectionController {
  constructor(
    private readonly manageCollections: ManageCollectionsUseCase,
    private readonly catalogRepository: CatalogRepository,
  ) {}

  @Post()
  @RequirePermission('collection.write')
  async create(@Body() dto: CreateCollectionDto, @CurrentUser() user: AuthUser) {
    return this.manageCollections.create({
      tenantId: user.tenantId,
      storeId: user.storeId!,
      ...dto,
    });
  }

  @Get()
  @RequirePermission('collection.read')
  async list(@CurrentUser() user: AuthUser) {
    return this.catalogRepository.findCollectionsByStore(user.storeId!);
  }

  @Get(':id')
  @RequirePermission('collection.read')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.catalogRepository.findCollectionById(id, user.storeId!);
  }

  @Put(':id')
  @RequirePermission('collection.write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.manageCollections.update({
      id,
      storeId: user.storeId!,
      ...dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('collection.write')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.manageCollections.delete(id, user.storeId!);
  }
}
