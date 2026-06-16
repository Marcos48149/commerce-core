# Customer Identity Module — Spec

## Routes

All under `/api/v1/customers/auth` and `/api/v1/customers/me`.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/customers/auth/register | Public | Register new customer |
| POST | /api/v1/customers/auth/login | Public | Customer login |
| POST | /api/v1/customers/auth/refresh | Public | Refresh customer token |

### Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/customers/me | CustomerJWT | Get profile |
| PUT | /api/v1/customers/me | CustomerJWT | Update profile |

### Addresses

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/customers/me/addresses | CustomerJWT | List addresses |
| POST | /api/v1/customers/me/addresses | CustomerJWT | Create address |
| PUT | /api/v1/customers/me/addresses/:id | CustomerJWT | Update address |
| DELETE | /api/v1/customers/me/addresses/:id | CustomerJWT | Delete address |

## Auth Strategy

- Separate JWT key pair: `CUSTOMER_JWT_PRIVATE_KEY` / `CUSTOMER_JWT_PUBLIC_KEY`
- Fallback to ephemeral RS256 like admin JWT if env vars not set
- CustomerJwtStrategy (name: 'customer-jwt') — validates against Customer model, not Admin
- CustomerJwtAuthGuard wraps AuthGuard('customer-jwt')

## Customer Token Payload

```ts
interface CustomerTokenPayload {
  sub: string;       // customerId
  email: string;
  storeId: string;
  type: 'access' | 'refresh';
}
```

## Implementation Pattern

- Module: `apps/api/src/customer-identity/customer-identity.module.ts`
- Repository: abstract class `CustomerRepository` with `@Injectable()`
- Use cases: `RegisterCustomerUseCase`, `LoginCustomerUseCase`, `RefreshCustomerTokenUseCase`, `GetCustomerProfileUseCase`, `UpdateCustomerProfileUseCase`, `ManageAddressesUseCase`
- Controller: `CustomerAuthController`, `CustomerProfileController`
- DTOs with class-validator + @ApiProperty()
