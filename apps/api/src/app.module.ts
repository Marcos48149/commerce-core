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
import { PromotionModule } from './promotion/promotion.module';
import { WebhookModule } from './webhook/webhook.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { NotificationModule } from './notification/notification.module';
import { CustomerIdentityModule } from './customer-identity/customer-identity.module';
import { TenantStoreModule } from './tenant-store/tenant-store.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule, CommonModule, IamModule,
    CatalogModule, InventoryModule,
    CartModule, OrderModule, PaymentModule, ShippingModule,
    PromotionModule, WebhookModule, AuditLogModule, NotificationModule,
    CustomerIdentityModule, TenantStoreModule, DashboardModule,
  ],
})
export class AppModule {}
