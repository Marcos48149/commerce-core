import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../iam/guards/permission.guard';
import { RequirePermission } from '../../iam/decorators/permission.decorator';
import { CurrentUser } from '../../iam/decorators/current-user.decorator';
import type { AuthUser } from '../../iam/services/permission-evaluator.service';
import { GetDashboardSummaryUseCase } from '../application/get-dashboard-summary.use-case';
import { DashboardRepository } from '../domain/dashboard.repository';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardSummary: GetDashboardSummaryUseCase,
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  @Get('summary')
  @RequirePermission('dashboard.read')
  async getSummary(@CurrentUser() user: AuthUser) {
    const summary = await this.getDashboardSummary.execute({
      storeId: user.storeId!,
    });
    const recentOrders = await this.dashboardRepository.getRecentOrders(user.storeId!, 10);
    return { summary, recentOrders };
  }
}
