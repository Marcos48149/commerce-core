# Tasks: Missing Backoffice Modules

## Review Workload Forecast

**Estimated changed lines: ~3,150** (WAY over 400-line budget)
**Chained PRs recommended:** Yes
**Decision needed before apply:** Yes

## Recommended Split

### PR 1: Customer Identity Module (~1,100 lines)
Customer registration, login, profile, address management.

### PR 2: Tenant Store Module (~970 lines)
Tenant, store, plan CRUD endpoints.

### PR 3: Backoffice IAM CRUD (~1,070 lines)
Admin CRUD, role CRUD, permission listing, API key management.

---

## Task List: PR 1 — Customer Identity

### 1.1 Domain Layer
- [x] Create `customer.entity.ts`
- [x] Create `address.entity.ts`
- [x] Create `customer.repository.ts` (abstract)

### 1.2 Infrastructure
- [x] Create `prisma-customer.repository.ts`

### 1.3 Application
- [x] Create `customer-token.service.ts` (separate JWT for customers)
- [x] Create `customer-jwt.strategy.ts` (passport-jwt strategy named 'customer-jwt')
- [x] Create `register-customer.use-case.ts`
- [x] Create `login-customer.use-case.ts`
- [x] Create `refresh-customer-token.use-case.ts`
- [x] Create `get-customer-profile.use-case.ts`
- [x] Create `update-customer-profile.use-case.ts`
- [x] Create `manage-addresses.use-case.ts`

### 1.4 Interface
- [x] Create `customer-auth.dto.ts`
- [x] Create `customer-profile.dto.ts`
- [x] Create `customer-auth.controller.ts`
- [x] Create `customer-profile.controller.ts`

### 1.5 Module
- [x] Create `customer-identity.module.ts`
- [x] Register in `app.module.ts`
- [x] Build verification

---

## Task List: PR 2 — Tenant Store

### 2.1 Domain
- [x] Create `tenant.entity.ts`
- [x] Create `store.entity.ts`
- [x] Create `plan.entity.ts`
- [x] Create `tenant.repository.ts`
- [x] Create `store.repository.ts`
- [x] Create `plan.repository.ts`

### 2.2 Infrastructure
- [x] Create `prisma-tenant.repository.ts`
- [x] Create `prisma-store.repository.ts`
- [x] Create `prisma-plan.repository.ts`

### 2.3 Application
- [x] Create `manage-tenant.use-case.ts`
- [x] Create `manage-stores.use-case.ts`
- [x] Create `manage-plans.use-case.ts`

### 2.4 Interface
- [x] Create `tenant-store.dto.ts`
- [x] Create `tenant.controller.ts`
- [x] Create `store.controller.ts`
- [x] Create `plan.controller.ts`

### 2.5 Module
- [x] Create `tenant-store.module.ts`
- [x] Register in `app.module.ts`
- [x] Build verification

---

## Task List: PR 3 — IAM CRUD

### 3.1 Domain
- [x] Create `domain/admin.entity.ts`
- [x] Create `domain/role.entity.ts`
- [x] Create `domain/api-key.entity.ts`

### 3.2 Application
- [x] Create `services/admin.service.ts`
- [x] Create `services/role.service.ts`
- [x] Create `services/api-key.service.ts`

### 3.3 Interface
- [x] Create `dto/admin.dto.ts`
- [x] Create `dto/role.dto.ts`
- [x] Create `dto/api-key.dto.ts`
- [x] Create `controllers/admin.controller.ts`
- [x] Create `controllers/role.controller.ts`
- [x] Create `controllers/api-key.controller.ts`

### 3.4 Module
- [x] Update `iam.module.ts` (add new providers + controllers)
- [x] Build verification
