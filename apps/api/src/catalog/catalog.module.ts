import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { InventoryModule } from '../inventory/inventory.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { CatalogRepository } from './domain/catalog.repository';
import { PrismaCatalogRepository } from './infrastructure/prisma-catalog.repository';
import { CreateProductUseCase } from './application/create-product.use-case';
import { UpdateProductUseCase } from './application/update-product.use-case';
import { DeleteProductUseCase } from './application/delete-product.use-case';
import { GetProductUseCase } from './application/get-product.use-case';
import { ListProductsUseCase } from './application/list-products.use-case';
import { ManageVariantsUseCase } from './application/manage-variants.use-case';
import { ManageCategoriesUseCase } from './application/manage-categories.use-case';
import { ManageCollectionsUseCase } from './application/manage-collections.use-case';
import { ProductController } from './interface/product.controller';
import { CategoryController } from './interface/category.controller';
import { CollectionController } from './interface/collection.controller';

@Module({
  imports: [IamModule, InventoryModule, AuditLogModule],
  controllers: [ProductController, CategoryController, CollectionController],
  providers: [
    { provide: CatalogRepository, useClass: PrismaCatalogRepository },
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    ListProductsUseCase,
    ManageVariantsUseCase,
    ManageCategoriesUseCase,
    ManageCollectionsUseCase,
  ],
  exports: [CatalogRepository],
})
export class CatalogModule {}
