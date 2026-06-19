# Admin Dashboard — Tenant & Store Settings (Phase 7)

## Purpose

The tenant & store settings module allows SuperAdmins to manage the tenant profile, stores, and subscription plans. Regular admins have read-only access to tenant info.

## Requirements

### Requirement: Tenant Profile View/Edit

The tenant profile page SHALL display: name, slug (read-only), created date. An edit button SHALL open an inline form to update the tenant name. Calls `PUT /api/v1/tenant`.

#### Scenario: Admin views tenant profile

- GIVEN the admin visits `/dashboard/tenant`
- THEN the tenant name, slug, and created date are displayed
- AND a disabled badge "SuperAdmin only" is shown for slug field

#### Scenario: SuperAdmin edits tenant name

- GIVEN a SuperAdmin on the tenant profile page
- WHEN they click "Editar" and change the name
- THEN `PUT /api/v1/tenant` is called with the new name
- AND the page updates to show the new name

### Requirement: Stores List

The stores list MUST display in a table with columns: name, slug, currency, plan name, status (active/inactive badge), and actions (edit, delete). Search by name SHALL be supported.

#### Scenario: Stores list renders

- GIVEN multiple stores exist
- WHEN the admin visits `/dashboard/tenant/stores`
- THEN a table shows all stores with name, slug, currency, plan, status, and actions

### Requirement: Create Store

The create store form MUST include: name (required), slug (auto-generated from name, editable), currency (select: ARS, USD, EUR, BRL), plan (select from available plans), and active toggle. On submit, calls `POST /api/v1/stores`.

#### Scenario: SuperAdmin creates store

- GIVEN the admin is on `/dashboard/tenant/stores/new`
- WHEN they enter name "Tienda Argentina", select currency ARS, and pick a plan
- THEN the store is created
- AND it appears in the stores list

### Requirement: Edit Store

The edit store form SHALL allow updating: name, slug, currency, plan, and active toggle. Calls `PUT /api/v1/stores/:id`. If a store is deactivated, a warning banner SHALL appear: "Esta tienda está desactivada. Los clientes no pueden realizar compras."

#### Scenario: Admin deactivates store

- GIVEN an active store
- WHEN the admin toggles active to false and saves
- THEN the store's isActive becomes false
- AND the stores list shows the status as "Inactiva"

### Requirement: Plans List

The plans list MUST display in a table with columns: name, max stores, max admins, max products, features (badge list), monthly price (formatted currency), and actions (edit, delete). Plans in use by a store SHALL show a "En uso" badge and cannot be deleted.

#### Scenario: Plans list renders

- GIVEN plans exist
- WHEN the admin visits `/dashboard/tenant/plans`
- THEN the table shows all plans with limits and features

### Requirement: Create/Edit Plan

The create/edit plan form SHALL include: name, maxStores (number), maxAdmins (number), maxProducts (number), features (multi-select or tag input: "webhooks", "api", "multilingual", "custom-domain"), and monthly price (decimal).

#### Scenario: SuperAdmin creates plan

- GIVEN the admin is on `/dashboard/tenant/plans/new`
- WHEN they enter name "Premium", limits, select features, and set price
- THEN the plan is created
- AND it appears in the plans list

### Requirement: Delete Plan

Deleting a plan SHALL show a confirmation dialog. If the plan is currently assigned to any store, the delete button SHALL be disabled with tooltip: "No se puede eliminar un plan en uso."

#### Scenario: Admin cannot delete plan in use

- GIVEN a plan is assigned to one or more stores
- WHEN the admin tries to delete it
- THEN the delete button is disabled
- AND hovering shows "No se puede eliminar un plan en uso"

## Routes

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET | /api/v1/tenant | AdminJWT | tenant.read | Get tenant details |
| PUT | /api/v1/tenant | AdminJWT | tenant.write | Update tenant |
| GET | /api/v1/stores | AdminJWT | store.read | List stores (tenant-scoped) |
| POST | /api/v1/stores | AdminJWT | store.write | Create store |
| GET | /api/v1/stores/:id | AdminJWT | store.read | Get store details |
| PUT | /api/v1/stores/:id | AdminJWT | store.write | Update store |
| DELETE | /api/v1/stores/:id | AdminJWT | store.write | Soft-delete store |
| GET | /api/v1/plans | AdminJWT | tenant.read | List plans |
| POST | /api/v1/plans | AdminJWT | tenant.write | Create plan |
| GET | /api/v1/plans/:id | AdminJWT | tenant.read | Get plan |
| PUT | /api/v1/plans/:id | AdminJWT | tenant.write | Update plan |
| DELETE | /api/v1/plans/:id | AdminJWT | tenant.write | Delete plan |
