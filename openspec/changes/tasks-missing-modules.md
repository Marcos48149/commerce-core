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
- [ ] Create `customer.entity.ts`
- [ ] Create `address.entity.ts`
- [ ] Create `customer.repository.ts` (abstract)

### 1.2 Infrastructure
- [ ] Create `prisma-customer.repository.ts`

### 1.3 Application
- [ ] Create `customer-token.service.ts` (separate JWT for customers)
- [ ] Create `customer-jwt.strategy.ts` (passport-jwt strategy named 'customer-jwt')
- [ ] Create `register-customer.use-case.ts`
- [ ] Create `login-customer.use-case.ts`
- [ ] Create `refresh-customer-token.use-case.ts`
- [ ] Create `get-customer-profile.use-case.ts`
- [ ] Create `update-customer-profile.use-case.ts`
- [ ] Create `manage-addresses.use-case.ts`

### 1.4 Interface
- [ ] Create `customer-auth.dto.ts`
- [ ] Create `customer-profile.dto.ts`
- [ ] Create `customer-auth.controller.ts`
- [ ] Create `customer-profile.controller.ts`

### 1.5 Module
- [ ] Create `customer-identity.module.ts`
- [ ] Register in `app.module.ts`
- [ ] Build verification

---

## Task List: PR 2 — Tenant Store

### 2.1 Domain
- [ ] Create `tenant.entity.ts`
- [ ] Create `store.entity.ts`
- [ ] Create `plan.entity.ts`
- [ ] Create `tenant.repository.ts`
- [ ] Create `store.repository.ts`
- [ ] Create `plan.repository.ts`

### 2.2 Infrastructure
- [ ] Create `prisma-tenant.repository.ts`
- [ ] Create `prisma-store.repository.ts`
- [ ] Create `prisma-plan.repository.ts`

### 2.3 Application
- [ ] Create `manage-tenant.use-case.ts`
- [ ] Create `manage-stores.use-case.ts`
- [ ] Create `manage-plans.use-case.ts`

### 2.4 Interface
- [ ] Create `tenant-store.dto.ts`
- [ ] Create `tenant.controller.ts`
- [ ] Create `store.controller.ts`
- [ ] Create `plan.controller.ts`

### 2.5 Module
- [ ] Create `tenant-store.module.ts`
- [ ] Register in `app.module.ts`
- [ ] Build verification

---

## Task List: PR 3 — IAM CRUD

### 3.1 Domain
- [ ] Create `domain/admin.entity.ts`
- [ ] Create `domain/role.entity.ts`
- [ ] Create `domain/api-key.entity.ts`

### 3.2 Application
- [ ] Create `services/admin.service.ts`
- [ ] Create `services/role.service.ts`
- [ ] Create `services/api-key.service.ts`

### 3.3 Interface
- [ ] Create `dto/admin.dto.ts`
- [ ] Create `dto/role.dto.ts`
- [ ] Create `dto/api-key.dto.ts`
- [ ] Create `controllers/admin.controller.ts`
- [ ] Create `controllers/role.controller.ts`
- [ ] Create `controllers/api-key.controller.ts`

### 3.4 Module
- [ ] Update `iam.module.ts` (add new providers + controllers)
- [ ] Build verification
