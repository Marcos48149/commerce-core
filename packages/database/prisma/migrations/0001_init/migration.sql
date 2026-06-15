-- CommerceCore MVP — Initial Migration
-- Creates all 13 context schemas, ULID generator, enums, indexes, and RLS policies

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ULID generator function (26-char, sortable, distributed-safe)
CREATE OR REPLACE FUNCTION gen_random_ulid() RETURNS varchar(26) AS $$
DECLARE
  -- Crockford base32 encoding
  encoding  TEXT := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  timestamp BYTEA;
  randomness BYTEA;
  ulid TEXT := '';
  i INT;
  val INT;
BEGIN
  timestamp := E'\\x' || to_hex(EXTRACT(EPOCH FROM clock_timestamp()) * 1000::bigint);
  randomness := gen_random_bytes(16);

  -- Encode timestamp (48 bits → 10 chars)
  val := (get_byte(timestamp, 0)::int << 16) | (get_byte(timestamp, 1)::int << 8) | get_byte(timestamp, 2)::int;
  FOR i IN 0..3 LOOP
    ulid := ulid || substr(encoding, (val >> (27 - i * 5)) & 31 + 1, 1);
  END LOOP;
  val := ((get_byte(timestamp, 2)::int & 7) << 24) | (get_byte(timestamp, 3)::int << 16) | (get_byte(timestamp, 4)::int << 8) | get_byte(timestamp, 5)::int;
  FOR i IN 0..5 LOOP
    ulid := ulid || substr(encoding, (val >> (28 - i * 5)) & 31 + 1, 1);
  END LOOP;

  -- Encode randomness (128 bits → 16 chars)
  val := (get_byte(randomness, 0)::int << 8) | get_byte(randomness, 1)::int;
  FOR i IN 0..1 LOOP
    ulid := ulid || substr(encoding, (val >> (13 - i * 5)) & 31 + 1, 1);
  END LOOP;
  val := ((get_byte(randomness, 1)::int & 3) << 24) | (get_byte(randomness, 2)::int << 16) | (get_byte(randomness, 3)::int << 8) | get_byte(randomness, 4)::int;
  FOR i IN 0..4 LOOP
    ulid := ulid || substr(encoding, (val >> (28 - i * 5)) & 31 + 1, 1);
  END LOOP;
  val := ((get_byte(randomness, 4)::int & 31) << 16) | (get_byte(randomness, 5)::int << 8) | get_byte(randomness, 6)::int;
  FOR i IN 0..2 LOOP
    ulid := ulid || substr(encoding, (val >> (22 - i * 5)) & 31 + 1, 1);
  END LOOP;
  val := ((get_byte(randomness, 6)::int & 7) << 16) | (get_byte(randomness, 7)::int << 8) | get_byte(randomness, 8)::int;
  FOR i IN 0..2 LOOP
    ulid := ulid || substr(encoding, (val >> (22 - i * 5)) & 31 + 1, 1);
  END LOOP;
  val := ((get_byte(randomness, 8)::int & 3) << 24) | (get_byte(randomness, 9)::int << 16) | (get_byte(randomness, 10)::int << 8) | get_byte(randomness, 11)::int;
  FOR i IN 0..4 LOOP
    ulid := ulid || substr(encoding, (val >> (28 - i * 5)) & 31 + 1, 1);
  END LOOP;
  val := ((get_byte(randomness, 11)::int & 15) << 16) | (get_byte(randomness, 12)::int << 8) | get_byte(randomness, 13)::int;
  FOR i IN 0..2 LOOP
    ulid := ulid || substr(encoding, (val >> (22 - i * 5)) & 31 + 1, 1);
  END LOOP;
  val := ((get_byte(randomness, 13)::int & 127) << 8) | get_byte(randomness, 14)::int;
  FOR i IN 0..1 LOOP
    ulid := ulid || substr(encoding, (val >> (13 - i * 5)) & 31 + 1, 1);
  END LOOP;

  RETURN ulid;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING','AUTHORIZED','PAID','REJECTED','REFUNDED','CANCELLED');
CREATE TYPE "PromotionType" AS ENUM ('PRODUCT_FIXED','PRODUCT_PERCENTAGE','CATEGORY_DISCOUNT','CART_PERCENTAGE','PAYMENT_METHOD_DISCOUNT','COUPON','BXGY','AUTOMATIC_GIFT');
CREATE TYPE "WebhookEvent" AS ENUM ('order_created','order_paid','order_cancelled','order_updated','inventory_updated','customer_created');

-- RLS helper: set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id varchar(26), p_store_id varchar(26) DEFAULT NULL)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.tenant_id', p_tenant_id, false);
  IF p_store_id IS NOT NULL THEN
    PERFORM set_config('app.store_id', p_store_id, false);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ─── CREATE TABLES ───────────────────────────────────────────────────────────

CREATE TABLE "Tenant" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Tenant_pkey" PRIMARY KEY (id),
    CONSTRAINT "Tenant_slug_key" UNIQUE (slug)
);

CREATE TABLE "Plan" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    name VARCHAR(100) NOT NULL,
    "maxStores" INTEGER NOT NULL DEFAULT 1,
    "maxAdmins" INTEGER NOT NULL DEFAULT 10,
    "maxProducts" INTEGER NOT NULL DEFAULT 1000,
    "maxWebhooks" INTEGER NOT NULL DEFAULT 10,
    features JSONB NOT NULL DEFAULT '{}',
    "monthlyPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Plan_pkey" PRIMARY KEY (id)
);

CREATE TABLE "Store" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "planId" VARCHAR(26),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
    "displayName" VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    "logoUrl" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    settings JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Store_pkey" PRIMARY KEY (id),
    CONSTRAINT "Store_tenantId_slug_key" UNIQUE ("tenantId", slug)
);

CREATE TABLE "Admin" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26),
    email VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(255) NOT NULL,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMPTZ,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Admin_pkey" PRIMARY KEY (id),
    CONSTRAINT "Admin_email_key" UNIQUE (email)
);

CREATE TABLE "ApiKey" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26),
    "adminId" VARCHAR(26) NOT NULL,
    name VARCHAR(100) NOT NULL,
    prefix VARCHAR(8) NOT NULL,
    hash VARCHAR(255) NOT NULL,
    scopes JSONB NOT NULL DEFAULT '[]',
    "lastUsedAt" TIMESTAMPTZ,
    "expiresAt" TIMESTAMPTZ,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "ApiKey_pkey" PRIMARY KEY (id),
    CONSTRAINT "ApiKey_prefix_hash_key" UNIQUE (prefix, hash)
);

CREATE TABLE "Role" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    name VARCHAR(100) NOT NULL,
    scope VARCHAR(20) NOT NULL DEFAULT 'store',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Role_pkey" PRIMARY KEY (id),
    CONSTRAINT "Role_tenantId_name_key" UNIQUE ("tenantId", name)
);

CREATE TABLE "Permission" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    "group" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Permission_pkey" PRIMARY KEY (id),
    CONSTRAINT "Permission_name_key" UNIQUE (name)
);

CREATE TABLE "AdminRole" (
    "adminId" VARCHAR(26) NOT NULL,
    "roleId" VARCHAR(26) NOT NULL,
    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("adminId", "roleId")
);

CREATE TABLE "RolePermission" (
    "roleId" VARCHAR(26) NOT NULL,
    "permissionId" VARCHAR(26) NOT NULL,
    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId")
);

CREATE TABLE "Customer" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    email VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(255),
    phone VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "refreshToken" TEXT,
    "lastLoginAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Customer_pkey" PRIMARY KEY (id),
    CONSTRAINT "Customer_storeId_email_key" UNIQUE ("storeId", email)
);

CREATE TABLE "Address" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "customerId" VARCHAR(26) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'shipping',
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20) NOT NULL,
    country VARCHAR(2) NOT NULL DEFAULT 'AR',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Address_pkey" PRIMARY KEY (id)
);

CREATE TABLE "Product" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Product_pkey" PRIMARY KEY (id),
    CONSTRAINT "Product_storeId_slug_key" UNIQUE ("storeId", slug)
);

CREATE TABLE "Variant" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "productId" VARCHAR(26) NOT NULL,
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
    "compareAtPrice" DECIMAL(12,2),
    "costPrice" DECIMAL(12,2),
    weight DECIMAL(8,2),
    "weightUnit" VARCHAR(5) DEFAULT 'g',
    dimensions JSONB DEFAULT '{}',
    barcode VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Variant_pkey" PRIMARY KEY (id),
    CONSTRAINT "Variant_storeId_sku_key" UNIQUE ("storeId", sku)
);

CREATE TABLE "Category" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    "parentId" VARCHAR(26),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    "imageUrl" VARCHAR(500),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Category_pkey" PRIMARY KEY (id),
    CONSTRAINT "Category_storeId_slug_key" UNIQUE ("storeId", slug)
);

CREATE TABLE "ProductCategory" (
    "productId" VARCHAR(26) NOT NULL,
    "categoryId" VARCHAR(26) NOT NULL,
    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("productId", "categoryId")
);

CREATE TABLE "Collection" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    "imageUrl" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Collection_pkey" PRIMARY KEY (id),
    CONSTRAINT "Collection_storeId_slug_key" UNIQUE ("storeId", slug)
);

CREATE TABLE "ProductCollection" (
    "productId" VARCHAR(26) NOT NULL,
    "collectionId" VARCHAR(26) NOT NULL,
    CONSTRAINT "ProductCollection_pkey" PRIMARY KEY ("productId", "collectionId")
);

CREATE TABLE "Stock" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "variantId" VARCHAR(26) NOT NULL,
    "productId" VARCHAR(26) NOT NULL,
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    available INTEGER NOT NULL DEFAULT 0,
    reserved INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER DEFAULT 5,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Stock_pkey" PRIMARY KEY (id),
    CONSTRAINT "Stock_variantId_storeId_key" UNIQUE ("variantId", "storeId")
);

CREATE TABLE "StockAdjustment" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "stockId" VARCHAR(26) NOT NULL,
    "variantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    "referenceId" VARCHAR(26),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY (id)
);

CREATE TABLE "Cart" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    "customerId" VARCHAR(26),
    "guestToken" VARCHAR(255),
    "couponCode" VARCHAR(100),
    currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cart_pkey" PRIMARY KEY (id),
    CONSTRAINT "Cart_storeId_guestToken_key" UNIQUE ("storeId", "guestToken"),
    CONSTRAINT "Cart_storeId_customerId_key" UNIQUE ("storeId", "customerId")
);

CREATE TABLE "CartItem" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "cartId" VARCHAR(26) NOT NULL,
    "variantId" VARCHAR(26) NOT NULL,
    "productId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CartItem_pkey" PRIMARY KEY (id)
);

CREATE TABLE "Order" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    "customerId" VARCHAR(26),
    "orderNumber" INTEGER NOT NULL,
    status "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
    subtotal DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    "couponCode" VARCHAR(100),
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    snapshot JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_pkey" PRIMARY KEY (id),
    CONSTRAINT "Order_storeId_orderNumber_key" UNIQUE ("storeId", "orderNumber")
);

CREATE TABLE "OrderItem" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "orderId" VARCHAR(26) NOT NULL,
    "variantId" VARCHAR(26) NOT NULL,
    "productId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "variantName" VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id)
);

CREATE TABLE "PaymentProvider" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    config JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "PaymentProvider_pkey" PRIMARY KEY (id),
    CONSTRAINT "PaymentProvider_storeId_code_key" UNIQUE ("storeId", code)
);

CREATE TABLE "PaymentSession" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "orderId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    "providerId" VARCHAR(26) NOT NULL,
    "providerSessionId" VARCHAR(255),
    status "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
    "idempotencyKey" VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentSession_pkey" PRIMARY KEY (id),
    CONSTRAINT "PaymentSession_idempotencyKey_key" UNIQUE ("idempotencyKey")
);

CREATE TABLE "ShippingMethod" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    cost DECIMAL(12,2),
    "freeOver" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "ShippingMethod_pkey" PRIMARY KEY (id)
);

CREATE TABLE "ShippingZone" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "shippingMethodId" VARCHAR(26) NOT NULL,
    name VARCHAR(255) NOT NULL,
    countries VARCHAR(2)[] NOT NULL,
    provinces VARCHAR(100)[] NOT NULL,
    "postalCodes" VARCHAR(500),
    cost DECIMAL(12,2),
    "freeOver" DECIMAL(12,2),
    "estimatedDaysMin" INTEGER,
    "estimatedDaysMax" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShippingZone_pkey" PRIMARY KEY (id)
);

CREATE TABLE "Promotion" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type "PromotionType" NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    "startsAt" TIMESTAMPTZ NOT NULL,
    "endsAt" TIMESTAMPTZ,
    "minQuantity" INTEGER,
    "minCartAmount" DECIMAL(12,2),
    "targetProductId" VARCHAR(26),
    "targetCategoryId" VARCHAR(26),
    "targetPaymentMethod" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUsage" INTEGER,
    "currentUsage" INTEGER NOT NULL DEFAULT 0,
    priority INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Promotion_pkey" PRIMARY KEY (id)
);

CREATE TABLE "Coupon" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "promotionId" VARCHAR(26) NOT NULL,
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    code VARCHAR(100) NOT NULL,
    "maxUsage" INTEGER,
    "currentUsage" INTEGER NOT NULL DEFAULT 0,
    "maxPerCustomer" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "Coupon_pkey" PRIMARY KEY (id),
    CONSTRAINT "Coupon_storeId_code_key" UNIQUE ("storeId", code)
);

CREATE TABLE "PromotionUsage" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "promotionId" VARCHAR(26) NOT NULL,
    "couponId" VARCHAR(26),
    "orderId" VARCHAR(26),
    "customerId" VARCHAR(26),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    discount DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromotionUsage_pkey" PRIMARY KEY (id)
);

CREATE TABLE "AuditLog" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26),
    "adminId" VARCHAR(26),
    "customerId" VARCHAR(26),
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(26) NOT NULL,
    action VARCHAR(100) NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id)
);

CREATE TABLE "WebhookEndpoint" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    url VARCHAR(500) NOT NULL,
    secret VARCHAR(255) NOT NULL,
    events "WebhookEvent"[] NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "retryCount" INTEGER NOT NULL DEFAULT 3,
    "timeoutMs" INTEGER NOT NULL DEFAULT 5000,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY (id)
);

CREATE TABLE "WebhookDelivery" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "endpointId" VARCHAR(26) NOT NULL,
    "eventId" VARCHAR(26) NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response JSONB,
    "statusCode" INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    attempt INTEGER NOT NULL DEFAULT 1,
    "durationMs" INTEGER,
    error TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY (id)
);

CREATE TABLE "NotificationTemplate" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    type VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY (id),
    CONSTRAINT "NotificationTemplate_storeId_type_key" UNIQUE ("storeId", type)
);

CREATE TABLE "NotificationLog" (
    id VARCHAR(26) NOT NULL DEFAULT gen_random_ulid(),
    "tenantId" VARCHAR(26) NOT NULL,
    "storeId" VARCHAR(26) NOT NULL,
    "templateId" VARCHAR(26),
    "to" VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    error TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY (id)
);

-- ─── FOREIGN KEYS ────────────────────────────────────────────────────────────

ALTER TABLE "Plan" ADD CONSTRAINT "Plan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id);
ALTER TABLE "Store" ADD CONSTRAINT "Store_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id);
ALTER TABLE "Store" ADD CONSTRAINT "Store_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"(id);
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id);
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"(id);
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"(id) ON DELETE CASCADE;
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id);
ALTER TABLE "AdminRole" ADD CONSTRAINT "AdminRole_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"(id) ON DELETE CASCADE;
ALTER TABLE "AdminRole" ADD CONSTRAINT "AdminRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"(id) ON DELETE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"(id) ON DELETE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"(id) ON DELETE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"(id);
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"(id) ON DELETE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"(id);
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"(id);
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE;
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"(id) ON DELETE CASCADE;
ALTER TABLE "ProductCollection" ADD CONSTRAINT "ProductCollection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE;
ALTER TABLE "ProductCollection" ADD CONSTRAINT "ProductCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"(id) ON DELETE CASCADE;
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"(id) ON DELETE CASCADE;
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE;
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"(id) ON DELETE CASCADE;
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"(id);
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"(id);
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"(id) ON DELETE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"(id);
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"(id);
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"(id) ON DELETE CASCADE;
ALTER TABLE "PaymentProvider" ADD CONSTRAINT "PaymentProvider_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"(id);
ALTER TABLE "PaymentSession" ADD CONSTRAINT "PaymentSession_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"(id);
ALTER TABLE "PaymentSession" ADD CONSTRAINT "PaymentSession_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "PaymentProvider"(id);
ALTER TABLE "ShippingZone" ADD CONSTRAINT "ShippingZone_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES "ShippingMethod"(id) ON DELETE CASCADE;
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"(id) ON DELETE CASCADE;
ALTER TABLE "PromotionUsage" ADD CONSTRAINT "PromotionUsage_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"(id) ON DELETE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id);
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"(id);
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"(id);
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id);
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"(id);
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "WebhookEndpoint"(id) ON DELETE CASCADE;
ALTER TABLE "NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"(id);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX "Plan_tenantId_idx" ON "Plan"("tenantId");
CREATE INDEX "Store_tenantId_idx" ON "Store"("tenantId");
CREATE INDEX "Admin_tenantId_idx" ON "Admin"("tenantId");
CREATE INDEX "Admin_storeId_idx" ON "Admin"("storeId");
CREATE INDEX "ApiKey_tenantId_idx" ON "ApiKey"("tenantId");
CREATE INDEX "ApiKey_storeId_idx" ON "ApiKey"("storeId");
CREATE INDEX "ApiKey_adminId_idx" ON "ApiKey"("adminId");
CREATE INDEX "ApiKey_prefix_idx" ON "ApiKey"(prefix);
CREATE INDEX "Role_tenantId_idx" ON "Role"("tenantId");
CREATE INDEX "Customer_tenantId_idx" ON "Customer"("tenantId");
CREATE INDEX "Customer_storeId_idx" ON "Customer"("storeId");
CREATE INDEX "Address_customerId_idx" ON "Address"("customerId");
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");
CREATE INDEX "Variant_tenantId_idx" ON "Variant"("tenantId");
CREATE INDEX "Variant_storeId_idx" ON "Variant"("storeId");
CREATE INDEX "Variant_productId_idx" ON "Variant"("productId");
CREATE INDEX "Category_tenantId_idx" ON "Category"("tenantId");
CREATE INDEX "Category_storeId_idx" ON "Category"("storeId");
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX "Collection_tenantId_idx" ON "Collection"("tenantId");
CREATE INDEX "Collection_storeId_idx" ON "Collection"("storeId");
CREATE INDEX "Stock_tenantId_idx" ON "Stock"("tenantId");
CREATE INDEX "Stock_storeId_idx" ON "Stock"("storeId");
CREATE INDEX "Stock_productId_idx" ON "Stock"("productId");
CREATE INDEX "StockAdjustment_stockId_idx" ON "StockAdjustment"("stockId");
CREATE INDEX "StockAdjustment_variantId_idx" ON "StockAdjustment"("variantId");
CREATE INDEX "StockAdjustment_storeId_idx" ON "StockAdjustment"("storeId");
CREATE INDEX "Cart_tenantId_idx" ON "Cart"("tenantId");
CREATE INDEX "Cart_storeId_idx" ON "Cart"("storeId");
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");
CREATE INDEX "CartItem_variantId_idx" ON "CartItem"("variantId");
CREATE INDEX "Order_tenantId_idx" ON "Order"("tenantId");
CREATE INDEX "Order_storeId_idx" ON "Order"("storeId");
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "PaymentProvider_tenantId_idx" ON "PaymentProvider"("tenantId");
CREATE INDEX "PaymentProvider_storeId_idx" ON "PaymentProvider"("storeId");
CREATE INDEX "PaymentSession_orderId_idx" ON "PaymentSession"("orderId");
CREATE INDEX "PaymentSession_storeId_idx" ON "PaymentSession"("storeId");
CREATE INDEX "ShippingMethod_tenantId_idx" ON "ShippingMethod"("tenantId");
CREATE INDEX "ShippingMethod_storeId_idx" ON "ShippingMethod"("storeId");
CREATE INDEX "ShippingZone_shippingMethodId_idx" ON "ShippingZone"("shippingMethodId");
CREATE INDEX "Promotion_tenantId_idx" ON "Promotion"("tenantId");
CREATE INDEX "Promotion_storeId_idx" ON "Promotion"("storeId");
CREATE INDEX "Promotion_type_idx" ON "Promotion"("type");
CREATE INDEX "Coupon_tenantId_idx" ON "Coupon"("tenantId");
CREATE INDEX "Coupon_storeId_idx" ON "Coupon"("storeId");
CREATE INDEX "PromotionUsage_promotionId_idx" ON "PromotionUsage"("promotionId");
CREATE INDEX "PromotionUsage_storeId_idx" ON "PromotionUsage"("storeId");
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");
CREATE INDEX "AuditLog_storeId_idx" ON "AuditLog"("storeId");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "WebhookEndpoint_tenantId_idx" ON "WebhookEndpoint"("tenantId");
CREATE INDEX "WebhookEndpoint_storeId_idx" ON "WebhookEndpoint"("storeId");
CREATE INDEX "WebhookDelivery_endpointId_idx" ON "WebhookDelivery"("endpointId");
CREATE INDEX "WebhookDelivery_eventId_idx" ON "WebhookDelivery"("eventId");
CREATE INDEX "WebhookDelivery_status_idx" ON "WebhookDelivery"("status");
CREATE INDEX "NotificationTemplate_tenantId_idx" ON "NotificationTemplate"("tenantId");
CREATE INDEX "NotificationTemplate_storeId_idx" ON "NotificationTemplate"("storeId");
CREATE INDEX "NotificationLog_tenantId_idx" ON "NotificationLog"("tenantId");
CREATE INDEX "NotificationLog_storeId_idx" ON "NotificationLog"("storeId");
CREATE INDEX "NotificationLog_type_idx" ON "NotificationLog"("type");
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");

-- ─── RLS POLICIES ────────────────────────────────────────────────────────────

-- Enable RLS on all store-scoped tables
ALTER TABLE "Store" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Variant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Collection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductCollection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockAdjustment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentProvider" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShippingMethod" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShippingZone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Promotion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Coupon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PromotionUsage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebhookEndpoint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebhookDelivery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationLog" ENABLE ROW LEVEL SECURITY;

-- RLS helper: returns true if the user is a SuperAdmin (platform-level access)
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('app.is_super_admin', true) = 'true';
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS helper: current tenant from session context
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS VARCHAR(26) AS $$
BEGIN
  RETURN current_setting('app.tenant_id', true);
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS helper: current store from session context
CREATE OR REPLACE FUNCTION current_store_id() RETURNS VARCHAR(26) AS $$
BEGIN
  RETURN current_setting('app.store_id', true);
END;
$$ LANGUAGE plpgsql STABLE;

-- Store-scoped tables: users can only access data for their tenant and store
CREATE POLICY tenant_isolation ON "Store" FOR ALL
  USING ("tenantId" = current_tenant_id() OR is_super_admin());

CREATE POLICY tenant_isolation ON "ApiKey" FOR ALL
  USING ("tenantId" = current_tenant_id() OR is_super_admin());

CREATE POLICY tenant_isolation ON "Admin" FOR ALL
  USING ("tenantId" = current_tenant_id() OR is_super_admin());

CREATE POLICY tenant_store_isolation ON "Customer" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "Address" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Customer" c
      WHERE c.id = "Address"."customerId"
      AND c."tenantId" = current_tenant_id()
      AND c."storeId" = current_store_id()
    )
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "Product" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "Variant" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "Category" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "ProductCategory" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Product" p
      WHERE p.id = "ProductCategory"."productId"
      AND p."tenantId" = current_tenant_id()
      AND p."storeId" = current_store_id()
    )
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "Collection" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "ProductCollection" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Product" p
      WHERE p.id = "ProductCollection"."productId"
      AND p."tenantId" = current_tenant_id()
      AND p."storeId" = current_store_id()
    )
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "Stock" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "StockAdjustment" FOR ALL
  USING (
    "storeId" = current_store_id()
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "Cart" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "CartItem" FOR ALL
  USING (
    "storeId" = current_store_id()
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "Order" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "OrderItem" FOR ALL
  USING (
    "storeId" = current_store_id()
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "PaymentProvider" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "PaymentSession" FOR ALL
  USING (
    "storeId" = current_store_id()
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "ShippingMethod" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "ShippingZone" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "ShippingMethod" s
      WHERE s.id = "ShippingZone"."shippingMethodId"
      AND s."tenantId" = current_tenant_id()
      AND s."storeId" = current_store_id()
    )
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "Promotion" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "Coupon" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "PromotionUsage" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "WebhookEndpoint" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "WebhookDelivery" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "WebhookEndpoint" w
      WHERE w.id = "WebhookDelivery"."endpointId"
      AND w."tenantId" = current_tenant_id()
      AND w."storeId" = current_store_id()
    )
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "NotificationTemplate" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

CREATE POLICY tenant_store_isolation ON "NotificationLog" FOR ALL
  USING (
    ("tenantId" = current_tenant_id() AND "storeId" = current_store_id())
    OR is_super_admin()
  );

-- RLS policy for AuditLog (platform-level access for SuperAdmin, store-scoped otherwise)
CREATE POLICY tenant_isolation ON "AuditLog" FOR ALL
  USING (
    ("tenantId" = current_tenant_id())
    OR is_super_admin()
  );

-- ─── _prisma_migrations table ───────────────────────────────────────────────

CREATE TABLE "_prisma_migrations" (
    "id"                    VARCHAR(36) PRIMARY KEY,
    "checksum"              VARCHAR(64) NOT NULL,
    "finished_at"           TIMESTAMPTZ,
    "migration_name"        VARCHAR(255) NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        TIMESTAMPTZ,
    "started_at"            TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count"   INTEGER NOT NULL DEFAULT 0
);

INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count")
VALUES (
  gen_random_uuid()::text,
  '0000000000000000000000000000000000000000000000000000000000000000',
  now(),
  '0001_init',
  now(),
  1
);
