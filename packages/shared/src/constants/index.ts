export const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  PAID: 'PAID',
  REJECTED: 'REJECTED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PROMOTION_TYPE = {
  PRODUCT_FIXED: 'PRODUCT_FIXED',
  PRODUCT_PERCENTAGE: 'PRODUCT_PERCENTAGE',
  CATEGORY_DISCOUNT: 'CATEGORY_DISCOUNT',
  CART_PERCENTAGE: 'CART_PERCENTAGE',
  PAYMENT_METHOD_DISCOUNT: 'PAYMENT_METHOD_DISCOUNT',
  COUPON: 'COUPON',
  BXGY: 'BXGY',
  AUTOMATIC_GIFT: 'AUTOMATIC_GIFT',
} as const;

export type PromotionType = (typeof PROMOTION_TYPE)[keyof typeof PROMOTION_TYPE];

export const SCOPE = {
  PLATFORM: 'platform',
  STORE: 'store',
} as const;

export type Scope = (typeof SCOPE)[keyof typeof SCOPE];

export const PERMISSIONS = {
  // Tenant & Store
  TENANT_READ: 'tenant.read',
  TENANT_WRITE: 'tenant.write',
  STORE_READ: 'store.read',
  STORE_WRITE: 'store.write',

  // Backoffice IAM
  ADMIN_READ: 'admin.read',
  ADMIN_WRITE: 'admin.write',
  ROLE_READ: 'role.read',
  ROLE_WRITE: 'role.write',
  PERMISSION_READ: 'permission.read',

  // Customer
  CUSTOMER_READ: 'customer.read',
  CUSTOMER_WRITE: 'customer.write',

  // Catalog
  PRODUCT_READ: 'product.read',
  PRODUCT_WRITE: 'product.write',
  CATEGORY_READ: 'category.read',
  CATEGORY_WRITE: 'category.write',
  COLLECTION_READ: 'collection.read',
  COLLECTION_WRITE: 'collection.write',

  // Inventory
  STOCK_READ: 'stock.read',
  STOCK_WRITE: 'stock.write',

  // Orders
  ORDER_READ: 'order.read',
  ORDER_WRITE: 'order.write',

  // Promotions
  PROMOTION_READ: 'promotion.read',
  PROMOTION_WRITE: 'promotion.write',

  // Shipping
  SHIPPING_READ: 'shipping.read',
  SHIPPING_WRITE: 'shipping.write',

  // Payment
  PAYMENT_READ: 'payment.read',
  PAYMENT_WRITE: 'payment.write',

  // Webhook
  WEBHOOK_READ: 'webhook.read',
  WEBHOOK_WRITE: 'webhook.write',

  // Audit
  AUDIT_READ: 'audit.read',

  // Notification
  NOTIFICATION_READ: 'notification.read',
  NOTIFICATION_WRITE: 'notification.write',
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
