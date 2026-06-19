# Admin Dashboard — IAM (Phase 6)

## Purpose

The IAM module provides backoffice user management: admins, roles, permissions, and API keys. It supports full CRUD for admins and roles with system-role protection, and secure API key creation with one-time raw key display.

## Requirements

### Requirement: Admins List

The admins list MUST display in a table with columns: email, displayName, roles (badge list), status (active/inactive badge), and created date. Search by email SHALL be supported. Pagination defaults to 20 per page.

#### Scenario: Admin list renders

- GIVEN multiple admins exist in the tenant
- WHEN the admin visits `/dashboard/iam/admins`
- THEN a table shows all admins with email, displayName, roles, status, and created date

### Requirement: Create Admin

The create admin form MUST include: email (required, email format), password (required, min 8 chars), displayName (required), and role assignment (multi-select from available roles). On submit, calls `POST /api/v1/iam/admins`.

#### Scenario: Admin creates new admin with role

- GIVEN the admin is on `/dashboard/iam/admins/new`
- WHEN they fill email, password, displayName, and select a role
- THEN the admin is created
- AND the new admin appears in the list with the assigned role

### Requirement: Edit Admin

The edit admin form SHALL allow changing displayName, toggling active/inactive status, and modifying role assignments. Calls `PUT /api/v1/iam/admins/:id`.

#### Scenario: Admin toggles admin status

- GIVEN an active admin
- WHEN the admin deactivates them
- THEN the admin's `isActive` is set to false
- AND the status badge in the list changes to "Inactivo"

### Requirement: Soft-Delete Admin

Deleting an admin SHALL show a confirmation dialog: "¿Eliminar administrador {displayName}? Esta acción es reversible (soft-delete)." Calls `DELETE /api/v1/iam/admins/:id`.

#### Scenario: Admin soft-deletes another admin

- GIVEN an admin exists
- WHEN the admin clicks delete and confirms
- THEN the admin is soft-deleted (deletedAt set)
- AND they disappear from the active list

### Requirement: Roles List

The roles list MUST display in a table with columns: name, scope (tenant/store), permission count, system badge (if isSystem), and created date. System roles SHALL have a visible badge "Sistema".

#### Scenario: Roles list renders

- GIVEN roles exist
- WHEN the admin visits `/dashboard/iam/roles`
- THEN the table shows all roles with name, scope, permission count, system badge, and created date

### Requirement: Create Role

The create role form MUST include: name (required), scope (tenant/store), and permission checkboxes grouped by category (e.g., "Productos", "Pedidos", "Clientes"). Each group has a "Seleccionar todo" toggle. On submit, calls `POST /api/v1/iam/roles`.

#### Scenario: Admin creates role with permissions

- GIVEN the admin is on `/dashboard/iam/roles/new`
- WHEN they enter name "Gestor de Productos" and check all permissions under "Productos"
- THEN the role is created with selected permissions
- AND it appears in the roles list

### Requirement: System Roles Protection

System roles (`isSystem: true`) MUST have their delete button disabled with tooltip: "Los roles de sistema no se pueden eliminar". The rename field SHALL be disabled in the edit form.

#### Scenario: Admin cannot delete system role

- GIVEN the roles list
- WHEN the admin looks at a system role row
- THEN the delete button is disabled
- AND hovering shows "Los roles de sistema no se pueden eliminar"

### Requirement: Permissions Page (Read-Only)

The permissions page MUST display all available permissions grouped by category in cards. Each card shows the group name and a list of permission names with descriptions. No edit capability — pure read-only.

#### Scenario: Admin views permissions

- GIVEN the admin visits `/dashboard/iam/permissions`
- THEN all permissions are shown grouped by category (e.g., "Productos", "Pedidos", "Clientes")

### Requirement: API Key Creation with One-Time Display

The API keys list SHALL show: name, prefix (first 8 chars + "****"), last used date, status badge, and actions (revoke/delete). Creating an API key SHALL open a modal showing the raw key value ONCE with a "Copiar" button. The raw key MUST NOT be stored in the frontend state after the modal closes.

#### Scenario: Admin creates API key

- GIVEN the admin is on `/dashboard/iam/api-keys`
- WHEN they click "Crear API Key", enter name and select scopes
- THEN the API returns the key with raw value
- AND a modal shows the raw key with a "Copiar" button
- WHEN they close the modal
- THEN the raw key is cleared from state

#### Scenario: Admin returns to API keys list

- GIVEN the admin created an API key earlier
- WHEN they return to the API keys list
- THEN the new key appears with its prefix visible
- AND the raw key is not accessible again

### Requirement: Revoke API Key

Revoking an API key SHALL show a confirmation: "¿Revocar API Key {name}? Esta acción no se puede deshacer." Calls `DELETE /api/v1/iam/api-keys/:id`.

#### Scenario: Admin revokes API key

- GIVEN an active API key
- WHEN the admin clicks revoke and confirms
- THEN the key is deleted
- AND it disappears from the list

## Routes

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET | /api/v1/iam/admins | AdminJWT | admin.read | List admins |
| POST | /api/v1/iam/admins | AdminJWT | admin.write | Create admin |
| GET | /api/v1/iam/admins/:id | AdminJWT | admin.read | Get admin detail |
| PUT | /api/v1/iam/admins/:id | AdminJWT | admin.write | Update admin |
| DELETE | /api/v1/iam/admins/:id | AdminJWT | admin.write | Soft-delete admin |
| POST | /api/v1/iam/admins/:id/roles | AdminJWT | admin.write | Assign role |
| DELETE | /api/v1/iam/admins/:id/roles/:roleId | AdminJWT | admin.write | Remove role |
| GET | /api/v1/iam/roles | AdminJWT | role.read | List roles |
| POST | /api/v1/iam/roles | AdminJWT | role.write | Create role |
| GET | /api/v1/iam/roles/:id | AdminJWT | role.read | Get role with permissions |
| PUT | /api/v1/iam/roles/:id | AdminJWT | role.write | Update role |
| DELETE | /api/v1/iam/roles/:id | AdminJWT | role.write | Delete role (unless system) |
| GET | /api/v1/iam/permissions | AdminJWT | permission.read | List permissions grouped |
| GET | /api/v1/iam/api-keys | AdminJWT | admin.read | List API keys |
| POST | /api/v1/iam/api-keys | AdminJWT | admin.write | Create API key (raw returned once) |
| PUT | /api/v1/iam/api-keys/:id | AdminJWT | admin.write | Update API key |
| DELETE | /api/v1/iam/api-keys/:id | AdminJWT | admin.write | Delete API key |
