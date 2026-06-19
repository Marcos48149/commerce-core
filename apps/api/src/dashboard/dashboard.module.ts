import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { DashboardRepository } from './domain/dashboard.repository';
import { PrismaDashboardRepository } from './infrastructure/prisma-dashboard.repository';
import { GetDashboardSummaryUseCase } from './application/get-dashboard-summary.use-case';
import { DashboardController } from './interface/dashboard.controller';

@Module({
  imports: [IamModule],
  controllers: [DashboardController],
  providers: [
    { provide: DashboardRepository, useClass: PrismaDashboardRepository },
    GetDashboardSummaryUseCase,
  ],
  exports: [DashboardRepository],
})
export class DashboardModule {}
