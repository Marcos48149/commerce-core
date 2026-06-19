# Admin Dashboard — System (Phase 8)

## Purpose

The system module provides administration of webhooks, audit logs, and shipping methods. These are operational tools for integrating and monitoring the platform.

## Requirements

### Requirement: Webhooks List

The webhooks list MUST display in a table with columns: name, URL (truncated), events (badge list), status (active/inactive badge), last triggered date, and actions (edit, delete).

#### Scenario: Webhooks list renders

- GIVEN webhooks exist
- WHEN the admin visits `/dashboard/system/webhooks`
- THEN a table shows all webhooks with name, URL, events, status, and last triggered

### Requirement: Create Webhook

The create webhook form MUST include: name (required), URL (required, valid URL format), event checkboxes (from available events: `order_created`, `order_paid`, `order_cancelled`, `order_updated`, `inventory_updated`, `customer_created`), and active toggle. On submit, calls `POST /api/v1/webhooks`.

#### Scenario: Admin creates webhook for order events

- GIVEN the admin is on `/dashboard/system/webhooks/new`
- WHEN they enter name "Notificar pedidos", URL, and check `order_created` and `order_paid`
- THEN the webhook is created
- AND it appears in the webhooks list

### Requirement: Edit Webhook

The edit form SHALL allow changing URL, events, and active toggle. Calls `PUT /api/v1/webhooks/:id`.

#### Scenario: Admin updates webhook URL

- GIVEN a webhook exists
- WHEN the admin edits the URL and saves
- THEN the webhook's URL is updated
- AND the list shows the new URL

### Requirement: Delete Webhook

Deleting a webhook SHALL show a confirmation dialog: "¿Eliminar webhook {name}? Las entregas pendientes no se completarán." Calls `DELETE /api/v1/webhooks/:id`.

#### Scenario: Admin deletes webhook

- GIVEN a webhook exists
- WHEN the admin clicks delete and confirms
- THEN the webhook is deleted
- AND it disappears from the list

### Requirement: Audit Logs List with Filters

The audit logs page MUST display logs in a read-only table with columns: timestamp, admin email, action, entity type, entity ID (truncated), and details (expandable row showing old/new values). Filters SHALL include: action (dropdown), admin (search/select), entity type (dropdown), and date range (start/end). Pagination defaults to 50 per page.

#### Scenario: Admin filters audit logs by action

- GIVEN audit logs exist for various actions
- WHEN the admin selects "product.delete" from the action filter
- THEN only logs with that action are shown

#### Scenario: Admin expands log detail

- GIVEN an audit log entry exists
- WHEN the admin clicks the expand icon on a row
- THEN a sub-row opens showing oldValue and newValue as formatted JSON

### Requirement: Shipping Methods List

The shipping methods list MUST display in a table with columns: name, type badge (flat/weight/free), base cost (formatted), free threshold (formatted), status (active/inactive badge), and actions (edit, delete).

#### Scenario: Shipping methods list renders

- GIVEN shipping methods exist
- WHEN the admin visits `/dashboard/system/shipping`
- THEN a table shows all methods with name, type, base cost, free threshold, and status

### Requirement: Create Shipping Method

The create shipping method form MUST include: name (required), type (select: flat/weight/free), base cost (decimal, required), free threshold (decimal, optional). On submit, calls `POST /api/v1/shipping`.

#### Scenario: Admin creates flat-rate shipping

- GIVEN the admin is on `/dashboard/system/shipping/new`
- WHEN they select type "Tarifa fija", enter cost 1500, and leave free threshold empty
- THEN the shipping method is created
- AND it appears in the list

### Requirement: Edit/Delete Shipping

Editing a shipping method SHALL pre-fill all fields and call `PUT /api/v1/shipping/:id`. Deleting SHALL show a confirmation dialog: "¿Eliminar método de envío {name}?" Calls `DELETE /api/v1/shipping/:id`.

#### Scenario: Admin updates shipping cost

- GIVEN a shipping method exists
- WHEN the admin edits the base cost from 1500 to 2000
- THEN the cost is updated via API
- AND the list shows the new cost

## Routes

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET | /api/v1/webhooks | AdminJWT | webhook.read | List webhooks |
| POST | /api/v1/webhooks | AdminJWT | webhook.write | Create webhook |
| GET | /api/v1/webhooks/:id | AdminJWT | webhook.read | Get webhook |
| PUT | /api/v1/webhooks/:id | AdminJWT | webhook.write | Update webhook |
| DELETE | /api/v1/webhooks/:id | AdminJWT | webhook.write | Delete webhook |
| GET | /api/v1/audit-logs | AdminJWT | audit.read | List audit logs (filtered, paginated) |
| GET | /api/v1/shipping | AdminJWT | shipping.read | List shipping methods |
| POST | /api/v1/shipping | AdminJWT | shipping.write | Create shipping method |
| GET | /api/v1/shipping/:id | AdminJWT | shipping.read | Get shipping method |
| PUT | /api/v1/shipping/:id | AdminJWT | shipping.write | Update shipping method |
| DELETE | /api/v1/shipping/:id | AdminJWT | shipping.write | Delete shipping method |
