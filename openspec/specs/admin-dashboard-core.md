# Admin Dashboard — Core Dashboard (Phase 1)

## Purpose

The dashboard home page provides a high-level business overview with summary metrics, recent orders, and quick actions. It serves as the landing page after login.

## Requirements

### Requirement: Summary Cards Show Key Metrics

The dashboard home MUST display 4 summary cards in a responsive grid: Total Products, Pending Orders, Total Customers, and Monthly Revenue. Each card SHALL show: an icon, a numeric value, a label in Spanish, and a trend indicator (arrow up/down with percentage change from the previous period). Values with decimals (revenue) SHALL be formatted as currency in ARS.

#### Scenario: Dashboard loads with all cards

- GIVEN a logged-in admin
- WHEN they visit `/dashboard`
- THEN 4 cards are rendered: "Productos", "Pedidos Pendientes", "Clientes", "Ingresos del Mes"
- AND each card shows the current value and a trend arrow

#### Scenario: Cards show loading skeleton

- GIVEN the dashboard is loading data
- WHEN the API has not yet responded
- THEN each card shows a pulsing skeleton placeholder instead of the value

#### Scenario: Cards show error state

- GIVEN the summary API fails
- WHEN the dashboard renders
- THEN each errored card shows a warning icon and "Error al cargar"
- AND a "Reintentar" button appears

#### Scenario: Clicking a card navigates to module

- GIVEN the dashboard is rendered
- WHEN the admin clicks a card
- THEN they navigate to the corresponding module
- AND "Productos" navigates to `/dashboard/catalog/products`
- AND "Pedidos Pendientes" navigates to `/dashboard/orders?status=pending`
- AND "Clientes" navigates to `/dashboard/customers`
- AND "Ingresos del Mes" navigates to `/dashboard/orders`

### Requirement: Recent Orders Widget

The dashboard MUST show a "Pedidos Recientes" widget listing the last 10 orders. Each row SHALL display: order ID (truncated prefix), customer name, total (formatted), status as a color-coded badge, and date. Status badge colors: `PENDING_PAYMENT` → yellow, `PAID` → blue, `PROCESSING` → indigo, `SHIPPED` → purple, `DELIVERED` → green, `CANCELLED` → red, `REFUNDED` → orange.

#### Scenario: Recent orders widget renders

- GIVEN the dashboard is loaded
- WHEN orders are available
- THEN the "Pedidos Recientes" widget shows the last 10 orders with all columns
- AND each status badge uses the correct color

#### Scenario: No recent orders

- GIVEN there are no orders
- WHEN the widget renders
- THEN it shows "No hay pedidos recientes"

### Requirement: Quick Actions

The dashboard SHALL display a "Acciones Rápidas" section with 3 buttons: "Crear Producto", "Ver Pedidos", "Ver Clientes". Each button SHALL navigate to the corresponding module page.

#### Scenario: Quick actions render

- GIVEN the dashboard is loaded
- WHEN the admin sees the quick actions section
- THEN 3 action buttons are rendered with labels in Spanish

### Requirement: Data Refreshes Automatically

All dashboard queries MUST use React Query's `refetchInterval` or `staleTime` to ensure data is periodically refreshed. The summary cards SHALL refresh every 60 seconds. The recent orders widget SHALL refresh every 30 seconds.

#### Scenario: Dashboard auto-refreshes

- GIVEN the dashboard page is open
- WHEN 60 seconds pass
- THEN summary card data refetches silently in the background
- AND the UI updates if new data differs

## Routes

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET | /api/v1/dashboard/summary | AdminJWT | dashboard.read | Get summary metrics (products, pending orders, customers, revenue) |
| GET | /api/v1/orders?limit=10&sortBy=createdAt&sortOrder=desc | AdminJWT | order.read | Recent orders for widget |
