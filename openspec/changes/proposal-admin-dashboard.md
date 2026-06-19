# Proposal: Admin Dashboard

## Change Name
admin-dashboard

## Problem
The commerce-core platform has no admin panel — all backoffice operations require direct API calls.

## Scope
### Phase 0: Foundation
- Initialize Shadcn/ui with Tailwind v4
- Install and configure React Query
- Fix auth login response mapping
- Build sidebar navigation with all module links
- Add Store Switcher for SuperAdmin
- Configure Spanish locale for UI text
- Export all new providers and components

### Phase 1: Core Dashboard
- Summary cards (total products, orders, customers, revenue)
- Recent orders list widget
- Quick action buttons

### Phase 2: Catalog Management
- Products: list with search/filter, create/edit form with variants, detail view
- Categories: list, create, edit, delete
- Collections: list, create, edit, delete

### Phase 3: Order Management
- Orders list with status filters and pagination
- Order detail with items, timeline, customer info
- Order actions: confirm, cancel, refund

### Phase 4: Customer Management
- Customers list with search
- Customer detail with order history

### Phase 5: Promotions
- Promotions list, create, edit, delete
- Coupon management within promotions

### Phase 6: IAM
- Admins list, create, edit, soft-delete
- Roles list, create, edit, delete (system role protection)
- Permissions listing (read-only, grouped)
- API keys list, create (show raw key once), revoke

### Phase 7: Tenant & Store Settings
- Tenant profile view/edit
- Stores list, create, edit, delete
- Plans list, create, edit, delete

### Phase 8: System
- Webhooks list, create, edit, delete
- Audit logs list with filters
- Shipping methods list, create, edit, delete

## Architecture
- Shadcn/ui for all components (design system)
- React Query (TanStack Query) for server state management
- Existing Axios ApiClient from @commerce/api-client
- Spanish hardcoded in UI strings (no i18n library for v1)
- Route groups: (auth) for login, (dashboard) for everything else
- Layout: sidebar (collapsible) + top navbar + content area
- Store context: SuperAdmin can switch, regular admin is locked
- Responsive design (mobile-first with sidebar drawer)

## Non-Goals (v1)
- Dark mode
- Real-time notifications / WebSocket
- Drag-and-drop dashboard customization
- Export to CSV/PDF
- Role-based UI element hiding (use API permissions only)

## Risks and Mitigations
- 400-line budget will be exceeded for every phase — frontend has lots of boilerplate and generated component code. Mitigation: use size:exception for all phases or raise budget.
- Tailwind v4 + Shadcn compatibility needs verification during init. Mitigation: use --force flag or compatible shadcn version.
- API response shapes may not match frontend expectations. Mitigation: build typed API layer in api-client package.

## Estimated Size
~8,000-12,000 lines across all 8 phases (very rough)
Recommended: stack PRs by phase, or use size:exception for the whole thing.
