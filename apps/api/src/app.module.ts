import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma.module';
import { CommonModule } from './common/common.module';
import { IamModule } from './iam/iam.module';
import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { ShippingModule } from './shipping/shipping.module';

@Module({
  imports: [
    PrismaModule, CommonModule, IamModule,
    CatalogModule, InventoryModule,
    CartModule, OrderModule, PaymentModule, ShippingModule,
  ],
})
export class AppModule {}
