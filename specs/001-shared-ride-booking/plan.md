# Implementation Plan: Shared Ride Booking Platform

**Branch**: `001-shared-ride-booking` | **Date**: 2026-03-05 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-shared-ride-booking/spec.md`

## Summary

Build a full-stack ride-sharing web application enabling users to create, search, book, and manage shared or exclusive rides. The platform supports partial route matching, real-time notifications, user ratings, and implements a secure payment system with sliding-scale refund policies. MVP focuses on core booking functionality with Phase 2 deferring identity verification, gender preference enforcement, and advanced safety features.

**Primary Technical Approach**: Full-stack TypeScript application using TanStack Start (React SSR) for frontend/backend, Prisma ORM with PostgreSQL for data persistence, Better Auth for authentication, and shadcn/ui components for consistent UI. Real-time features implemented via Server-Sent Events (SSE) or WebSockets for notifications.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20+  
**Primary Dependencies**: 
- **Frontend**: React 19, TanStack Router, TanStack Query, shadcn/ui, Tailwind CSS 4.x
- **Backend**: TanStack Start (Nitro), Better Auth, Zod (validation)
- **Database**: PostgreSQL 15+, Prisma 7.x
- **Real-time**: Server-Sent Events (SSE) or Socket.io (TBD in research phase)
- **Payments**: Stripe API integration
- **Maps**: Google Maps API or Mapbox for geocoding, routing, distance calculation

**Storage**: PostgreSQL with Prisma ORM; connection pooling via Prisma; migrations managed via Prisma Migrate  
**Testing**: Vitest (unit/integration), React Testing Library (components), Playwright (E2E)  
**Target Platform**: Web application (Chrome/Firefox/Safari/Edge modern versions), responsive mobile-first design  
**Project Type**: Web (full-stack monorepo with TanStack Start)  
**Performance Goals**: 
- LCP < 2.5s, FID < 100ms, CLS < 0.1 (Core Web Vitals)
- API response p95 < 200ms
- Search queries < 500ms (database indexed)
- Support 500 concurrent users without degradation

**Constraints**: 
- Initial JS bundle < 200KB gzipped
- WCAG 2.1 AA accessibility compliance
- 80% test coverage for utilities, 70% for components
- Strict TypeScript (no `any` types without justification)

**Scale/Scope**: 
- MVP: 1-10k users, 20-30 screens/components, ~10k LOC
- Growth: 100k+ users, high read/write ratio on ride searches

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Code Quality Standards ✅
- ✅ TypeScript strict mode enabled in `tsconfig.json`
- ✅ Zod schemas for all API boundaries (external data validation)
- ✅ ESLint + Prettier configured (TanStack preset already in place)
- ✅ Function/component length limits enforced via code review
- ✅ No `any` types without explicit approval

### Testing Standards ✅
- ✅ TDD approach for new features (write tests first)
- ✅ Vitest already configured in project
- ✅ Coverage thresholds: 80% utilities, 70% components
- ✅ Integration tests for critical flows (booking, payment)
- ✅ E2E tests for happy paths (to be added)

### UX Consistency ✅
- ✅ shadcn/ui components already integrated
- ✅ Tailwind CSS 4.x configured
- ✅ Mobile-first responsive design (375px, 768px, 1024px breakpoints)
- ✅ Accessibility: semantic HTML, ARIA labels, keyboard navigation
- ✅ Loading states and error boundaries required

### Performance Requirements ✅
- ✅ Core Web Vitals targets defined (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- ✅ Route-based code splitting with TanStack Router
- ✅ Bundle size budget: < 200KB gzipped
- ✅ Database query optimization with Prisma `select`
- ✅ TanStack Query for server state caching

### Security & Data Protection ✅
- ✅ Better Auth already integrated for authentication
- ✅ Server-side validation required (Zod schemas)
- ✅ Rate limiting on public endpoints (to be implemented)
- ✅ PII encryption at rest (Prisma field-level encryption)
- ✅ Audit logs for sensitive operations

**Overall Assessment**: ✅ **PASSED** - Existing project setup aligns with constitution requirements. Proceed with implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-shared-ride-booking/
├── spec.md              # Feature specification (COMPLETED)
├── plan.md              # This file - implementation plan
├── research.md          # Phase 0: Technical research & decisions
├── data-model.md        # Phase 1: Database schema & entity relationships
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: API contracts (request/response schemas)
│   ├── auth.md
│   ├── rides.md
│   ├── bookings.md
│   ├── notifications.md
│   └── ratings.md
└── tasks.md             # Phase 2: Granular implementation tasks (NOT in this plan)
```

### Source Code (repository root)

We'll use the existing TanStack Start monorepo structure and extend it:

```text
ride-sharing/
├── prisma/
│   ├── schema.prisma           # Extend with ride-sharing entities
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Updated seed data for development
│
├── src/
│   ├── routes/                 # TanStack Router file-based routing
│   │   ├── __root.tsx         # (existing) Root layout
│   │   ├── index.tsx          # (existing) Home/landing page - UPDATE
│   │   ├── about.tsx          # (existing) About page
│   │   │
│   │   ├── auth/              # Authentication routes
│   │   │   ├── register.tsx   # NEW: User registration
│   │   │   ├── login.tsx      # NEW: Login page
│   │   │   └── reset-password.tsx  # NEW: Password reset
│   │   │
│   │   ├── dashboard/         # NEW: User dashboard area
│   │   │   ├── index.tsx      # Dashboard home
│   │   │   ├── profile.tsx    # User profile management
│   │   │   ├── my-rides.tsx   # Driver's ride listings
│   │   │   └── my-bookings.tsx # Passenger's bookings
│   │   │
│   │   ├── rides/             # NEW: Ride management
│   │   │   ├── create.tsx     # Create new ride
│   │   │   ├── $rideId.tsx    # View ride details
│   │   │   ├── $rideId.edit.tsx # Edit ride
│   │   │   └── search.tsx     # Search rides
│   │   │
│   │   ├── bookings/          # NEW: Booking management
│   │   │   ├── $bookingId.tsx # Booking details
│   │   │   └── confirm.tsx    # Booking confirmation flow
│   │   │
│   │   ├── api/               # API routes (server endpoints)
│   │   │   ├── auth/          # (existing) Better Auth
│   │   │   │   └── $.ts
│   │   │   │
│   │   │   ├── rides/         # NEW: Ride API endpoints
│   │   │   │   ├── index.ts   # GET /api/rides (search), POST /api/rides (create)
│   │   │   │   ├── [id].ts    # GET/PUT/DELETE /api/rides/:id
│   │   │   │   └── [id].bookings.ts # GET /api/rides/:id/bookings
│   │   │   │
│   │   │   ├── bookings/      # NEW: Booking API endpoints
│   │   │   │   ├── index.ts   # POST /api/bookings (create booking)
│   │   │   │   ├── [id].ts    # GET/PUT/DELETE /api/bookings/:id
│   │   │   │   └── [id].cancel.ts # POST /api/bookings/:id/cancel
│   │   │   │
│   │   │   ├── users/         # NEW: User API endpoints
│   │   │   │   ├── profile.ts # GET/PUT /api/users/profile
│   │   │   │   └── [id].ratings.ts # GET /api/users/:id/ratings
│   │   │   │
│   │   │   ├── ratings/       # NEW: Rating API endpoints
│   │   │   │   └── index.ts   # POST /api/ratings (create rating)
│   │   │   │
│   │   │   ├── notifications/ # NEW: Notification endpoints
│   │   │   │   ├── index.ts   # GET /api/notifications (user's notifications)
│   │   │   │   ├── stream.ts  # GET /api/notifications/stream (SSE endpoint)
│   │   │   │   └── mark-read.ts # POST /api/notifications/mark-read
│   │   │   │
│   │   │   └── payments/      # NEW: Payment integration
│   │   │       ├── create-intent.ts    # POST /api/payments/create-intent
│   │   │       ├── confirm.ts          # POST /api/payments/confirm
│   │   │       └── webhook.ts          # POST /api/payments/webhook (Stripe)
│   │   │
│   │   └── demo/              # (existing) Demo pages
│   │
│   ├── components/            # React components
│   │   ├── Header.tsx         # (existing) UPDATE: Add user menu
│   │   ├── Footer.tsx         # (existing)
│   │   ├── ThemeToggle.tsx    # (existing)
│   │   │
│   │   ├── auth/              # NEW: Auth components
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── UserMenu.tsx
│   │   │
│   │   ├── rides/             # NEW: Ride components
│   │   │   ├── RideCard.tsx
│   │   │   ├── RideList.tsx
│   │   │   ├── RideForm.tsx
│   │   │   ├── RideDetailView.tsx
│   │   │   ├── RideSearchForm.tsx
│   │   │   └── RideFilters.tsx
│   │   │
│   │   ├── bookings/          # NEW: Booking components
│   │   │   ├── BookingCard.tsx
│   │   │   ├── BookingList.tsx
│   │   │   ├── BookingConfirmation.tsx
│   │   │   └── BookingRequestModal.tsx
│   │   │
│   │   ├── ratings/           # NEW: Rating components
│   │   │   ├── RatingStars.tsx
│   │   │   ├── RatingForm.tsx
│   │   │   ├── ReviewCard.tsx
│   │   │   └── UserRatingSummary.tsx
│   │   │
│   │   ├── notifications/     # NEW: Notification components
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── NotificationDropdown.tsx
│   │   │   └── NotificationItem.tsx
│   │   │
│   │   ├── maps/              # NEW: Map integration components
│   │   │   ├── RouteMap.tsx
│   │   │   ├── LocationPicker.tsx
│   │   │   └── ItineraryMap.tsx
│   │   │
│   │   └── ui/                # shadcn/ui components (existing/extend)
│   │       ├── button.tsx     # (existing)
│   │       ├── card.tsx       # (existing)
│   │       ├── form.tsx       # ADD: Form components
│   │       ├── dialog.tsx     # ADD: Modal dialogs
│   │       ├── toast.tsx      # ADD: Toast notifications
│   │       ├── select.tsx     # ADD: Select dropdowns
│   │       ├── calendar.tsx   # ADD: Date/time picker
│   │       └── ... (other shadcn components as needed)
│   │
│   ├── lib/                   # Utilities and libraries
│   │   ├── auth.ts            # (existing) Better Auth server config
│   │   ├── auth-client.ts     # (existing) Better Auth client
│   │   ├── utils.ts           # (existing) General utilities
│   │   │
│   │   ├── db.ts              # (existing) Prisma client - UPDATE: Add helpers
│   │   ├── validations/       # NEW: Zod schemas
│   │   │   ├── auth.ts
│   │   │   ├── ride.ts
│   │   │   ├── booking.ts
│   │   │   ├── rating.ts
│   │   │   └── user.ts
│   │   │
│   │   ├── services/          # NEW: Business logic services
│   │   │   ├── ride-service.ts
│   │   │   ├── booking-service.ts
│   │   │   ├── rating-service.ts
│   │   │   ├── notification-service.ts
│   │   │   ├── payment-service.ts
│   │   │   └── itinerary-service.ts
│   │   │
│   │   ├── hooks/             # NEW: Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useRides.ts
│   │   │   ├── useBookings.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── useRatings.ts
│   │   │
│   │   ├── api-client/        # NEW: Type-safe API client functions
│   │   │   ├── rides.ts
│   │   │   ├── bookings.ts
│   │   │   ├── ratings.ts
│   │   │   └── notifications.ts
│   │   │
│   │   └── maps/              # NEW: Maps API integration
│   │       ├── geocoding.ts
│   │       ├── routing.ts
│   │       └── distance.ts
│   │
│   ├── integrations/          # (existing) Third-party integrations
│   │   ├── better-auth/       # (existing)
│   │   ├── stripe/            # NEW: Stripe payment integration
│   │   └── maps/              # NEW: Google Maps/Mapbox integration
│   │
│   ├── styles.css             # (existing) Global styles
│   ├── router.tsx             # (existing) Router configuration
│   └── routeTree.gen.ts       # (existing) Generated route tree
│
├── tests/                     # Test files
│   ├── unit/                  # Unit tests
│   │   ├── services/
│   │   ├── utils/
│   │   └── validations/
│   │
│   ├── integration/           # Integration tests
│   │   ├── api/
│   │   └── database/
│   │
│   ├── component/             # Component tests
│   │   ├── rides/
│   │   ├── bookings/
│   │   └── auth/
│   │
│   └── e2e/                   # End-to-end tests (Playwright)
│       ├── auth.spec.ts
│       ├── ride-booking.spec.ts
│       └── payments.spec.ts
│
├── public/                    # (existing) Static assets
│   ├── manifest.json
│   └── robots.txt
│
├── package.json               # (existing) Dependencies
├── tsconfig.json              # (existing) TypeScript config
├── vite.config.ts             # (existing) Vite config
├── vitest.config.ts           # ADD: Vitest-specific config
├── .env.example               # ADD: Environment variable template
└── README.md                  # (existing) UPDATE: Project documentation
```

**Structure Decision**: Using **Option 2 (Web Application) adapted as full-stack monorepo**. TanStack Start provides both frontend and backend in a unified structure with file-based routing. The `/api` routes handle server-side logic while page routes handle UI. This eliminates the need for separate frontend/backend directories while maintaining clear separation of concerns.

## Complexity Tracking

> No constitution violations detected. This section intentionally left empty.

---

## Phase 0: Research & Technical Decisions

**Goal**: Investigate and document critical technical decisions before implementation begins.

### Research Topics

1. **Real-time Notifications Architecture**
   - **Question**: Server-Sent Events (SSE) vs WebSockets vs polling for notification delivery
   - **Decision Criteria**: Simplicity, browser support, scalability to 500 concurrent users
   - **Output**: Document recommendation with code example in `research.md`

2. **Map Service Selection**
   - **Question**: Google Maps API vs Mapbox vs OpenStreetMap for geocoding/routing
   - **Decision Criteria**: Cost, feature set (geocoding, routing, distance matrix), rate limits
   - **Output**: Provider selection with API integration approach

3. **Partial Route Matching Algorithm**
   - **Question**: How to efficiently match passenger routes against driver routes (point-in-route, segment matching)
   - **Decision Criteria**: Query performance, accuracy, database indexing strategy
   - **Output**: Algorithm design with PostgreSQL query optimization strategy

4. **Payment Flow & Escrow**
   - **Question**: Stripe Payment Intents vs Charges API; escrow/hold timing
   - **Decision Criteria**: PCI compliance, refund handling, capture timing
   - **Output**: Payment flow diagram with Stripe API integration points

5. **Image Storage for Profile Photos & Vehicles**
   - **Question**: Local filesystem vs S3-compatible storage (Cloudflare R2, AWS S3)
   - **Decision Criteria**: Cost, CDN integration, upload flow
   - **Output**: Storage strategy with upload/retrieval implementation

6. **Rate Limiting Strategy**
   - **Question**: In-memory (node-cache) vs Redis for rate limiting
   - **Decision Criteria**: Simplicity, persistence requirements, multi-instance support
   - **Output**: Rate limiting implementation approach

### Deliverable

Create `specs/001-shared-ride-booking/research.md` documenting:
- Technical decisions with justifications
- Rejected alternatives and why
- Code examples/prototypes for complex areas
- Performance implications
- Integration requirements (API keys, services)

---

## Phase 1: Design & Contracts

**Goal**: Design database schema, API contracts, and component architecture before coding.

### 1.1 Data Model Design

**Task**: Design complete Prisma schema for all entities

**Key Entities** (from spec):
- User (extends Better Auth user model)
- Ride
- Booking
- Itinerary
- Rating
- Notification
- Message
- EmergencyContact
- (Phase 2: IdentityVerification)

**Design Requirements**:
- Proper indexing for search queries (origin, destination, date)
- Relationships with cascading deletes where appropriate
- Enum types for status fields
- Timestamps (createdAt, updatedAt) on all entities
- Optimistic concurrency control (version field) for critical entities (Ride, Booking)

**Validation**:
- Run through all 52 functional requirements
- Ensure each requirement can be implemented with the schema
- Identify missing fields or relationships

**Deliverable**: `specs/001-shared-ride-booking/data-model.md` containing:
- Complete Prisma schema
- Entity-Relationship Diagram (ERD)
- Index strategy with justification
- Migration plan from existing schema

### 1.2 API Contract Definition

**Task**: Define all REST API endpoints with request/response schemas

**API Routes** (based on functional requirements):

**Authentication** (Better Auth integration)
- POST `/api/auth/sign-up` - Register user
- POST `/api/auth/sign-in` - Login
- POST `/api/auth/sign-out` - Logout
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password with token

**Rides**
- GET `/api/rides` - Search rides (query params: origin, destination, date, filters)
- POST `/api/rides` - Create ride
- GET `/api/rides/:id` - Get ride details
- PUT `/api/rides/:id` - Update ride
- DELETE `/api/rides/:id` - Cancel ride
- GET `/api/rides/:id/itinerary` - Get ride itinerary with stops

**Bookings**
- POST `/api/bookings` - Create booking (may require approval)
- GET `/api/bookings/:id` - Get booking details
- PUT `/api/bookings/:id` - Update booking
- DELETE `/api/bookings/:id` - Cancel booking
- POST `/api/bookings/:id/approve` - Driver approves booking request
- POST `/api/bookings/:id/decline` - Driver declines booking request

**Users**
- GET `/api/users/profile` - Get current user profile
- PUT `/api/users/profile` - Update profile
- GET `/api/users/:id` - Get user public profile
- GET `/api/users/:id/ratings` - Get user ratings/reviews
- POST `/api/users/emergency-contacts` - Add emergency contact
- PUT `/api/users/emergency-contacts/:id` - Update emergency contact
- DELETE `/api/users/emergency-contacts/:id` - Remove emergency contact

**Ratings**
- POST `/api/ratings` - Submit rating after ride
- GET `/api/ratings/:rideId` - Get ratings for a ride

**Notifications**
- GET `/api/notifications` - Get user notifications (paginated)
- GET `/api/notifications/stream` - SSE endpoint for real-time notifications
- POST `/api/notifications/mark-read` - Mark notifications as read
- POST `/api/notifications/mark-all-read` - Mark all as read

**Messages**
- GET `/api/rides/:rideId/messages` - Get ride messages
- POST `/api/rides/:rideId/messages` - Send message to ride participants

**Payments**
- POST `/api/payments/create-intent` - Create Stripe Payment Intent
- POST `/api/payments/confirm` - Confirm payment and create booking
- POST `/api/payments/webhook` - Stripe webhook handler
- POST `/api/payments/refund` - Process refund (admin/system only)

**Format**: Each endpoint documented with:
- HTTP method and path
- Authentication requirements
- Request body schema (Zod)
- Response body schema (Zod)
- Error responses
- Rate limiting rules

**Deliverable**: `specs/001-shared-ride-booking/contracts/` directory with:
- `auth.md` - Authentication endpoints
- `rides.md` - Ride management endpoints
- `bookings.md` - Booking endpoints
- `users.md` - User profile endpoints
- `ratings.md` - Rating endpoints
- `notifications.md` - Notification endpoints
- `messages.md` - Messaging endpoints
- `payments.md` - Payment endpoints

### 1.3 Component Architecture

**Task**: Design component hierarchy and data flow

**Key Component Groups**:
1. **Page Components** (route components)
2. **Feature Components** (rides, bookings, ratings)
3. **Shared Components** (UI, layout)
4. **Form Components** (with validation)

**Design Principles**:
- Container/Presentation pattern
- Single Responsibility
- Prop drilling max 2 levels (use context for deeper state)
- Co-locate tests with components

**State Management Strategy**:
- **Server State**: TanStack Query (rides, bookings, user data)
- **UI State**: React useState/useReducer
- **Form State**: React Hook Form + Zod
- **Auth State**: Better Auth context
- **Global UI State**: React Context (theme, notifications badge count)

**Deliverable**: Component hierarchy diagram in `research.md` or separate `architecture.md`

### 1.4 Developer Quickstart Guide

**Task**: Document setup process for new developers

**Contents**:
- Prerequisites (Node.js, PostgreSQL, pnpm)
- Environment variable setup (.env.local template)
- Database setup (migrations, seeding)
- Running dev server
- Running tests
- Code style guidelines
- Git workflow (branch naming, commit conventions)

**Deliverable**: `specs/001-shared-ride-booking/quickstart.md`

---

## Phase 2: Implementation Breakdown

**Note**: This phase creates the task list but does NOT implement features. Use `/speckit.tasks` command.

**Task**: Break down implementation into prioritized, testable tasks following user story priorities from spec.

### Priority Grouping (from spec)

**P1 - Core MVP** (Must have for launch):
1. User Registration & Authentication
2. Create and Manage Rides
3. Search and Book Rides

**P2 - Enhanced Features** (Add after P1 stable):
4. Partial Route Sharing
5. Ride Sharing Requests & Notifications
7. Gender Preference & Safety Features (MVP version without verification)

**P3 - Trust Building** (Add after P2):
6. User Profiles and Ratings

### Task Breakdown Strategy

For each user story:
1. **Database**: Prisma schema + migrations
2. **Backend**: API endpoints + services + validation
3. **Frontend**: Components + pages + forms
4. **Integration**: API client + React Query hooks
5. **Tests**: Unit → Integration → E2E
6. **Documentation**: Update API docs, component docs

### Estimation Approach

- **Small**: < 4 hours (single component, simple endpoint)
- **Medium**: 4-8 hours (complex component, endpoint with business logic)
- **Large**: 8-16 hours (full feature with multiple components/endpoints)
- **X-Large**: > 16 hours (requires breaking down further)

### Cross-cutting Concerns

Tasks that apply to multiple features:
- Error handling framework
- Loading state management
- Toast notification system
- Form validation architecture
- API client setup
- Test utilities and fixtures

**Deliverable**: `specs/001-shared-ride-booking/tasks.md` (created via `/speckit.tasks` command)

---

## Phase 3: Testing Strategy

### Test Pyramid

```
         /\
        /E2E\       ← 5-10 critical user flows
       /------\
      /  INT   \    ← 20-30 API + database integration tests
     /----------\
    /   UNIT     \  ← 100+ unit tests for services, utils, validations
   /--------------\
```

### Test Categories

**Unit Tests** (Vitest)
- Services (ride-service, booking-service, etc.)
- Utilities (distance calculation, price calculation, etc.)
- Validation schemas (Zod)
- Pure functions
- Target: 80% coverage

**Component Tests** (Vitest + React Testing Library)
- User interactions (clicks, form inputs)
- Conditional rendering
- Error states
- Loading states
- Accessibility (ARIA attributes)
- Target: 70% coverage

**Integration Tests** (Vitest)
- API endpoints with real database (test DB)
- Multi-step workflows (create ride → create booking)
- Payment flows
- Notification delivery
- Database queries and relationships

**E2E Tests** (Playwright)
- P1 user flows:
  1. Register → Login → Create Ride → Logout
  2. Login → Search Rides → Book Ride → Payment → Confirmation
  3. Login → View My Rides → Edit Ride → Save
- P2 user flows:
  4. Partial route booking flow
  5. Notification delivery and interaction
- Critical paths only (5-10 tests max)

### Test Data Management

- **Unit/Component**: Mock data and API responses
- **Integration**: Test database with Prisma seed data
- **E2E**: Dedicated test database, reset between runs

### CI/CD Integration

- Run unit + component tests on every commit
- Run integration tests on PR
- Run E2E tests before merge to main
- Coverage reports in PR comments

---

## Phase 4: Deployment & Monitoring

### Environment Setup

**Environments**:
1. **Development** (local)
2. **Staging** (pre-production testing)
3. **Production**

**Environment Variables** (per environment):
```
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://... (for migrations)

# Auth (Better Auth)
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# Payments (Stripe)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Maps (Google Maps or Mapbox)
MAPS_API_KEY=...

# Email (for notifications)
EMAIL_FROM=noreply@rideshare.com
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...

# Optional: SMS (if Phase 2)
SMS_PROVIDER_KEY=...

# Storage (if using S3-compatible)
S3_BUCKET=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_REGION=...
```

### Deployment Strategy

**Database Migrations**:
- Run `prisma migrate deploy` before deploying new code
- Test migrations on staging first
- Always create backup before production migration

**Code Deployment**:
- Build: `pnpm build`
- Static assets to CDN
- Server deployed to hosting platform (Vercel, Netlify, or self-hosted)

**Rollback Plan**:
- Database: Keep migration rollback SQL ready
- Code: Git revert + redeploy
- Feature flags for gradual rollouts (future enhancement)

### Monitoring & Observability

**Metrics to Track**:
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- User flow completion rates
- Core Web Vitals (from users)
- Booking conversion funnel

**Logging**:
- Structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Sensitive data redaction (passwords, payment info)

**Alerting**:
- Error rate > threshold
- API response time > 500ms for p95
- Database connection failures
- Payment processing failures

**Tools** (TBD in research):
- Application monitoring: Sentry, LogRocket, or similar
- Performance: Vercel Analytics, Google Analytics 4
- Uptime: UptimeRobot or similar

---

## Success Metrics (from Spec)

Track these metrics post-launch to validate success criteria:

### User Adoption (Week 1-4)
- ✅ SC-001: Registration completion < 3 min (90% success rate)
- ✅ SC-002: 80% of users post/book within 7 days
- ✅ SC-003: Ride search < 2 min
- ✅ SC-004: 75% of searches return results in peak hours

### Technical Performance (Continuous)
- ✅ SC-005: Booking flow < 5 min
- ✅ SC-006: Payment success 95% first attempt
- ✅ SC-009: 500 concurrent users, page load < 2s
- ✅ SC-011: 99.5% uptime during business hours
- ✅ SC-012: Search queries < 500ms (p95)

### Business Metrics (Monthly)
- ✅ SC-017: Cancellation rate < 10% (24hr+ advance bookings)
- ✅ SC-018: Avg driver rating > 4.2, passenger > 4.0
- ✅ SC-020: 70% capacity on popular routes

---

## Risk Assessment & Mitigation

### High Risk Areas

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Partial route matching performance | High | Medium | Index optimization, caching, query profiling in research phase |
| Payment refund edge cases | High | Medium | Comprehensive integration tests, Stripe test mode validation |
| Real-time notification reliability | Medium | Medium | Fallback to polling, graceful degradation |
| Map API rate limits/cost | Medium | Low | Caching, request batching, quota monitoring |
| Database connection pool exhaustion | High | Low | Connection pooling config, load testing |
| Concurrent booking conflicts | High | Medium | Database transactions, optimistic locking |

### Technical Debt Prevention

- Document all "Phase 2" features clearly
- No temporary hacks without TODO + ticket
- Refactor before adding to existing complex code
- Keep dependencies updated monthly

---

## Timeline Estimate

**Note**: Estimates assume 1 full-time developer. Adjust for team size.

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 0: Research** | 3-5 days | research.md, technical decisions |
| **Phase 1: Design** | 5-7 days | data-model.md, contracts/*, quickstart.md |
| **Phase 2: P1 Implementation** | 15-20 days | Core MVP (auth, rides, bookings) |
| **Phase 2: P1 Testing** | 5-7 days | Unit, integration, E2E tests for P1 |
| **Phase 2: P2 Implementation** | 10-15 days | Partial routes, notifications, ratings |
| **Phase 2: P2 Testing** | 3-5 days | Tests for P2 features |
| **Phase 2: P3 Implementation** | 3-5 days | Enhanced profiles, rating system polish |
| **Phase 3: Integration Testing** | 3-5 days | Full system testing, bug fixes |
| **Phase 4: Deployment Setup** | 2-3 days | CI/CD, staging environment, monitoring |
| **Phase 4: Production Launch** | 1-2 days | Deployment, smoke testing, monitoring |

**Total Estimated Time**: 50-74 working days (~10-15 weeks with buffer)

**Milestones**:
- Week 1: Research & Design complete
- Week 4: P1 MVP functional (auth + basic ride booking)
- Week 8: P2 features complete (partial routes + notifications)
- Week 10: P3 complete, all tests passing
- Week 12: Production-ready, deployed to staging
- Week 14: Production launch

---

## Next Steps

1. ✅ **Review this plan** with team/stakeholders
2. **Phase 0**: Run `/speckit.plan` research workflow or manually create `research.md`
3. **Phase 1**: Run `/speckit.plan` design workflow or manually create:
   - `data-model.md`
   - `contracts/*.md`
   - `quickstart.md`
4. **Phase 2**: Run `/speckit.tasks` to generate granular task breakdown
5. **Start Implementation**: Begin with P1 User Story 1 (Authentication)

---

## Appendix: Technology Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Language** | TypeScript | 5.x | Type-safe development |
| **Runtime** | Node.js | 20+ | Server runtime |
| **Framework** | TanStack Start | 1.132+ | Full-stack React framework |
| **Frontend** | React | 19.x | UI library |
| **UI Components** | shadcn/ui | Latest | Component library |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Routing** | TanStack Router | 1.132+ | File-based routing |
| **State** | TanStack Query | Latest | Server state management |
| **Database** | PostgreSQL | 15+ | Relational database |
| **ORM** | Prisma | 7.x | Database ORM |
| **Auth** | Better Auth | 1.4+ | Authentication |
| **Validation** | Zod | 3.x | Schema validation |
| **Testing** | Vitest | Latest | Unit/integration tests |
| **Component Testing** | React Testing Library | 16.x | Component tests |
| **E2E Testing** | Playwright | Latest | End-to-end tests |
| **Payments** | Stripe | Latest | Payment processing |
| **Maps** | Google Maps/Mapbox | Latest | Geocoding, routing |
| **Package Manager** | pnpm | Latest | Dependency management |
| **Linting** | ESLint | Latest | Code linting |
| **Formatting** | Prettier | Latest | Code formatting |
| **Build Tool** | Vite | Latest | Build tooling |
