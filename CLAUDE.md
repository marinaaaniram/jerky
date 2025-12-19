# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Jerky v2** is a full-stack delivery management system for tracking orders, customers, products, and payments. The system enforces strict business rules around order delivery, customer debt tracking, and inventory management.

**Tech Stack**:
- Backend: NestJS 10 + TypeORM 0.3 + PostgreSQL 15
- Frontend: React 18 + Vite 5 + Mantine v7 + TanStack Query
- Auth: Passport JWT with 5 role-based access levels
- Deployment: Docker Compose with hot reload support

## Quick Start

### Backend
```bash
cd backend
npm install
npm run start:dev              # Watch mode with hot reload
npm run seed:run               # Populate test data
```

### Frontend
```bash
cd frontend
npm install
npm run dev                    # Vite dev server (localhost:5173)
```

### Full Stack (Docker)
```bash
docker-compose up --build      # All services with Postgres
```

**Ports**: Backend (3000), Frontend (5173), Postgres (5432)

## Common Development Commands

### Backend
- `npm run build` - Compile TypeScript
- `npm run test` - Run unit tests
- `npm run test:watch` - Watch mode
- `npm run test:e2e` - E2E tests
- `npm run lint` - ESLint with auto-fix
- `npm run migration:run` - Apply pending migrations
- `npm run migration:generate` - Create from entity changes
- `npm run seed:run` - Run database seeders

### Frontend
- `npm run build` - Production build
- `npm run lint` - ESLint
- `npm run preview` - Preview build locally

## Architecture

### Backend Structure (`/backend/src/`)

The backend follows a modular NestJS pattern with 10 core entities:

**Core Entities**:
1. **Order** - Status flow: NEW → ASSEMBLING → TRANSFERRED → DELIVERED
2. **OrderItem** - Line items with quantity and price
3. **Customer** - Payment types: DIRECT or CONSIGNMENT
4. **Product** - Catalog with pricing and stock
5. **User** - Email-based auth with bcrypt hashing
6. **Role** - 5 predefined roles (Руководитель, Менеджер по продажам, Кладовщик, Курьер, Наблюдатель)
7. **DeliverySurvey** - MANDATORY before order delivery (stores photo, notes)
8. **Payment** - Customer payment tracking
9. **StockMovement** - Audit trail for inventory changes
10. **PriceRule** - Special customer-product pricing

**Key Modules**:
- `orders/` - Complex transactional delivery logic
- `auth/` - JWT authentication with Passport
- `customers/`, `products/`, `users/` - CRUD operations
- `database/` - Migrations and seeders

### Critical Business Logic

**Order Delivery Transaction** (`orders.service.ts:deliverOrder()`):
- Opens atomic query runner
- Verifies delivery survey exists
- Updates order status to DELIVERED
- If customer is CONSIGNMENT, adds order total to debt
- Reduces product stock
- Creates StockMovement audit records
- Commits or rolls back entire transaction

**Price Rule Resolution** (`orders.service.ts:addItem()`):
- Checks PriceRule table for customer-product override
- Falls back to product default price if no rule exists

### Frontend Architecture (`/frontend/src/`)

**State Management**:
- **Zustand** (`store/authStore.ts`) - Auth state with localStorage persistence
- **TanStack Query** - Server state (orders, products, customers)
- Custom hooks: `useOrders()`, `useProducts()`, `useCustomers()`

**API Client** (`api/client.ts`):
- Axios instance with JWT interceptor
- Automatically injects token into Authorization header
- Centralized error handling

**Routing**:
- React Router v6
- ProtectedRoute checks `isAuthenticated` flag
- Redirects unauthenticated users to login

**UI Framework**: Mantine v7 components + Hooks

## Database

### Connection
- Host: localhost (env var: `DATABASE_HOST`)
- Port: 5432
- Database: `jerky`
- Credentials: `jerky_user` / `jerky_password` (change in production)

### Seeders (`/backend/src/database/seeders/`)
Run `npm run seed:run` to populate:
- 5 roles
- Admin user + test users
- Test customers (both DIRECT and CONSIGNMENT payment types)
- Products with pricing
- Special price rules

### Migrations
- Located in `/backend/src/database/migrations/`
- Generate from entities: `npm run migration:generate -n MigrationName`
- Run: `npm run migration:run`
- Revert: `npm run migration:revert`

## Authentication & Authorization

### Guards (apply to routes)
- `JwtAuthGuard` - Validates JWT tokens
- `RolesGuard` - Validates user role

### Decorators (use in controllers)
- `@CurrentUser()` - Injects authenticated user object
- `@Roles('Руководитель')` - Requires specific role

### Example Protected Route
```typescript
@Post('orders/:id/deliver')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Кладовщик')
async deliverOrder(@Param('id') id: string, @CurrentUser() user: User) {
  return this.ordersService.deliverOrder(id, user);
}
```

## Key Development Patterns

### NestJS Module Structure
Each feature follows this pattern:
```
feature/
├── feature.module.ts       # @Module imports/exports
├── feature.service.ts      # Business logic
├── feature.controller.ts   # HTTP routes
├── entities/
│   └── feature.entity.ts   # @Entity with columns and relations
└── dto/
    ├── create-feature.dto.ts
    └── update-feature.dto.ts
```

### Transaction Pattern (Orders)
```typescript
async deliverOrder(id: string) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();
  try {
    // Atomic operations
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

### Frontend API Hooks
```typescript
// In hooks/useOrders.ts
const { data, isLoading, error } = useQuery({
  queryKey: ['orders'],
  queryFn: () => orderAPI.getAll(),
});
```

## Environment Configuration

### Backend (.env)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=jerky
DATABASE_USER=jerky_user
DATABASE_PASSWORD=jerky_password
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3000
```

### Frontend (.env or .env.local)
```
VITE_API_URL=http://localhost:3000
```

## Important Business Rules

1. **Order Status**: ONE-WAY flow only (no status downgrades)
2. **Delivery Requirement**: DeliverySurvey MUST exist before marking order as DELIVERED
3. **Debt Calculation**: CONSIGNMENT customers accumulate debt on delivery
4. **Stock Deduction**: Automatic on order delivery (if any item quantity exceeds stock, transaction rolls back)
5. **Special Pricing**: PriceRule checked per customer-product; falls back to product price
6. **Roles**: 5 predefined roles with permission checks on sensitive endpoints

## Testing

### Backend
- Unit tests in `test/` directory
- Run: `npm run test` or `npm run test:watch`
- E2E: `npm run test:e2e`
- Coverage: `npm run test:cov`

### Frontend
- Vitest configured
- Run tests with `npm run test` (if configured)

## Common Issues & Solutions

### Database Connection Issues
- Ensure PostgreSQL is running (check `docker-compose up` for Postgres service)
- Verify .env credentials match `docker-compose.yml`
- Check `DATABASE_HOST` is set correctly

### JWT Token Expiration
- Default: 7 days (set via `JWT_EXPIRES_IN`)
- Frontend clears localStorage on expiration
- Re-login required for new token

### DeliverySurvey Requirement
- If `deliverOrder()` fails with "survey not found", must create survey first
- Photo stored as base64 - use multi-part form with image upload in frontend

## Useful File References

**Backend Configuration**:
- Database: `backend/src/config/database.config.ts`
- Main entry: `backend/src/main.ts`
- Root module: `backend/src/app.module.ts`

**Frontend Configuration**:
- Vite: `frontend/vite.config.ts`
- Main router: `frontend/src/App.tsx`
- API client: `frontend/src/api/client.ts`

**Deployment**:
- Docker compose: `docker-compose.yml`
- Backend Dockerfile: `backend/Dockerfile`
- Frontend Dockerfile: `frontend/Dockerfile`

**Documentation**:
- Main README: `README.md`
- This file: `CLAUDE.md`
