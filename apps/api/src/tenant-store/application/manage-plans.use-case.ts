import { Injectable, NotFoundException } from '@nestjs/common';
import { UlidService } from '../../common/ulid.service';
import { PlanRepository } from '../domain/plan.repository';
import { Plan } from '../domain/plan.entity';

export interface CreatePlanInput {
  tenantId: string;
  name: string;
  maxStores?: number;
  maxAdmins?: number;
  maxProducts?: number;
  maxWebhooks?: number;
  features?: Record<string, unknown>;
  monthlyPrice: number;
}

export interface UpdatePlanInput {
  id: string;
  tenantId: string;
  name?: string;
  maxStores?: number;
  maxAdmins?: number;
  maxProducts?: number;
  maxWebhooks?: number;
  features?: Record<string, unknown>;
  monthlyPrice?: number;
}

@Injectable()
export class ManagePlansUseCase {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly ulidService: UlidService,
  ) {}

  async list(tenantId: string) {
    const plans = await this.planRepository.findByTenant(tenantId);
    return plans.map((p) => this.toOutput(p));
  }

  async create(input: CreatePlanInput) {
    const plan = Plan.create({
      id: this.ulidService.generate(),
      ...input,
    });

    await this.planRepository.save(plan);
    return this.toOutput(plan);
  }

  async getById(id: string, tenantId: string) {
    const plan = await this.planRepository.findById(id, tenantId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return this.toOutput(plan);
  }

  async update(input: UpdatePlanInput) {
    const plan = await this.planRepository.findById(input.id, input.tenantId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    plan.update({
      name: input.name,
      maxStores: input.maxStores,
      maxAdmins: input.maxAdmins,
      maxProducts: input.maxProducts,
      maxWebhooks: input.maxWebhooks,
      features: input.features,
      monthlyPrice: input.monthlyPrice,
    });

    await this.planRepository.update(plan);
    return this.toOutput(plan);
  }

  async delete(id: string, tenantId: string) {
    const plan = await this.planRepository.findById(id, tenantId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    await this.planRepository.delete(id, tenantId);
  }

  private toOutput(plan: Plan) {
    return {
      id: plan.id,
      tenantId: plan.tenantId,
      name: plan.name,
      maxStores: plan.maxStores,
      maxAdmins: plan.maxAdmins,
      maxProducts: plan.maxProducts,
      maxWebhooks: plan.maxWebhooks,
      features: plan.features,
      monthlyPrice: plan.monthlyPrice,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
