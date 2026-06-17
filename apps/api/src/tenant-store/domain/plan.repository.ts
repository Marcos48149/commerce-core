import { Injectable } from '@nestjs/common';
import { Plan } from './plan.entity';

@Injectable()
export abstract class PlanRepository {
  abstract findById(id: string, tenantId: string): Promise<Plan | null>;
  abstract findByTenant(tenantId: string): Promise<Plan[]>;
  abstract save(plan: Plan): Promise<void>;
  abstract update(plan: Plan): Promise<void>;
  abstract delete(id: string, tenantId: string): Promise<void>;
}
