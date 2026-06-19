# Admin Dashboard — Order Management (Phase 3)

## Purpose

The order management module allows admins to view, filter, and manage orders. It supports order lifecycle actions: confirm, cancel, and refund, with proper status transitions.

## Requirements

### Requirement: Orders List with Filters

The orders list MUST display in a table with columns: order ID (truncated prefix), customer name, status (color-coded badge), total (formatted currency), items count, date, and actions (view detail). Filters SHALL include: status dropdown (all, pending, confirmed, processing, shipped, delivered, cancelled), date range picker (start/end), and text search by order ID or customer email. Pagination defaults to 20 per page.

#### Scenario: Admin filters by pending

- GIVEN the orders list has orders of various statuses
- WHEN the admin selects "Pendiente" from the status filter
- THEN only orders with `PENDING_PAYMENT` or `PAID` status are shown
- AND the filter URL updates to `?status=pending`

#### Scenario: Admin searches by customer email

- GIVEN the orders list has orders from multiple customers
- WHEN the admin types an email into the search field
- THEN only orders matching that email are displayed

### Requirement: Order Detail with Full Info

The order detail page (`/dashboard/orders/:id`) MUST show: customer info (name, email), shipping address (line1, line2, city, province, postalCode), items table (image thumbnail, product name, variant name, SKU, qty, unit price, total price), status timeline (ordered, paid, processed, shipped, delivered with timestamps), and total breakdown (subtotal, discount, shipping, tax, total).

#### Scenario: Admin opens order detail

- GIVEN an order exists
- WHEN the admin clicks an order in the list
- THEN they navigate to `/dashboard/orders/:id`
- AND all sections render: customer info, shipping, items, timeline, totals

#### Scenario: Status timeline shows history

- GIVEN an order with status SHIPPED
- WHEN the order detail loads
- THEN the timeline shows events: "Pedido creado", "Pago confirmado", "En proceso", "Enviado" with timestamps
- AND future events ("Entregado") are greyed out

### Requirement: Order Actions

The order detail page SHALL show action buttons based on current status. Available transitions: `PENDING_PAYMENT` → confirm or cancel, `PAID` → confirm or cancel, `PROCESSING` → ship or cancel, `SHIPPED` → mark delivered, `DELIVERED` → refund. Each action calls the corresponding API endpoint.

#### Scenario: Admin confirms order

- GIVEN an order with status PAID
- WHEN the admin clicks "Confirmar Pedido"
- THEN `POST /api/v1/orders/:id/confirm` is called
- AND the status changes to PROCESSING
- AND a timeline entry "Confirmado por [admin]" appears

#### Scenario: Admin cancels order with reason

- GIVEN an order with status PENDING_PAYMENT
- WHEN the admin clicks "Cancelar Pedido"
- THEN a dialog appears asking for cancellation reason
- WHEN the admin enters a reason and confirms
- THEN `POST /api/v1/orders/:id/cancel` is called with the reason
- AND the status changes to CANCELLED

#### Scenario: Admin refunds order

- GIVEN a delivered order
- WHEN the admin clicks "Reembolsar"
- THEN a dialog asks for the refund amount (partial or full)
- WHEN the admin enters an amount and confirms
- THEN `POST /api/v1/orders/:id/refund` is called
- AND the status changes to REFUNDED

### Requirement: Status Transitions Follow Backend Logic

The frontend MUST enforce that action buttons only appear when the transition is valid per backend rules. Disabled actions SHALL show a tooltip explaining why.

#### Scenario: Cannot cancel a shipped order

- GIVEN an order with status SHIPPED
- WHEN the admin views the order detail
- THEN the "Cancelar" button is not rendered (or disabled with tooltip)
- AND the only available action is "Marcar como Entregado"

## Routes

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET | /api/v1/orders | AdminJWT | order.read | List orders (paginated, filters) |
| GET | /api/v1/orders/:id | AdminJWT | order.read | Get order detail |
| POST | /api/v1/orders/:id/confirm | AdminJWT | order.write | Confirm order |
| POST | /api/v1/orders/:id/cancel | AdminJWT | order.write | Cancel order with reason |
| POST | /api/v1/orders/:id/refund | AdminJWT | order.write | Refund order |
