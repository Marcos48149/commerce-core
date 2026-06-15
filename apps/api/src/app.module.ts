import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma.module';
import { CommonModule } from './common/common.module';
import { IamModule } from './iam/iam.module';
import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [PrismaModule, CommonModule, IamModule, CatalogModule, InventoryModule],
})
export class AppModule {}
