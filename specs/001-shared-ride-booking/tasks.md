# Tasks: Shared Ride Booking Platform (3-Week MVP)

**Feature**: `001-shared-ride-booking`  
**Input**: `specs/001-shared-ride-booking/spec.md`, `specs/001-shared-ride-booking/plan.md`  
**Team Capacity**: 3 people x 8 hrs/week x 3 weeks = **72 hours total**

## MVP Scope (Top Priority Only)

Ship a functional web app covering:
- P1 auth flow (register/login/logout)
- P1 ride CRUD core (create, list, edit, cancel)
- P1 search + booking core (search rides, book seat, seat decrement)
- Minimal user dashboards (`My Rides`, `My Bookings`)
- Basic notifications (in-app only for booking/cancel events)
- Core tests and deployment-ready setup

Out of scope for this 3-week MVP:
- Real payment gateway integration (use "booking confirmed" flow for now)
- Partial-route optimization engine
- Ratings/reviews
- Identity verification and strict gender-preference enforcement
- Real-time socket updates (use polling/simple refresh)

## Milestones

1. **Week 1 Goal**: Auth + database + ride creation/listing working end-to-end
2. **Week 2 Goal**: Search and booking flow working with seat protection
3. **Week 3 Goal**: Dashboard polish, notifications, tests, and demo-ready deployment

## Task List

### Week 1 - Foundation and Core Ride Posting (24h)

- [ ] `T001` Setup env and local DB baseline (`.env`, Prisma connection, seed reset)  
  Owner: Dev A | Est: 2h | Depends: none | Priority: P0
- [ ] `T002` Replace placeholder Prisma schema with MVP entities (`User` via auth tables, `Ride`, `Booking`, `Notification`)  
  Owner: Dev A | Est: 4h | Depends: T001 | Priority: P0
- [ ] `T003` Create and run initial Prisma migration + update `seed.ts` with realistic dev data  
  Owner: Dev A | Est: 2h | Depends: T002 | Priority: P0
- [ ] `T004` Implement auth route UX pages (`/auth/login`, `/auth/register`) using Better Auth client  
  Owner: Dev B | Est: 4h | Depends: T001 | Priority: P0
- [ ] `T005` Add protected-route guard utility for authenticated pages  
  Owner: Dev B | Est: 2h | Depends: T004 | Priority: P0
- [ ] `T006` Build API endpoint for creating rides with Zod validation (`POST /api/rides`)  
  Owner: Dev A | Est: 3h | Depends: T003 | Priority: P0
- [ ] `T007` Build API endpoint for listing current user's rides (`GET /api/rides?mine=true`)  
  Owner: Dev A | Est: 2h | Depends: T006 | Priority: P0
- [ ] `T008` Implement `/rides/create` page + form (origin, destination, departure, seats, price, shared/exclusive)  
  Owner: Dev C | Est: 3h | Depends: T005, T006 | Priority: P0
- [ ] `T009` Implement `/dashboard/my-rides` page with created rides list  
  Owner: Dev C | Est: 2h | Depends: T007 | Priority: P0

### Week 2 - Search and Booking Core Flow (24h)

- [ ] `T010` Build search endpoint (`GET /api/rides`) with date/origin/destination filters and availability check  
  Owner: Dev A | Est: 4h | Depends: T007 | Priority: P0
- [ ] `T011` Build ride detail endpoint (`GET /api/rides/:id`) for booking screen data  
  Owner: Dev A | Est: 2h | Depends: T010 | Priority: P0
- [ ] `T012` Build booking create endpoint (`POST /api/bookings`) with transactional seat decrement and overbooking prevention  
  Owner: Dev A | Est: 5h | Depends: T011 | Priority: P0
- [ ] `T013` Build booking list endpoint for current user (`GET /api/bookings?mine=true`)  
  Owner: Dev A | Est: 2h | Depends: T012 | Priority: P1
- [ ] `T014` Implement `/rides/search` page (search form + results cards)  
  Owner: Dev B | Est: 4h | Depends: T010 | Priority: P0
- [ ] `T015` Implement `/rides/$rideId` detail page with "Book Seat" action  
  Owner: Dev B | Est: 3h | Depends: T011, T012 | Priority: P0
- [ ] `T016` Implement `/dashboard/my-bookings` page  
  Owner: Dev C | Est: 2h | Depends: T013 | Priority: P1
- [ ] `T017` Add ride edit/cancel API (`PUT/DELETE /api/rides/:id`) with ownership checks  
  Owner: Dev C | Est: 2h | Depends: T007 | Priority: P1
- [ ] `T018` Add edit/cancel controls in `/dashboard/my-rides`  
  Owner: Dev C | Est: 2h | Depends: T017, T009 | Priority: P1

### Week 3 - Functional Polish, Notifications, and Demo Readiness (24h)

- [ ] `T019` Add in-app notification model + API for booking/cancel events (`GET /api/notifications`)  
  Owner: Dev A | Est: 3h | Depends: T012, T017 | Priority: P1
- [ ] `T020` Add notification bell/dropdown in header with unread count and mark-as-read action  
  Owner: Dev B | Est: 3h | Depends: T019 | Priority: P1
- [ ] `T021` Implement booking cancellation endpoint and seat restoration logic  
  Owner: Dev A | Est: 3h | Depends: T012 | Priority: P1
- [ ] `T022` Create shared validation schemas and API error format consistency pass  
  Owner: Dev C | Est: 3h | Depends: T012, T017, T021 | Priority: P1
- [ ] `T023` Add core integration tests for auth+ride+booking lifecycle (happy path + overbooking case)  
  Owner: Dev A | Est: 4h | Depends: T021 | Priority: P0
- [ ] `T024` Add component tests for search and booking UX states (loading/error/success)  
  Owner: Dev B | Est: 3h | Depends: T014, T015 | Priority: P1
- [ ] `T025` Run full QA checklist, fix highest-impact defects, and harden edge cases  
  Owner: Dev C | Est: 3h | Depends: T023, T024 | Priority: P0
- [ ] `T026` Prepare deployment config + demo script + sample accounts and data reset command  
  Owner: Dev B | Est: 2h | Depends: T025 | Priority: P0
- [ ] `T027` Buffer for unknowns/bugs discovered during final integration  
  Owner: Team | Est: 3h | Depends: T025 | Priority: P0

## Critical Path (Must Finish for Functional App)

1. `T001 -> T002 -> T003 -> T006 -> T010 -> T011 -> T012 -> T023 -> T025 -> T026`
2. `T004 -> T005 -> T008` (auth + ride creation UX)
3. `T014 -> T015` (search + booking UX)

## Team Split Recommendation

- **Dev A (Backend lead)**: data model, APIs, transactions, integration tests
- **Dev B (Frontend lead)**: auth/search/booking UI and demo prep
- **Dev C (Full-stack support)**: dashboard pages, ride management edits, validation pass, QA support

## Definition of Done (MVP)

- User can register/login/logout and reach protected pages.
- Authenticated driver can create, edit, cancel, and list rides.
- Authenticated rider can search rides, view details, and book a seat.
- Seat availability updates correctly and overbooking is blocked.
- Users can view `My Rides` and `My Bookings`.
- In-app notifications appear for booking/cancel events.
- Integration and component tests for core flows pass.
- App can be run and demonstrated from a clean environment using documented commands.
