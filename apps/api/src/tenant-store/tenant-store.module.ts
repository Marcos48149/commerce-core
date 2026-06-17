import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { TenantRepository } from './domain/tenant.repository';
import { StoreRepository } from './domain/store.repository';
import { PlanRepository } from './domain/plan.repository';
import { PrismaTenantRepository } from './infrastructure/prisma-tenant.repository';
import { PrismaStoreRepository } from './infrastructure/prisma-store.repository';
import { PrismaPlanRepository } from './infrastructure/prisma-plan.repository';
import { ManageTenantUseCase } from './application/manage-tenant.use-case';
import { ManageStoresUseCase } from './application/manage-stores.use-case';
import { ManagePlansUseCase } from './application/manage-plans.use-case';
import { TenantController } from './interface/tenant.controller';
import { StoreController } from './interface/store.controller';
import { PlanController } from './interface/plan.controller';

@Module({
  imports: [IamModule],
  controllers: [TenantController, StoreController, PlanController],
  providers: [
    { provide: TenantRepository, useClass: PrismaTenantRepository },
    { provide: StoreRepository, useClass: PrismaStoreRepository },
    { provide: PlanRepository, useClass: PrismaPlanRepository },
    ManageTenantUseCase,
    ManageStoresUseCase,
    ManagePlansUseCase,
  ],
})
export class TenantStoreModule {}
