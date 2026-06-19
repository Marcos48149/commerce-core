# Admin Dashboard — Promotions (Phase 5)

## Purpose

The promotions module allows admins to create and manage promotions and coupons. Supports percentage and fixed discounts with scheduling, usage limits, and coupon generation.

## Requirements

### Requirement: Promotions List with Filters

The promotions list MUST display in a table with columns: name, type badge, status (active/scheduled/expired), current usage / max usage, start date, end date, and actions (edit/delete). Filters SHALL include: search by name and status filter (all, active, scheduled, expired). Pagination defaults to 20 per page.

#### Scenario: Admin filters by active promotions

- GIVEN promotions exist with various statuses
- WHEN the admin selects "Activas" from the status filter
- THEN only promotions that are currently active (within date range and isActive) are shown

### Requirement: Create Promotion Form

The create promotion form MUST include: name (required), description, type (percentage/fixed, rendered as radio or select), value (decimal — percentage amount or fixed amount), min purchase amount (optional), start date (required, date picker), end date (optional, date picker), and usage limit (optional, integer). On submit, it calls `POST /api/v1/promotions`.

#### Scenario: Admin creates percentage promotion

- GIVEN the admin is on `/dashboard/promotions/new`
- WHEN they select type "Porcentaje", enter value "10", and set start date to today
- THEN `POST /api/v1/promotions` is called with the correct payload
- AND the promotion appears in the list as active

### Requirement: Coupon Management Within Promotion

Within a promotion detail page, a coupons section SHALL list all associated coupons in a table (code, usage / max usage, status, actions). A "Generar Cupones" button SHALL open a dialog to generate N coupons (with auto-generated codes) or create a single coupon with a manual code input.

#### Scenario: Admin generates 10 coupons

- GIVEN a promotion exists
- WHEN the admin opens the promotion detail and clicks "Generar Cupones"
- THEN a dialog asks for quantity (10) and prefix (optional)
- WHEN confirmed
- THEN 10 coupons are created via API with auto-generated codes
- AND they appear in the coupons list

#### Scenario: Admin deletes a coupon

- GIVEN a coupon exists in a promotion
- WHEN the admin clicks the delete action on that coupon
- THEN a confirm dialog appears
- WHEN confirmed
- THEN the coupon is deleted
- AND it disappears from the list

### Requirement: Edit Promotion

The edit promotion form SHALL pre-fill all fields from the existing promotion and call `PUT /api/v1/promotions/:id` on submit. Type SHALL be read-only after creation.

#### Scenario: Admin edits promotion dates

- GIVEN a scheduled promotion
- WHEN the admin extends the end date and submits
- THEN the promotion's end date is updated
- AND the list reflects the change

### Requirement: Delete Promotion

Deleting a promotion SHALL show a confirmation dialog: "¿Eliminar promoción {name}? También se eliminarán todos los cupones asociados." On confirm, calls `DELETE /api/v1/promotions/:id`.

#### Scenario: Admin deletes promotion

- GIVEN a promotion with coupons
- WHEN the admin deletes it
- THEN the promotion and its coupons are removed
- AND the list no longer shows it

## Routes

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET | /api/v1/promotions | AdminJWT | promotion.read | List promotions (paginated) |
| POST | /api/v1/promotions | AdminJWT | promotion.write | Create promotion |
| GET | /api/v1/promotions/:id | AdminJWT | promotion.read | Get promotion with coupons |
| PUT | /api/v1/promotions/:id | AdminJWT | promotion.write | Update promotion |
| DELETE | /api/v1/promotions/:id | AdminJWT | promotion.write | Delete promotion |
| GET | /api/v1/promotions/:id/coupons | AdminJWT | promotion.read | List coupons for promotion |
| POST | /api/v1/promotions/:id/coupons | AdminJWT | promotion.write | Create coupon (single or batch) |
| DELETE | /api/v1/promotions/:id/coupons/:couponId | AdminJWT | promotion.write | Delete coupon |
