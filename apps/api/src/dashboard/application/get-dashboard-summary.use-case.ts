import { Injectable } from '@nestjs/common';
import { DashboardRepository, DashboardSummary } from '../domain/dashboard.repository';

export interface GetDashboardSummaryInput {
  storeId: string;
}

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(input: GetDashboardSummaryInput): Promise<DashboardSummary> {
    return this.dashboardRepository.getSummary(input.storeId);
  }
}
