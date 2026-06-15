import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

const SEED_TENANT_SLUG = 'platform';
const SEED_TENANT_NAME = 'CommerceCore Platform';
const SEED_STORE_SLUG = 'default';
const SEED_STORE_NAME = 'Default Store';
const SEED_ADMIN_EMAIL = 'admin@commercecore.com';
const SEED_ADMIN_PASSWORD = 'SuperAdmin123!';

async function main() {
  console.log('Seeding database...');

  // ── Permissions ──────────────────────────────────────────────────────────

  const permissions = [
    { name: 'tenant.read', description: 'View tenant settings', group: 'tenant' },
    { name: 'tenant.write', description: 'Modify tenant settings', group: 'tenant' },
    { name: 'store.read', description: 'View stores', group: 'store' },
    { name: 'store.write', description: 'Create/update stores', group: 'store' },
    { name: 'admin.read', description: 'View admins', group: 'admin' },
    { name: 'admin.write', description: 'Create/update admins', group: 'admin' },
    { name: 'role.read', description: 'View roles', group: 'role' },
    { name: 'role.write', description: 'Create/update roles', group: 'role' },
    { name: 'permission.read', description: 'View permissions', group: 'permission' },
    { name: 'customer.read', description: 'View customers', group: 'customer' },
    { name: 'customer.write', description: 'Create/update customers', group: 'customer' },
    { name: 'product.read', description: 'View products', group: 'product' },
    { name: 'product.write', description: 'Create/update products', group: 'product' },
    { name: 'category.read', description: 'View categories', group: 'category' },
    { name: 'category.write', description: 'Create/update categories', group: 'category' },
    { name: 'collection.read', description: 'View collections', group: 'collection' },
    { name: 'collection.write', description: 'Create/update collections', group: 'collection' },
    { name: 'stock.read', description: 'View stock levels', group: 'stock' },
    { name: 'stock.write', description: 'Adjust stock levels', group: 'stock' },
    { name: 'order.read', description: 'View orders', group: 'order' },
    { name: 'order.write', description: 'Create/update orders', group: 'order' },
    { name: 'promotion.read', description: 'View promotions', group: 'promotion' },
    { name: 'promotion.write', description: 'Create/update promotions', group: 'promotion' },
    { name: 'shipping.read', description: 'View shipping methods', group: 'shipping' },
    { name: 'shipping.write', description: 'Create/update shipping methods', group: 'shipping' },
    { name: 'payment.read', description: 'View payment providers', group: 'payment' },
    { name: 'payment.write', description: 'Configure payment providers', group: 'payment' },
    { name: 'webhook.read', description: 'View webhooks', group: 'webhook' },
    { name: 'webhook.write', description: 'Create/update webhooks', group: 'webhook' },
    { name: 'audit.read', description: 'View audit logs', group: 'audit' },
    { name: 'notification.read', description: 'View notification templates', group: 'notification' },
    { name: 'notification.write', description: 'Create/update notification templates', group: 'notification' },
  ];

  console.log('Creating permissions...');
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      create: perm,
      update: {},
    });
  }
  console.log(`  Created ${permissions.length} permissions`);

  // ── Tenant ───────────────────────────────────────────────────────────────

  console.log('Creating tenant...');
  const tenant = await prisma.tenant.upsert({
    where: { slug: SEED_TENANT_SLUG },
    create: {
      name: SEED_TENANT_NAME,
      slug: SEED_TENANT_SLUG,
    },
    update: {},
  });
  console.log(`  Tenant: ${tenant.id} (${tenant.slug})`);

  // ── Plan ─────────────────────────────────────────────────────────────────

  console.log('Creating plan...');
  const plan = await prisma.plan.create({
    data: {
      tenantId: tenant.id,
      name: 'Unlimited',
      maxStores: 999,
      maxAdmins: 999,
      maxProducts: 999999,
      maxWebhooks: 100,
      features: JSON.stringify({ all: true }),
      monthlyPrice: 0,
    },
  });
  console.log(`  Plan: ${plan.id}`);

  // ── Store ────────────────────────────────────────────────────────────────

  console.log('Creating store...');
  const store = await prisma.store.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: SEED_STORE_SLUG },
    },
    create: {
      tenantId: tenant.id,
      planId: plan.id,
      name: SEED_STORE_NAME,
      slug: SEED_STORE_SLUG,
      currency: 'ARS',
      displayName: 'Default Store',
      isActive: true,
    },
    update: {},
  });
  console.log(`  Store: ${store.id} (${store.slug})`);

  // ── Role: SuperAdmin ─────────────────────────────────────────────────────

  console.log('Creating roles...');
  const superAdminRole = await prisma.role.upsert({
    where: {
      tenantId_name: { tenantId: tenant.id, name: 'SuperAdmin' },
    },
    create: {
      tenantId: tenant.id,
      name: 'SuperAdmin',
      scope: 'platform',
      isSystem: true,
    },
    update: {},
  });

  const storeAdminRole = await prisma.role.upsert({
    where: {
      tenantId_name: { tenantId: tenant.id, name: 'StoreAdmin' },
    },
    create: {
      tenantId: tenant.id,
      name: 'StoreAdmin',
      scope: 'store',
      isSystem: true,
    },
    update: {},
  });

  const operatorRole = await prisma.role.upsert({
    where: {
      tenantId_name: { tenantId: tenant.id, name: 'Operator' },
    },
    create: {
      tenantId: tenant.id,
      name: 'Operator',
      scope: 'store',
      isSystem: true,
    },
    update: {},
  });

  console.log(`  Roles: ${superAdminRole.name}, ${storeAdminRole.name}, ${operatorRole.name}`);

  // ── Assign all permissions to SuperAdmin ─────────────────────────────────

  console.log('Assigning permissions to SuperAdmin...');
  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
      update: {},
    });
  }
  console.log(`  Assigned ${allPerms.length} permissions to SuperAdmin`);

  // ── Assign store-scoped permissions to StoreAdmin ────────────────────────

  const storeAdminPerms = allPerms.filter((p) =>
    ['store.', 'product.', 'category.', 'collection.', 'stock.', 'order.',
     'customer.', 'promotion.', 'shipping.', 'payment.', 'webhook.',
     'notification.', 'audit.'].some((prefix) => p.name.startsWith(prefix)),
  );

  for (const perm of storeAdminPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: storeAdminRole.id,
          permissionId: perm.id,
        },
      },
      create: {
        roleId: storeAdminRole.id,
        permissionId: perm.id,
      },
      update: {},
    });
  }
  console.log(`  Assigned ${storeAdminPerms.length} permissions to StoreAdmin`);

  // ── Assign read-only permissions to Operator ─────────────────────────────

  const operatorPerms = allPerms.filter((p) => p.name.endsWith('.read'));
  for (const perm of operatorPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: operatorRole.id,
          permissionId: perm.id,
        },
      },
      create: {
        roleId: operatorRole.id,
        permissionId: perm.id,
      },
      update: {},
    });
  }
  console.log(`  Assigned ${operatorPerms.length} permissions to Operator`);

  // ── Admin: SuperAdmin ────────────────────────────────────────────────────

  console.log('Creating SuperAdmin admin...');
  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12);
  const admin = await prisma.admin.upsert({
    where: { email: SEED_ADMIN_EMAIL },
    create: {
      tenantId: tenant.id,
      storeId: store.id,
      email: SEED_ADMIN_EMAIL,
      passwordHash,
      displayName: 'Super Admin',
      isSuperAdmin: true,
      isActive: true,
    },
    update: {},
  });

  await prisma.adminRole.upsert({
    where: {
      adminId_roleId: { adminId: admin.id, roleId: superAdminRole.id },
    },
    create: {
      adminId: admin.id,
      roleId: superAdminRole.id,
    },
    update: {},
  });

  console.log(`  Admin: ${admin.email} (password: ${SEED_ADMIN_PASSWORD})`);

  // ── API Keys ────────────────────────────────────────────────────────────────

  console.log('Creating API keys...');
  const apiKeyDefs = [
    { name: 'Production API Key', prefix: 'prod_sc_' },
    { name: 'Development API Key', prefix: 'dev_sc__' },
  ];

  for (const keyDef of apiKeyDefs) {
    const rawKey = `${keyDef.prefix}${crypto.randomBytes(24).toString('hex')}`;
    const hash = await bcrypt.hash(rawKey, 10);

    await prisma.apiKey.upsert({
      where: {
        prefix_hash: { prefix: keyDef.prefix, hash },
      },
      create: {
        tenantId: tenant.id,
        storeId: store.id,
        adminId: admin.id,
        name: keyDef.name,
        prefix: keyDef.prefix,
        hash,
        isActive: true,
      },
      update: {},
    });

    console.log(`  ${keyDef.name}: ${rawKey}`);
  }

  console.log('\nSeed completed successfully!');
  console.log('  Login with:');
  console.log('    Email:    admin@commercecore.com');
  console.log('    Password: SuperAdmin123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
