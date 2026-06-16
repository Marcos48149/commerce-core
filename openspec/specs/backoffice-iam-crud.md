# Backoffice IAM CRUD — Spec

## Routes

All protected by `@UseGuards(AuthGuard('jwt'), PermissionGuard)`. These extend the existing `IamModule`.

### Admin Profile (current user)

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | /api/v1/iam/me | — | Get current admin profile |
| PUT | /api/v1/iam/me | — | Update own profile (displayName) |
| PUT | /api/v1/iam/me/password | — | Change own password |

### Admins

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | /api/v1/iam/admins | admin.read | List admins (tenant-scoped) |
| POST | /api/v1/iam/admins | admin.write | Create admin |
| GET | /api/v1/iam/admins/:id | admin.read | Get admin details |
| PUT | /api/v1/iam/admins/:id | admin.write | Update admin |
| DELETE | /api/v1/iam/admins/:id | admin.write | Soft-delete admin |
| POST | /api/v1/iam/admins/:id/roles | admin.write | Assign role to admin |
| DELETE | /api/v1/iam/admins/:id/roles/:roleId | admin.write | Remove role from admin |

### Roles

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | /api/v1/iam/roles | role.read | List roles |
| POST | /api/v1/iam/roles | role.write | Create role |
| GET | /api/v1/iam/roles/:id | role.read | Get role with permissions |
| PUT | /api/v1/iam/roles/:id | role.write | Update role + permissions |
| DELETE | /api/v1/iam/roles/:id | role.write | Delete role (unless system) |

### Permissions

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | /api/v1/iam/permissions | permission.read | List all permissions grouped |

### API Keys

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | /api/v1/iam/api-keys | admin.read | List API keys (own admin) |
| POST | /api/v1/iam/api-keys | admin.write | Create API key (returns raw key once) |
| PUT | /api/v1/iam/api-keys/:id | admin.write | Update API key |
| DELETE | /api/v1/iam/api-keys/:id | admin.write | Delete API key |

## Key Behaviors

- System roles (isSystem: true) cannot be deleted or renamed
- API key raw value is returned ONLY on creation — never again
- Password is hashed with bcrypt (12 rounds) on create/update
- Soft delete on Admin (sets deletedAt)
- Permission checks use existing `@RequirePermission()` decorator + PermissionGuard
- All list endpoints support pagination where sensible
- Default ordering: createdAt DESC

## Implementation Note

All these controllers and providers go INSIDE the existing `iam/` folder, extending the existing `IamModule` with new providers and controllers. No new module needed — just add to `iam.module.ts` imports.
