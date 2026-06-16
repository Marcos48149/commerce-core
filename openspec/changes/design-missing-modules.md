# Technical Design: Missing Backoffice Modules

## 1. Customer Identity Module

### File Structure

```
apps/api/src/customer-identity/
├── customer-identity.module.ts
├── domain/
│   ├── customer.entity.ts
│   ├── address.entity.ts
│   └── customer.repository.ts       (abstract, @Injectable)
├── application/
│   ├── register-customer.use-case.ts
│   ├── login-customer.use-case.ts
│   ├── refresh-customer-token.use-case.ts
│   ├── get-customer-profile.use-case.ts
│   ├── update-customer-profile.use-case.ts
│   └── manage-addresses.use-case.ts
├── infrastructure/
│   └── prisma-customer.repository.ts
└── interface/
    ├── customer-auth.controller.ts
    ├── customer-profile.controller.ts
    ├── customer-auth.dto.ts
    └── customer-profile.dto.ts
```

### DI Architecture

```
CustomerIdentityModule
├── imports: [PrismaModule, JwtModule.register({}), PassportModule]
├── providers:
│   ├── { provide: CustomerRepository, useClass: PrismaCustomerRepository }
│   ├── CustomerJwtStrategy          ← NEW: passport-jwt strategy named 'customer-jwt'
│   ├── CustomerTokenService         ← NEW: separate token service for customer tokens
│   ├── RegisterCustomerUseCase
│   ├── LoginCustomerUseCase
│   ├── RefreshCustomerTokenUseCase
│   ├── GetCustomerProfileUseCase
│   ├── UpdateCustomerProfileUseCase
│   └── ManageAddressesUseCase
└── controllers:
    ├── CustomerAuthController
    └── CustomerProfileController
```

### Customer TokenService

- Same pattern as IAM TokenService but uses `CUSTOMER_JWT_PRIVATE_KEY` / `CUSTOMER_JWT_PUBLIC_KEY`
- Stores refresh token hash on Customer model (`refreshToken` field)
- Access token: 15m expiry, RS256
- Refresh token: 30d expiry, stored as SHA-256 hash

### Customer Entity

```ts
class Customer {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly storeId: string,
    public email: string,
    public displayName: string | null,
    public phone: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: {...}): Customer
  update(params: {...}): void
  softDelete(): void
}
```

### Address Entity

```ts
class Address {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public type: string,
    public line1: string,
    public line2: string | null,
    public city: string,
    public province: string,
    public postalCode: string,
    public country: string,
    public isDefault: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static create(params: {...}): Address
  update(params: {...}): void
  softDelete(): void
  markAsDefault(): void
}
```

### CustomerRepository

```ts
@Injectable()
export abstract class CustomerRepository {
  abstract findByEmail(storeId: string, email: string): Promise<Customer | null>
  abstract findById(id: string, storeId: string): Promise<Customer | null>
  abstract save(customer: Customer): Promise<void>
  abstract update(customer: Customer): Promise<void>
  abstract findAddressesByCustomer(customerId: string): Promise<Address[]>
  abstract findAddressById(id: string, customerId: string): Promise<Address | null>
  abstract saveAddress(address: Address): Promise<void>
  abstract updateAddress(address: Address): Promise<void>
  abstract deleteAddress(id: string, customerId: string): Promise<void>
}
```

### Registration Flow

```
POST /api/v1/customers/auth/register
  1. Validate DTO (email, password, displayName)
  2. Check duplicate email within storeId
  3. Hash password (bcrypt, 12 rounds)
  4. Create Customer entity + persist
  5. Generate customer JWT pair
  6. Return { customer, accessToken, refreshToken }
```

### Login Flow

```
POST /api/v1/customers/auth/login
  1. Find customer by email + storeId
  2. Compare bcrypt hash
  3. Update lastLoginAt
  4. Generate JWT pair
  5. Return { customer, accessToken, refreshToken }
```

---

## 2. Tenant Store Module

### File Structure

```
apps/api/src/tenant-store/
├── tenant-store.module.ts
├── domain/
│   ├── tenant.entity.ts
│   ├── store.entity.ts
│   ├── plan.entity.ts
│   ├── tenant.repository.ts
│   ├── store.repository.ts
│   └── plan.repository.ts
├── application/
│   ├── manage-tenant.use-case.ts
│   ├── manage-stores.use-case.ts
│   └── manage-plans.use-case.ts
├── infrastructure/
│   ├── prisma-tenant.repository.ts
│   ├── prisma-store.repository.ts
│   └── prisma-plan.repository.ts
└── interface/
    ├── tenant.controller.ts
    ├── store.controller.ts
    ├── plan.controller.ts
    └── tenant-store.dto.ts
```

### DI Architecture

```
TenantStoreModule
├── imports: [IamModule, AuditLogModule]
├── providers:
│   ├── { provide: TenantRepository, useClass: PrismaTenantRepository }
│   ├── { provide: StoreRepository, useClass: PrismaStoreRepository }
│   ├── { provide: PlanRepository, useClass: PrismaPlanRepository }
│   ├── ManageTenantUseCase
│   ├── ManageStoresUseCase
│   └── ManagePlansUseCase
└── controllers:
    ├── TenantController
    ├── StoreController
    └── PlanController
```

### Entity: Tenant (wraps Prisma Tenant model)

```ts
class Tenant {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}
  static create(params: { id: string; name: string; slug: string }): Tenant
  update(params: { name?: string; slug?: string }): void
}
```

### Entity: Store

```ts
class Store {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public planId: string | null,
    public name: string,
    public slug: string,
    public currency: string,
    public displayName: string | null,
    public isActive: boolean,
    public settings: Record<string, unknown>,
    ...
  ) {}
  // CRUD methods omitted for brevity — same pattern as Product entity
}
```

### Entity: Plan

```ts
class Plan {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public name: string,
    public maxStores: number,
    public maxAdmins: number,
    public maxProducts: number,
    public features: Record<string, unknown>,
    ...
  ) {}
}
```

---

## 3. Backoffice IAM CRUD

### File Placement

All files go INSIDE the existing `apps/api/src/iam/` folder:

```
apps/api/src/iam/
├── iam.module.ts                     ← EXTENDED with new providers/controllers
├── controllers/
│   ├── auth.controller.ts            ← existing
│   ├── admin.controller.ts           ← NEW
│   ├── role.controller.ts            ← NEW
│   └── api-key.controller.ts         ← NEW
├── services/
│   ├── token.service.ts              ← existing
│   ├── permission-evaluator.service.ts ← existing
│   ├── admin.service.ts              ← NEW (use case / application service)
│   ├── role.service.ts               ← NEW
│   └── api-key.service.ts            ← NEW
├── strategies/
│   ├── jwt.strategy.ts               ← existing
│   └── api-key.strategy.ts           ← existing
├── guards/
│   ├── jwt-auth.guard.ts             ← existing
│   ├── permission.guard.ts           ← existing
│   └── api-key.guard.ts              ← existing
├── decorators/
│   ├── current-user.decorator.ts     ← existing
│   └── permission.decorator.ts       ← existing
├── dto/
│   ├── admin.dto.ts                  ← NEW
│   ├── role.dto.ts                   ← NEW
│   └── api-key.dto.ts                ← NEW
└── domain/
    ├── admin.entity.ts               ← NEW
    ├── role.entity.ts                ← NEW
    └── api-key.entity.ts             ← NEW
```

### Services as Use Cases

Since IAM operations are simpler than catalog, use service classes instead of individual use case files:

**AdminService** — CRUD for admins, role assignment
- `create(params)` — hash password, create admin + assign role
- `list(tenantId)` — list admins with roles
- `getById(id, tenantId)` — get admin with roles
- `update(id, params)` — update admin fields
- `softDelete(id, tenantId)` — set deletedAt
- `assignRole(adminId, roleId)` — create AdminRole
- `removeRole(adminId, roleId)` — delete AdminRole
- `changePassword(adminId, oldPassword, newPassword)` — verify old, set new
- `getCurrentProfile(adminId)` — get own profile
- `updateCurrentProfile(adminId, params)` — update own displayName

**RoleService** — CRUD for roles, permission assignment
- `create(params)` — create role + assign permissions
- `list(tenantId)` — list roles with permission count
- `getById(id, tenantId)` — get role with full permissions
- `update(id, params, permissionIds?)` — update role + sync permissions
- `delete(id, tenantId)` — soft delete (reject if isSystem)

**ApiKeyService** — CRUD for API keys
- `create(adminId, params)` — generate key, hash, persist
- `list(adminId)` — list keys (without hash)
- `update(id, adminId, params)` — update name/active
- `delete(id, adminId)` — soft delete

### IamModule Extension

```ts
// Updated iam.module.ts providers array adds:
AdminService, RoleService, ApiKeyService

// Updated controllers array adds:
AdminController, RoleController, ApiKeyController
```

---

## Data Flow for All Modules

```
HTTP Request
  → Controller (validates DTO with class-validator)
    → Use Case / Service (business logic, validation)
      → Repository (abstract @Injectable)
        → PrismaRepositoryImpl (PrismaClient queries)
          → PostgreSQL
```

---

## Initialization & Persistence

All 3 modules follow the established patterns from existing modules:
- Soft-delete with `deletedAt` on all entities
- ULID generation via `UlidService`
- Audit logging via `LogActionUseCase` where applicable
- Default ordering by `createdAt DESC` for list endpoints
- Pagination with `{ data, total, page, limit, totalPages }` format
