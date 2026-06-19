# Design: Admin Dashboard

## Technical Approach

Monorepo Next.js App Router admin panel at `apps/dashboard/`. All pages are `'use client'` — SSR adds no value for an interactive admin SPA. React Query (TanStack Query) handles all server state with a 30s staleTime baseline. Auth tokens live in memory (localStorage for persistence across reloads) attached via Axios interceptor. Shadcn/ui primitives provide the design system, with a custom DataTable wrapper for list pages. Spanish UI strings hardcoded (no i18n library for v1).

## Architecture Decisions

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| Server Components vs Client Components | Server components reduce JS bundle but admin panel is 100% interactive — every page has forms, tables, dialogs. SSR would add complexity with no cache benefit for authenticated-only pages. | All pages `'use client'` |
| Shadcn DataTable vs custom DataTable | Shadcn's `@tanstack/react-table` wrapper is good but hard to customize per-module for search/filter/pagination. | Custom `DataTable` shared component wrapping `@tanstack/react-table` directly |
| i18n library vs hardcoded strings | next-intl/react-i18next adds setup, key management, and compilation overhead for a single-locale v1. | Hardcoded Spanish strings; extract constants file if reuse warrants it |
| localStorage vs httpOnly cookie for tokens | Cookies are more secure but require server cooperation for refresh flow. The API already expects `Authorization: Bearer` header. | localStorage with JWT expiry check on load |
| Single Axios instance vs per-request client | A shared instance with token setter is simpler. The `ApiClient` class already supports `setToken()`. | Single `ApiClient` instance stored in module closure, token set after login |

## Data Flow

```
LoginPage
  │ POST /auth/login → { success, data: { accessToken, refreshToken, admin } }
  │ map → AuthSession
  │ setToken(accessToken) on ApiClient
  │ storeAuth(session) to localStorage
  ▼
AuthProvider (session state)
  │
  ├── StoreProvider
  │     │ GET /stores → populate stores[]
  │     │ SuperAdmin: dropdown switcher → setCurrentStore
  │     │ Regular admin: storeId locked from JWT
  │     ▼
  ├── QueryProvider (QueryClientProvider)
  │     │ all hooks read useStore().currentStore.id
  │     ▼
  └── DashboardLayout
        ├── Sidebar (collapsible, highlights active route)
        ├── Navbar (store-switcher, user-nav, breadcrumbs)
        └── {children} (page content via React Router)
              │
              ├── useQuery(['products', storeId, filters], fn)
              │     → GET /api/v1/catalog/products?search=&page=&sort=
              │     → returns { data, total, page, totalPages }
              │     → DataTable renders rows + pagination
              │
              └── useMutation(POST/PUT/DELETE)
                    onSuccess → invalidateQueries(['products', ...])
                    → toast success
```

## Auth Flow Fix

The current `auth-provider.tsx:44` calls `client.post<AuthSession>('/auth/login', ...)` but the API wraps the response in `{ success, data: { accessToken, refreshToken, admin: { id, email, displayName, isSuperAdmin } } }`. The `ApiClient.get<T>()` returns `response.data` (the unwrapped Axios data), so `result` is `LoginResponse`, not `AuthSession`.

**Fix**: Map in the login callback:

```
const result = await client.post<LoginResponse>('/auth/login', { email, password });
const session: AuthSession = {
  adminId: result.admin.id,
  email: result.admin.email,
  displayName: result.admin.displayName,
  isSuperAdmin: result.admin.isSuperAdmin ?? false,
  accessToken: result.accessToken,
  refreshToken: result.refreshToken,
};
storeAuth(session);
setSession(session);
```

Also add `isSuperAdmin: boolean` to `LoginResponse.admin` in `packages/api-client/src/types/index.ts`.

## Token Refresh

Current `ApiClient` clears token on 401 but doesn't refresh. Minimal v1 approach: on 401, attempt `POST /auth/refresh` with the stored refreshToken, update the token on success, redirect to `/login` on failure. Implement as a response interceptor in `api.ts`:

```
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status !== 401 || !refreshToken) return Promise.reject(error);
    try {
      const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
      setToken(data.accessToken);
      error.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return http.request(error.config);
    } catch {
      clearAuth(); redirect('/login');
      return Promise.reject(error);
    }
  }
);
```

## Multi-Store Architecture

- `StoreProvider` holds `currentStore: Store | null`, `stores: Store[]`, and setters
- On login (when `isSuperAdmin`), fetch `GET /api/v1/stores` and populate `stores[]`
- SuperAdmin sees `StoreSwitcher` in navbar; selection calls `setCurrentStore(store)`
- Regular admin: `isSuperAdmin === false`, no switcher, storeId extracted from JWT payload
- All React Query hooks read `useStore().currentStore?.id` and include it in queryKey and API params
- Store switch triggers `queryClient.invalidateQueries()` to refetch all data for the new store

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/dashboard/src/providers/auth-provider.tsx` | Modify | Map login response to AuthSession; add refresh interceptor |
| `apps/dashboard/src/lib/api.ts` | Modify | Return singleton client; attach refresh interceptor |
| `apps/dashboard/src/lib/auth.ts` | Modify | Add refresh token storage/retrieval |
| `apps/dashboard/src/providers/store-provider.tsx` | Modify | Load stores on auth, support locked store for non-super |
| `apps/dashboard/src/providers/query-provider.tsx` | Create | React Query provider wrapper with defaults |
| `apps/dashboard/src/app/providers.tsx` | Modify | Add QueryProvider after StoreProvider |
| `apps/dashboard/src/app/layout.tsx` | Modify | Change `<html lang="en">` to `<html lang="es">` |
| `apps/dashboard/src/app/(auth)/login/page.tsx` | Modify | Spanish labels, error messages, form UI |
| `apps/dashboard/src/app/(dashboard)/layout.tsx` | Rewrite | Sidebar + Navbar layout shell |
| `apps/dashboard/src/app/(dashboard)/dashboard/page.tsx` | Rewrite | Summary cards, recent orders, quick actions |
| `apps/dashboard/src/components/layout/sidebar.tsx` | Create | Collapsible sidebar with all module links |
| `apps/dashboard/src/components/layout/navbar.tsx` | Create | Top navbar with store-switcher, user-nav, breadcrumbs |
| `apps/dashboard/src/components/layout/store-switcher.tsx` | Create | Store dropdown for SuperAdmin |
| `apps/dashboard/src/components/layout/user-nav.tsx` | Create | Admin name + logout button |
| `apps/dashboard/src/components/shared/data-table.tsx` | Create | Generic DataTable with sort/search/pagination |
| `apps/dashboard/src/components/shared/search-input.tsx` | Create | Search input with debounce |
| `apps/dashboard/src/components/shared/pagination.tsx` | Create | Page navigation controls |
| `apps/dashboard/src/components/shared/status-badge.tsx` | Create | Color-coded status badges |
| `apps/dashboard/src/components/shared/confirm-dialog.tsx` | Create | Modal confirmation dialog |
| `apps/dashboard/src/components/shared/loading-skeleton.tsx` | Create | Pulsing skeleton placeholders |
| `apps/dashboard/src/components/shared/empty-state.tsx` | Create | Empty state illustration + message |
| `apps/dashboard/src/components/shared/error-state.tsx` | Create | Error state with retry button |
| `apps/dashboard/src/components/shared/page-header.tsx` | Create | Page title + action button pattern |
| `apps/dashboard/src/hooks/use-products.ts` | Create | React Query hooks for products CRUD |
| `apps/dashboard/src/hooks/use-orders.ts` | Create | React Query hooks for orders |
| `apps/dashboard/src/hooks/use-customers.ts` | Create | React Query hooks for customers |
| `apps/dashboard/src/hooks/use-categories.ts` | Create | React Query hooks for categories |
| `apps/dashboard/src/hooks/use-collections.ts` | Create | React Query hooks for collections |
| `apps/dashboard/src/hooks/use-promotions.ts` | Create | React Query hooks for promotions |
| `apps/dashboard/src/hooks/use-admins.ts` | Create | React Query hooks for admin management |
| `apps/dashboard/src/hooks/use-roles.ts` | Create | React Query hooks for roles |
| `apps/dashboard/src/hooks/use-api-keys.ts` | Create | React Query hooks for API keys |
| `apps/dashboard/src/hooks/use-tenant.ts` | Create | React Query hooks for tenant |
| `apps/dashboard/src/hooks/use-stores.ts` | Create | React Query hooks for stores |
| `apps/dashboard/src/hooks/use-plans.ts` | Create | React Query hooks for plans |
| `apps/dashboard/src/hooks/use-webhooks.ts` | Create | React Query hooks for webhooks |
| `apps/dashboard/src/hooks/use-audit-logs.ts` | Create | React Query hooks for audit logs |
| `apps/dashboard/src/hooks/use-shipping.ts` | Create | React Query hooks for shipping methods |
| `apps/dashboard/src/hooks/use-dashboard.ts` | Create | React Query hooks for dashboard summary |
| `apps/dashboard/src/lib/constants.ts` | Create | API base URL, status labels, route paths |
| `apps/dashboard/src/lib/utils.ts` | Modify | Add `cn()` helper (shadcn requirement) |
| `apps/dashboard/src/app/globals.css` | Modify | Tailwind v4 + Shadcn CSS variables |
| `packages/api-client/src/types/index.ts` | Modify | Add `isSuperAdmin` to `LoginResponse.admin` |

## Component Tree

```
RootLayout
└── Providers
    ├── AuthProvider
    │   └── StoreProvider
    │       └── QueryProvider
    │           ├── (auth)/layout.tsx
    │           │   └── LoginPage
    │           │       ├── EmailInput
    │           │       ├── PasswordInput
    │           │       └── SubmitButton + ErrorMessage
    │           │
    │           └── (dashboard)/layout.tsx
    │               ├── Sidebar
    │               │   ├── Logo
    │               │   ├── NavLinks[] (icon + label, active highlight)
    │               │   └── CollapseToggle
    │               ├── Navbar
    │               │   ├── MobileMenuToggle (hamburger, < 768px)
    │               │   ├── Breadcrumbs
    │               │   ├── StoreSwitcher (SuperAdmin only)
    │               │   └── UserNav (displayName + logout)
    │               └── Content ({children})
    │
    ├── DashboardPage
    │   ├── SummaryCards[]
    │   │   └── SummaryCard (icon, value, label, trend, onClick → route)
    │   ├── RecentOrdersWidget
    │   │   └── OrderRow[] (id, customer, total, status, date)
    │   └── QuickActions
    │       └── ActionButton[]
    │
    ├── ListPage (generic pattern per module)
    │   ├── PageHeader (title, "Crear" button)
    │   ├── FiltersBar (search, status filter, date range)
    │   └── DataTable
    │       ├── TableHeader (sortable columns)
    │       ├── TableBody
    │       │   └── Row[] (cells + ActionsMenu: edit/delete)
    │       └── Pagination
    │
    └── FormPage (generic pattern per module)
        ├── PageHeader (title, back button)
        └── Form (react-hook-form + zod)
            ├── FormFields[]
            ├── VariantEditor (products only, inline)
            └── FormActions ("Guardar", "Cancelar")
```

## Key Design Patterns

### Query Hook Pattern

All hooks follow the same pattern. Example `use-products.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useStore } from '@/providers/store-provider';

export function useProducts(filters: ProductFilters) {
  const { currentStore } = useStore();
  return useQuery({
    queryKey: ['products', currentStore?.id, filters],
    queryFn: () => api.get('/catalog/products', { params: filters }),
    staleTime: 30_000,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductDto) => api.post('/catalog/products', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
```

### DataTable Pattern

```tsx
<DataTable
  columns={[
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'price', label: 'Precio', sortable: true, render: (v) => formatARS(v) },
    { key: 'status', label: 'Estado', render: (v) => <StatusBadge value={v} /> },
    { key: 'actions', label: '', render: (_, row) => <ActionsMenu row={row} /> },
  ]}
  data={products}
  isLoading={isLoading}
  emptyMessage="No hay productos"
  error={error}
  onRetry={() => refetch()}
  sort={{ key: sortBy, order: sortOrder }}
  onSortChange={handleSort}
/>
```

### Sidebar Navigation (collapsible)

- Uses `usePathname()` to determine active link
- `localStorage` stores collapsed state
- Icons from `lucide-react`
- On mobile (< 768px): rendered as `Sheet` (drawer) via Shadcn

### Spanish UI Strategy

- All user-facing strings in Spanish (Argentina)
- Code identifiers in English
- No i18n library — strings hardcoded in components
- Date format: `dd/mm/yyyy` via `Intl.DateTimeFormat('es-AR')`
- Currency: `$` with `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`
- Status map: `PENDING_PAYMENT` → Pendiente, `PAID` → Pagado, `PROCESSING` → En proceso, `SHIPPED` → Enviado, `DELIVERED` → Entregado, `CANCELLED` → Cancelado, `REFUNDED` → Reembolsado

## Shadcn/ui Initialization

```bash
cd apps/dashboard
npx shadcn@latest init --force
```

If Tailwind v4 compatibility issues arise, manually create `components/ui/` with Button, Input, Select, Dialog, Sheet, DropdownMenu, Badge, Card, Toast (Sonner), Skeleton primitives. These are thin wrappers around Radix UI.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Auth session mapping, date/currency formatters | Pure function tests |
| Unit | React Query hooks (useProducts, useOrders) | Mock `api.get`, assert query key structure and storeId injection |
| Integration | Login flow (AuthProvider + api.ts interceptor) | Render LoginPage, mock fetch, verify session state |
| Integration | Layout (sidebar navigation, auth guard redirect) | Mock usePathname, assert active link highlights |
| E2E | Full CRUD flows per module | Playwright against dev API |

## Open Questions

- [ ] Confirm API response shape for `GET /api/v1/stores` — does it return `Store[]` directly or wrapped in `{ success, data }`?
- [ ] Confirm `isSuperAdmin` is included in JWT claims or in the login response payload
- [ ] Verify the refresh token endpoint path (`/auth/refresh` vs `/auth/token/refresh`)
- [ ] Confirm which shipping method type values the API expects in enum
