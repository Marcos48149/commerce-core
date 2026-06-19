# Admin Dashboard — Customer Management (Phase 4)

## Purpose

The customer management module enables admins to search and view customer profiles, including their order history and saved addresses.

## Requirements

### Requirement: Customers List with Search

The customers list MUST display in a table with columns: email, displayName, phone, total orders count, and created date. A search input SHALL allow searching by email or displayName. Pagination defaults to 20 per page.

#### Scenario: Admin searches customer by email

- GIVEN the customers list has 50 customers
- WHEN the admin types "juan@example.com" in the search input
- THEN only customers whose email or displayName matches the query are shown

#### Scenario: Pagination works

- GIVEN there are more than 20 customers
- WHEN the customers list loads
- THEN page 1 shows the first 20 customers
- AND pagination controls allow navigating to page 2

### Requirement: Customer Detail with Order History

The customer detail page (`/dashboard/customers/:id`) MUST show: profile info (email, displayName, phone, created date), a paginated order history table (order ID, date, status badge, total), and an addresses list (type, line1, city, province, country). The order history table SHALL support the same pagination pattern as the customer list.

#### Scenario: Admin clicks customer

- GIVEN the customers list is displayed
- WHEN the admin clicks a customer row
- THEN they navigate to `/dashboard/customers/:id`
- AND the profile info section renders with email, displayName, phone, and created date

#### Scenario: Customer order history loads

- GIVEN a customer has 5 orders
- WHEN the customer detail page loads
- THEN the order history table shows all 5 orders with order ID, date, status, and total

#### Scenario: Customer addresses display

- GIVEN a customer has saved addresses
- WHEN the customer detail page loads
- THEN a list of addresses renders showing type, line1, city, province, country for each

## Routes

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET | /api/v1/customers/me | AdminJWT | customer.read | This is for customer self — we need admin-scoped |
| GET | /api/v1/customers | CustomerJWT | customer.read | List customers (admin-scoped, tenant filtered) |
| GET | /api/v1/customers/:id | CustomerJWT | customer.read | Get customer detail |
| GET | /api/v1/customers/:id/orders | CustomerJWT | order.read | List orders for a customer |

Note: Admin-facing customer endpoints use the same controller path guarded by `admin.read` / `customer.read` permission checks, scoped to the admin's tenant.
