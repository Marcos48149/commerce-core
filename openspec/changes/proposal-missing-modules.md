# SDD Proposal: Missing Backoffice Modules

## Change Summary

Implement 3 missing NestJS modules that complete the backoffice/admin surface area of CommerceCore: Customer Identity, Tenant Store Management, and Backoffice IAM CRUD.

## Modules

### 1. Customer Identity (`CustomerIdentityModule`)

**What exists today:**
- `Customer` model in Prisma schema (with email, passwordHash, displayName, phone, refreshToken, addresses relation)
- `Address` model in Prisma schema (with type, line1, city, province, postalCode, country)
- Models are used by Cart (customerId FK) and Order (customerId FK) — but there is NO module to register/login/manage customers

**What needs to be built:**
- Customer registration endpoint (POST /api/v1/customers/auth/register)
- Customer login endpoint (POST /api/v1/customers/auth/login)
- Customer token refresh (POST /api/v1/customers/auth/refresh)
- Customer profile CRUD (GET/PUT /api/v1/customers/me)
- Customer address management (GET/POST/PUT/DELETE /api/v1/customers/me/addresses)
- Customer-scoped JWT strategy (separate from admin JWT)
- Guest-to-customer cart merge on login

**Key business rules:**
- Customers are per-store (unique email within a store)
- A customer can have multiple addresses (shipping, billing, etc.)
- Customer JWT is separate from admin JWT (different secret/key pair)
- On registration, assign ANONYMOUS role via the existing AdminRole pattern? No — customers don't use the admin RBAC. Customer auth is simpler: email + password only, no roles.

### 2. Tenant Store Management (`TenantStoreModule`)

**What exists today:**
- `Tenant` model in Prisma schema (name, slug, stores/plans/admins/roles relations)
- `Store` model in Prisma schema (name, slug, currency, settings, full relations)
- `Plan` model in Prisma schema (name, maxStores, features, monthlyPrice)
- Seed data creates 1 tenant, 1 plan, 1 store
- Admin already has tenantId and storeId in JWT payload

**What needs to be built:**
- Tenant CRUD (GET/PUT /api/v1/tenant) — current tenant context
- Store CRUD for super admins (GET/POST/PUT/DELETE /api/v1/stores)
- Plan management (GET/POST/PUT/DELETE /api/v1/plans)
- Tenant settings endpoint (GET/PUT /api/v1/tenant/settings)
- Store selector/switcher for multi-store admins

**Key business rules:**
- Most admin users operate within a single store (storeId in JWT)
- Super admins can manage stores across the tenant
- Plans constrain store capabilities (max products, etc.)
- Tenant slug is used for subdomain-based multi-tenancy in the future

### 3. Backoffice IAM CRUD (`IamCrudModule`)

**What exists today:**
- `Admin` model (email, passwordHash, displayName, isSuperAdmin, roles relation)
- `Role` model (name, scope, permissions relation)
- `Permission` model (name, description, group)
- `AdminRole`, `RolePermission` join tables
- `ApiKey` model (name, prefix, hash, scopes, expiresAt)
- IAM module handles JWT auth, API key auth, permission evaluation guards
- AuthController has login and refresh endpoints
- Seed creates 32 permissions, 3 roles, 1 admin

**What needs to be built:**
- Admin CRUD (GET/POST/PUT/DELETE /api/v1/iam/admins)
- Role CRUD (GET/POST/PUT/DELETE /api/v1/iam/roles) — assign permissions
- Permission listing (GET /api/v1/iam/permissions)
- Admin-to-role assignment (POST/DELETE /api/v1/iam/admins/:id/roles)
- ApiKey CRUD (GET/POST/PUT/DELETE /api/v1/iam/api-keys)
- Current admin profile (GET/PUT /api/v1/iam/me)
- Password change for current admin (PUT /api/v1/iam/me/password)

**Key business rules:**
- Super admins bypass all permission checks (already implemented in PermissionEvaluator)
- System roles (Admin, Manager, Viewer) cannot be deleted
- ApiKeys belong to an admin and inherit their permissions
- Soft delete for all entities (deletedAt field)

## Architecture Approach

**Pattern**: Follow the existing NestJS module structure (catalog.module.ts pattern):
- `domain/` — entity classes + abstract repository with @Injectable()
- `application/` — use case classes with constructor DI
- `infrastructure/` — Prisma repository implementations
- `interface/` — controllers + DTOs with @ApiProperty()
- `module.ts` — wires providers (repository binding + use cases) and controllers

**New module registration**: Add to `app.module.ts` imports array.

**Repository DI binding**: `{ provide: XxxRepository, useClass: PrismaXxxRepository }`

**Auth**: CustomerIdentityModule uses its OWN JwtModule (separate secret). Backoffice endpoints reuse existing JwtAuthGuard + PermissionGuard.

## Risks

1. Customer JWT needs a separate key pair from admin JWT (env vars: `CUSTOMER_JWT_PRIVATE_KEY`, `CUSTOMER_JWT_PUBLIC_KEY`)
2. No unit/integration tests exist in the project (only e2e jest config) — manual testing required
3. Changing Customer model fields (e.g., adding `otpSecret` for 2FA) would require a migration

## Out of Scope

- Customer OAuth/social login
- Admin password reset flow (email)
- Multi-factor authentication
- Customer groups/segments
- Tenant registration flow (self-service)
