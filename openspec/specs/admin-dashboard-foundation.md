# Admin Dashboard — Foundation (Phase 0)

## Purpose

The foundation layer sets up the UI framework, auth integration, layout shell, and shared context providers that all subsequent dashboard phases depend on. It ensures the admin panel bootstraps with the correct design system, authentication mapping, and responsive shell.

## Requirements

### Requirement: Shadcn/ui Initialized with Tailwind v4

The project MUST initialize Shadcn/ui using a version compatible with Tailwind v4. The `components.json` configuration MUST point to `apps/dashboard/src/components/ui` for components and `apps/dashboard/src/lib/utils` for utilities. The global CSS MUST use Tailwind v4 `@import "tailwindcss"` syntax and include Shadcn's CSS variables for light mode.

#### Scenario: Initialize Shadcn via CLI

- GIVEN the dashboard app at `apps/dashboard`
- WHEN `npx shadcn@latest init` runs with `--force` flag
- THEN `components.json` is created with the correct paths
- AND global CSS includes Tailwind v4 directives and Shadcn CSS variables

#### Scenario: Add first component

- GIVEN Shadcn is initialized
- WHEN `npx shadcn@latest add button` runs
- THEN `apps/dashboard/src/components/ui/button.tsx` is created
- AND the component renders correctly in the app

### Requirement: React Query Provider Wraps App

The app MUST wrap its root layout with a `QueryClientProvider` from TanStack React Query. The `QueryClient` MUST be configured with `defaultOptions` including `staleTime: 30_000` (30 seconds) and `retry: 1`. The provider MUST live in a `providers.tsx` file under `apps/dashboard/src/app`.

#### Scenario: Data fetching works via React Query

- GIVEN the app is wrapped with QueryClientProvider
- WHEN a component uses `useQuery` to fetch data
- THEN the query executes via the configured ApiClient
- AND cached data respects the 30-second staleTime

#### Scenario: Stale data auto-refreshes

- GIVEN a query has cached data past staleTime
- WHEN the component re-renders or refocuses
- THEN React Query refetches in the background

### Requirement: Auth Login Maps API Response Correctly

The login flow MUST call `POST /api/v1/auth/login` with `{ email, password }`. The API returns `{ success: true, data: { accessToken, refreshToken, admin: { id, email, displayName } } }`. The frontend MUST extract `data.accessToken`, `data.refreshToken`, and `data.admin` into an `AuthSession` type. The token MUST be stored in memory (not localStorage) and attached via an Axios interceptor as `Authorization: Bearer <token>`. The `admin` payload MUST also include `isSuperAdmin` for role gating.

#### Scenario: Successful login creates session

- GIVEN an admin with valid credentials
- WHEN they submit the login form
- THEN the API returns `{ success: true, data: { accessToken, refreshToken, admin: { id, email, displayName, isSuperAdmin } } }`
- AND the frontend creates an AuthSession with all fields
- AND redirects to `/dashboard`

#### Scenario: Invalid credentials show error

- GIVEN an admin with invalid credentials
- WHEN they submit the login form
- THEN the API returns 401
- AND the frontend shows an error message in Spanish: "Credenciales inválidas"

### Requirement: Sidebar Navigation with All Module Links

The sidebar MUST contain links to all dashboard modules: Dashboard, Catálogo, Pedidos, Clientes, Promociones, IAM, Tienda, Sistema. Each link MUST show an icon (from lucide-react), the module name in Spanish, and highlight the active route using `usePathname()`. The sidebar MUST be collapsible via a toggle button that changes width from 64px (collapsed, icons only) to 256px (expanded, icons + labels).

#### Scenario: Sidebar shows all modules

- GIVEN a logged-in admin
- WHEN they land on any dashboard page
- THEN the sidebar shows all 8 module links with icons and Spanish labels
- AND the active module's link is visually highlighted

#### Scenario: Sidebar toggles collapse

- GIVEN the sidebar is expanded
- WHEN the admin clicks the collapse toggle
- THEN the sidebar shrinks to 64px showing only icons
- AND the toggle button rotates its chevron icon

### Requirement: Top Navbar with Admin Info

A top navbar MUST span the content area showing: the app name "Commerce Core" on the left, a store switcher dropdown (only for SuperAdmin), the admin's `displayName`, and a logout button. The navbar MUST be fixed at the top with `h-16`.

#### Scenario: Admin sees navbar

- GIVEN a logged-in admin
- WHEN any dashboard page renders
- THEN the top navbar shows "Commerce Core", the admin's displayName, and a logout button

#### Scenario: SuperAdmin sees store switcher

- GIVEN `admin.isSuperAdmin` is true
- WHEN the navbar renders
- THEN a store switcher dropdown appears between the app name and admin name
- AND the switcher lists all stores from `GET /api/v1/stores`

#### Scenario: Regular admin does NOT see store switcher

- GIVEN `admin.isSuperAdmin` is false
- WHEN the navbar renders
- THEN the store switcher is NOT rendered

### Requirement: StoreContext Provides Store Switching

A `StoreContext` (React Context) MUST hold the current `storeId` and `storeName`. For SuperAdmin, changing the store in the navbar switcher updates the context and refetches all data. For regular admins, the store is locked to their assigned `storeId` from the JWT. All data-fetching hooks MUST read `storeId` from this context and pass it to API calls.

#### Scenario: SuperAdmin switches store

- GIVEN a SuperAdmin viewing the dashboard
- WHEN they select a different store from the switcher
- THEN StoreContext updates with the new storeId
- AND React Query invalidates all queries, refetching data for the new store

#### Scenario: Regular admin store is locked

- GIVEN a regular admin
- WHEN they inspect StoreContext
- THEN storeId matches their JWT claim
- AND the switcher is not rendered

### Requirement: UI Text in Spanish, Code in English

All user-facing UI strings MUST be in Spanish (Argentina locale). All code identifiers (variable names, function names, file names, TypeScript types, interfaces, props) MUST be in English. No i18n library is used for v1 — Spanish strings are hardcoded directly in components.

#### Scenario: UI renders in Spanish

- GIVEN any dashboard page
- WHEN the page renders
- THEN all labels, buttons, placeholders, and error messages are in Spanish

### Requirement: Responsive Sidebar Becomes Drawer on Mobile

On screens below 768px, the sidebar MUST be hidden by default. A hamburger icon in the top navbar opens it as an overlay drawer (from the left, full width). The drawer closes when a navigation link is clicked or when clicking outside.

#### Scenario: Mobile sidebar hidden by default

- GIVEN a viewport width < 768px
- WHEN the dashboard loads
- THEN the sidebar is not visible
- AND a hamburger icon appears in the top navbar

#### Scenario: Hamburger opens drawer

- GIVEN the sidebar is hidden on mobile
- WHEN the admin taps the hamburger icon
- THEN a full-width overlay drawer slides in from the left
- AND all module links are visible

#### Scenario: Drawer closes on navigation

- GIVEN the mobile drawer is open
- WHEN the admin taps a navigation link
- THEN the drawer closes
- AND the page navigates to the selected route

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/auth/login | Public | Admin login |
| POST | /api/v1/auth/refresh | Public | Refresh access token |
| GET | /api/v1/iam/me | AdminJWT | Get current admin profile |
| GET | /api/v1/stores | AdminJWT + store.read | List stores (for SuperAdmin switcher) |
