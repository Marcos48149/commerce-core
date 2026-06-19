# Tasks: Admin Dashboard

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~10,000+ |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Sequential phases each committed to main |
| Delivery strategy | exception-ok |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 0 | Foundation (shadcn, auth, layout, shared components) | main | size:exception per phase |
| 1 | Core Dashboard (summary cards, recent orders) | main | Depends on Phase 0 |
| 2 | Catalog Management (products, categories, collections) | main | Depends on Phase 0 |
| 3 | Order Management (list, detail, actions) | main | Depends on Phase 0 |
| 4 | Customer Management (list, detail) | main | Depends on Phase 0 |
| 5 | Promotions (promotions, coupons) | main | Depends on Phase 0 |
| 6 | IAM (admins, roles, permissions, API keys) | main | Depends on Phase 0 |
| 7 | Tenant & Store Settings (tenant, stores, plans) | main | Depends on Phase 0 |
| 8 | System (webhooks, audit logs, shipping) | main | Depends on Phase 0 |

---

## Phase 0: Foundation

### 0.1 Initialize Shadcn/ui and Base Setup
- [x] Run npx shadcn@latest init with Tailwind v4 compatible settings
- [x] Create components/ui/ with core primitives (button, input, dialog, dropdown, sheet, badge, card, table, form, toast, skeleton, avatar, select, separator, tooltip)
- [x] Add cn() utility to lib/utils.ts
- [x] Configure globals.css with shadcn CSS variables (light theme only for v1)
- [x] Install react-hook-form + zod + @hookform/resolvers

### 0.2 Configure React Query
- [x] Create providers/query-provider.tsx with QueryClientProvider
- [x] Add QueryProvider to providers.tsx (inside AuthProvider)
- [x] Configure default options (staleTime: 30s, retry: 1, refetchOnWindowFocus: false)

### 0.3 Fix Auth Login Flow
- [x] Update login in auth-provider.tsx to map LoginResponse (with success/data wrapper) to AuthSession
- [x] Add token refresh interceptor to ApiClient (on 401, try refresh, redirect to login on failure)
- [x] Test login flow with admin@commercecore.com / SuperAdmin123!

### 0.4 Build Sidebar Navigation
- [x] Create components/layout/sidebar.tsx with all module links and icons
- [x] Use Lucide icons for each module (LayoutDashboard, Package, Categories, ShoppingCart, Users, Tag, Shield, Building2, Globe, Webhook, ClipboardList, Truck)
- [x] Implement collapsible sidebar (minimized shows icons only)
- [x] Highlight active route based on pathname
- [x] Create components/layout/navbar.tsx with breadcrumbs + store switcher + user menu
- [x] Create components/layout/user-nav.tsx with admin name and logout
- [x] Create components/layout/store-switcher.tsx (dropdown for SuperAdmin, hidden for regular admin)
- [x] Update (dashboard)/layout.tsx to use sidebar + navbar

### 0.5 Create Shared Components
- [x] Create components/shared/data-table.tsx — sortable table with search, pagination, loading skeleton, empty state
- [x] Create components/shared/search-input.tsx
- [x] Create components/shared/pagination.tsx
- [x] Create components/shared/status-badge.tsx — color-coded badge (green=active, yellow=pending, red=cancelled, etc.)
- [x] Create components/shared/confirm-dialog.tsx — reusable delete/action confirmation
- [x] Create components/shared/loading-skeleton.tsx
- [x] Create components/shared/empty-state.tsx
- [x] Create components/shared/error-state.tsx with retry button
- [x] Create components/shared/page-header.tsx — title + description + action button pattern

### 0.6 Set up API Hooks Infrastructure
- [x] Create hooks/use-api.ts — base hook factory with auth token injection
- [x] Update lib/api.ts — update getApiClient() to handle token from localStorage and intercept 401 for refresh
- [x] Create lib/constants.ts — API_URL, store ID header name, etc.

### 0.7 Add isSuperAdmin to API Types
- [x] Add `isSuperAdmin: boolean` to LoginResponse.admin in packages/api-client/src/types/index.ts

### 0.8 Build Verification
- [x] Run pnpm --filter @commerce/dashboard build
- [x] Fix any TypeScript errors
- [ ] Verify login page loads and authenticates (manual — start dev server to test)
- [ ] Verify sidebar navigation renders all links (manual)

---

## Phase 1: Core Dashboard

### 1.1 Create Dashboard Summary Cards
- [ ] Create hooks/use-dashboard.ts with React Query hooks for stats
- [ ] Create components/dashboard/stats-card.tsx — single card with icon, value, label, trend
- [ ] Create components/dashboard/stats-grid.tsx — 4-card grid layout
- [ ] Build dashboard page with summary cards

### 1.2 Add Recent Orders Widget
- [ ] Create components/dashboard/recent-orders.tsx — table of last 10 orders with status badges
- [ ] Add quick action buttons (Create Product, View Orders, View Customers)

### 1.3 Build Verification
- [ ] Verify data loads and displays correctly
- [ ] Verify loading/error/empty states

---

## Phase 2: Catalog Management

### 2.1 Products List
- [ ] Create hooks/use-products.ts — useProducts(filters), useProduct(id), useCreateProduct(), useUpdateProduct(), useDeleteProduct()
- [ ] Create components/products/product-table.tsx — columns: image, name, SKU, price, stock, status, actions
- [ ] Build /products page with search, category filter, pagination
- [ ] Add status filter (active/inactive)

### 2.2 Create/Edit Product
- [ ] Create components/products/product-form.tsx — react-hook-form + zod validation
- [ ] Form fields: name, description, SKU, price, compareAtPrice, categories (multi-select), collections (multi-select), images (URL list), dimensions, weight
- [ ] Create components/products/variant-editor.tsx — inline add/remove variants with name, SKU, price, stock
- [ ] Build /products/new and /products/[id] pages
- [ ] Add delete product with confirm dialog

### 2.3 Categories
- [ ] Create hooks/use-categories.ts
- [ ] Create components/categories/category-table.tsx
- [ ] Build /categories page (list, create/edit modal, delete with cascade warning)

### 2.4 Collections
- [ ] Create hooks/use-collections.ts
- [ ] Create components/collections/collection-table.tsx
- [ ] Build /collections page (list, create/edit modal, delete)

### 2.5 Build Verification
- [ ] Test full CRUD for products with variants
- [ ] Test categories and collections CRUD

---

## Phase 3: Order Management

### 3.1 Orders List
- [ ] Create hooks/use-orders.ts
- [ ] Create components/orders/order-table.tsx — columns: ID, customer, status badge, total, items, date
- [ ] Build /orders page with status filter, date range, search

### 3.2 Order Detail
- [ ] Create components/orders/order-detail.tsx — customer info, shipping, items table
- [ ] Create components/orders/order-timeline.tsx — status history with dates
- [ ] Build /orders/[id] page
- [ ] Create components/orders/order-actions.tsx — confirm, cancel (with reason), refund (with amount)

### 3.3 Build Verification
- [ ] Test order status transitions
- [ ] Test cancel and refund flows

---

## Phase 4: Customer Management

### 4.1 Customers List
- [ ] Create hooks/use-customers.ts
- [ ] Create components/customers/customer-table.tsx
- [ ] Build /customers page with search

### 4.2 Customer Detail
- [ ] Build /customers/[id] page with profile info and order history table

### 4.3 Build Verification
- [ ] Test search and detail view

---

## Phase 5: Promotions

### 5.1 Promotions List
- [ ] Create hooks/use-promotions.ts
- [ ] Create components/promotions/promotion-table.tsx
- [ ] Build /promotions page with search and status filter

### 5.2 Create/Edit Promotion
- [ ] Create components/promotions/promotion-form.tsx — type (percentage/fixed), value, min purchase, dates, usage limit
- [ ] Build /promotions/new and /promotions/[id] pages

### 5.3 Coupon Management
- [ ] Create components/promotions/coupon-manager.tsx — list coupons for a promotion
- [ ] Add create coupon (code generator + manual), delete coupon

### 5.4 Build Verification
- [ ] Test full promotion CRUD with coupons

---

## Phase 6: IAM

### 6.1 Admin Management
- [ ] Create hooks/use-admins.ts
- [ ] Create components/iam/admin-table.tsx — email, displayName, roles, status, date
- [ ] Build /iam/admins page
- [ ] Create admin form (email, password, displayName, role assignment)
- [ ] Add soft-delete with confirm dialog

### 6.2 Role Management
- [ ] Create hooks/use-roles.ts
- [ ] Create components/iam/role-table.tsx — name, scope, permissions, system badge
- [ ] Build /iam/roles page
- [ ] Create role form with permission checkboxes grouped by category
- [ ] System roles: disable delete and rename

### 6.3 Permissions View
- [ ] Build /iam/permissions page — read-only list grouped by category

### 6.4 API Keys
- [ ] Create hooks/use-api-keys.ts
- [ ] Create components/iam/api-key-table.tsx — name, prefix, last used, status
- [ ] Build /iam/api-keys page
- [ ] Create API key form (name, scopes) — show raw key ONCE in modal with copy button
- [ ] Revoke/delete with confirm dialog

### 6.5 Build Verification
- [ ] Test admin CRUD with role assignment
- [ ] Test system role protection
- [ ] Test API key creation (verify raw key shown once)

---

## Phase 7: Tenant & Store Settings

### 7.1 Tenant Profile
- [ ] Create hooks/use-tenant.ts
- [ ] Build /tenant page — view/edit tenant name

### 7.2 Store Management
- [ ] Create hooks/use-stores.ts
- [ ] Create components/stores/store-table.tsx
- [ ] Build /stores page with CRUD

### 7.3 Plan Management
- [ ] Create hooks/use-plans.ts
- [ ] Create components/plans/plan-table.tsx
- [ ] Build /plans page with CRUD

### 7.4 Build Verification
- [ ] Test tenant edit, store CRUD, plan CRUD

---

## Phase 8: System

### 8.1 Webhook Management
- [ ] Create hooks/use-webhooks.ts
- [ ] Create components/webhooks/webhook-table.tsx
- [ ] Build /webhooks page with CRUD

### 8.2 Audit Logs
- [ ] Create hooks/use-audit-logs.ts
- [ ] Create components/audit-logs/audit-log-table.tsx
- [ ] Build /audit-logs page with filters (action, admin, date range)

### 8.3 Shipping Methods
- [ ] Create hooks/use-shipping.ts
- [ ] Create components/shipping/shipping-table.tsx
- [ ] Build /shipping page with CRUD

### 8.4 Build Verification
- [ ] Test webhook CRUD
- [ ] Test audit log filters
- [ ] Test shipping method CRUD

---

## Summary
- **Total tasks:** ~70
- **Estimated lines:** 8,000-12,000
- **Strategy:** size:exception (user approved)
- **Delivery:** sequential phases, each committed to main
