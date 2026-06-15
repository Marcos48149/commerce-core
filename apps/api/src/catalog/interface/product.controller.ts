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
import { CreateProductUseCase } from '../application/create-product.use-case';
import { UpdateProductUseCase } from '../application/update-product.use-case';
import { DeleteProductUseCase } from '../application/delete-product.use-case';
import { GetProductUseCase } from '../application/get-product.use-case';
import { ListProductsUseCase } from '../application/list-products.use-case';
import { ManageVariantsUseCase } from '../application/manage-variants.use-case';
import {
  CreateProductDto, UpdateProductDto,
  AddVariantDto, UpdateVariantDto, ProductQueryDto,
} from './product.dto';

@ApiTags('Catalog / Products')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('catalog/products')
export class ProductController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly manageVariants: ManageVariantsUseCase,
  ) {}

  @Post()
  @RequirePermission('product.write')
  async create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthUser) {
    return this.createProduct.execute({
      tenantId: user.tenantId,
      storeId: user.storeId!,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      metadata: dto.metadata,
    });
  }

  @Get()
  @RequirePermission('product.read')
  async list(@Query() query: ProductQueryDto, @CurrentUser() user: AuthUser) {
    return this.listProducts.execute({
      storeId: user.storeId!,
      filter: query,
    });
  }

  @Get(':id')
  @RequirePermission('product.read')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.getProduct.execute({
      id,
      storeId: user.storeId!,
      includeVariants: true,
    });
  }

  @Put(':id')
  @RequirePermission('product.write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.updateProduct.execute({
      id,
      storeId: user.storeId!,
      tenantId: user.tenantId,
      ...dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('product.write')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.deleteProduct.execute({ id, storeId: user.storeId!, tenantId: user.tenantId });
  }

  @Post(':productId/variants')
  @RequirePermission('product.write')
  async addVariant(
    @Param('productId') productId: string,
    @Body() dto: AddVariantDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.manageVariants.addVariant({
      productId,
      storeId: user.storeId!,
      tenantId: user.tenantId,
      ...dto,
    });
  }

  @Put(':productId/variants/:variantId')
  @RequirePermission('product.write')
  async updateVariant(
    @Param('productId') _productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.manageVariants.updateVariant({
      id: variantId,
      storeId: user.storeId!,
      ...dto,
    });
  }

  @Delete(':productId/variants/:variantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('product.write')
  async deleteVariant(
    @Param('productId') _productId: string,
    @Param('variantId') variantId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.manageVariants.deleteVariant(variantId, user.storeId!);
  }
}
