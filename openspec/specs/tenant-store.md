# Tenant Store Module — Spec

## Routes

All protected by `@UseGuards(AuthGuard('jwt'), PermissionGuard)`.

### Tenant

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | /api/v1/tenant | tenant.read | Get current tenant details |
| PUT | /api/v1/tenant | tenant.write | Update tenant (name, slug) |

### Stores

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | /api/v1/stores | store.read | List stores (tenant-scoped) |
| POST | /api/v1/stores | store.write | Create store |
| GET | /api/v1/stores/:id | store.read | Get store details |
| PUT | /api/v1/stores/:id | store.write | Update store |
| DELETE | /api/v1/stores/:id | store.write | Soft-delete store |

### Plans

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | /api/v1/plans | tenant.read | List plans |
| POST | /api/v1/plans | tenant.write | Create plan |
| GET | /api/v1/plans/:id | tenant.read | Get plan |
| PUT | /api/v1/plans/:id | tenant.write | Update plan |
| DELETE | /api/v1/plans/:id | tenant.write | Delete plan |

## Key Behaviors

- Tenant slug is used for subdomain routing (future)
- Super admin can see all stores in tenant; store-scoped admin sees only their store
- Soft delete on Store (sets deletedAt)
- Plan changes propagate to store constraints
- JWT already contains `tenantId` and `storeId` from admin auth

## Implementation Pattern

- Module: `apps/api/src/tenant-store/tenant-store.module.ts`
- Repositories: `TenantRepository`, `StoreRepository`, `PlanRepository` (abstract classes)
- Use cases: one per controller action
- Controller: `TenantController`, `StoreController`, `PlanController`
