import { Injectable } from '@nestjs/common';
import { ShippingRepository } from '../domain/shipping.repository';

export interface CalculateRateInput {
  storeId: string;
  subtotal: number;
  country: string;
  province?: string;
}

export interface CalculatedRate {
  methodId: string;
  name: string;
  cost: number | null;
  type: string;
  estimatedDaysMin?: number | null;
  estimatedDaysMax?: number | null;
}

@Injectable()
export class CalculateRateUseCase {
  constructor(private readonly shippingRepository: ShippingRepository) {}

  async execute(input: CalculateRateInput): Promise<CalculatedRate[]> {
    const methods = await this.shippingRepository.findActiveByStore(input.storeId);
    const rates: CalculatedRate[] = [];

    for (const method of methods) {
      const cost = method.calculate(input.subtotal, input.country, input.province);
      if (cost !== null) {
        const zone = method.zones.find((z) => z.matches(input.country, input.province));
        rates.push({
          methodId: method.id,
          name: method.name,
          cost,
          type: method.type,
          estimatedDaysMin: zone?.estimatedDaysMin,
          estimatedDaysMax: zone?.estimatedDaysMax,
        });
      }
    }

    return rates;
  }
}
