import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { ShippingRepository } from './domain/shipping.repository';
import { PrismaShippingRepository } from './infrastructure/prisma-shipping.repository';
import { CalculateRateUseCase } from './application/calculate-rate.use-case';
import { ShippingController } from './interface/shipping.controller';

@Module({
  imports: [IamModule],
  controllers: [ShippingController],
  providers: [
    { provide: ShippingRepository, useClass: PrismaShippingRepository },
    CalculateRateUseCase,
  ],
  exports: [ShippingRepository, CalculateRateUseCase],
})
export class ShippingModule {}
