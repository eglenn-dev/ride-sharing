# Feature Specification: Shared Ride Booking Platform

**Feature Branch**: `001-shared-ride-booking`  
**Created**: 2026-03-05  
**Status**: Draft  
**Input**: User description: "Create a web application that allows users to create, update and share rides. The application should include user authentication, ride creation and editing, and live ride sharing features. A rider should be able to share his itinerary and people should able to request to share a part of that itinerary. A person should be able to book a ride and tell if they are open to share that ride with others or book exclusively, the gender of the other riders they would be comfortable with."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration and Authentication (Priority: P1)

A new user visits the platform and needs to create an account to access ride booking features. They register with email and password, verify their account, and log in to access the platform.

**Why this priority**: Authentication is foundational - no other features can be used without user accounts. This is the entry point for all users and must work reliably before any ride-sharing functionality.

**Independent Test**: Can be fully tested by creating a new account, receiving a verification email, logging in, and accessing a protected dashboard page that confirms authentication.

**Acceptance Scenarios**:

1. **Given** a new user on the registration page, **When** they provide valid email, password (min 8 chars), and profile information, **Then** an account is created and a verification email is sent
2. **Given** an unverified user account, **When** the user clicks the verification link in email, **Then** the account is marked as verified
3. **Given** a verified user on the login page, **When** they enter correct credentials, **Then** they are logged in and redirected to the dashboard
4. **Given** a logged-in user, **When** they click logout, **Then** their session is terminated and they are redirected to the home page
5. **Given** a user who forgot their password, **When** they request a password reset, **Then** they receive a reset link via email and can set a new password

---

### User Story 2 - Create and Manage Rides (Priority: P1)

A driver wants to create a ride listing with their planned route, departure time, available seats, and sharing preferences. They can edit ride details before departure and cancel if needed.

**Why this priority**: Creating rides is core to the platform's value proposition. Without rides being posted, there's nothing for passengers to book. This is the supply side of the marketplace.

**Independent Test**: Can be fully tested by a logged-in driver creating a new ride with origin, destination, date/time, available seats, and viewing it in their "My Rides" list. Editing and cancellation features can be verified independently.

**Acceptance Scenarios**:

1. **Given** a logged-in driver on the create ride page, **When** they enter origin, destination, departure date/time, available seats (1-7), and select sharing preference (shared/exclusive), **Then** a new ride is created and appears in their rides list
2. **Given** a driver with an upcoming ride, **When** they edit the ride details (time, seats, or route), **Then** the changes are saved and all booked passengers are notified
3. **Given** a driver with an upcoming ride, **When** they cancel the ride, **Then** sliding-scale refunds apply to passengers (4+ hours before = full refund, 2-4 hours = 75%, 1-2 hours = 50%, <1 hour = 25%)
4. **Given** a driver creating a shared ride, **When** they specify gender preferences for passengers, **Then** only matching passengers can request to book
5. **Given** a driver viewing their ride, **When** they see the itinerary, **Then** they can view start point, end point, and any intermediate stops added by partial bookings

---

### User Story 3 - Search and Book Rides (Priority: P1)

A passenger needs to travel from point A to point B and searches for available rides. They can see rides that match their route partially or completely, view driver profiles and ratings, and book a seat.

**Why this priority**: Booking rides is the demand side of the platform. Without the ability to search and book, passengers cannot use the service. This completes the core value loop.

**Independent Test**: Can be fully tested by a passenger searching for rides between two locations, viewing results, selecting a ride, and completing a booking with payment confirmation.

**Acceptance Scenarios**:

1. **Given** a logged-in passenger on the search page, **When** they enter origin, destination, and preferred date, **Then** they see a list of available rides sorted by departure time
2. **Given** search results displayed, **When** a passenger selects a ride, **Then** they see full ride details including driver profile, ratings, vehicle info, price, and available seats
3. **Given** a passenger viewing a compatible ride, **When** they click "Book Seat" and select exclusive or shared preference, **Then** they proceed to payment
4. **Given** a passenger completing payment, **When** payment succeeds, **Then** their booking is confirmed, the seat count decreases, and both parties receive notifications
5. **Given** a passenger booking a ride, **When** they specify gender preference for co-riders, **Then** the system only matches them with compatible shared rides

---

### User Story 4 - Partial Route Sharing (Priority: P2)

A passenger needs to travel from point B to point C along a driver's route from A to D. They can request to join for just the portion of the route they need, paying a proportional fare.

**Why this priority**: Partial route sharing increases ride efficiency and provides more booking options, but the platform can function with full-route bookings first. This optimization comes after core booking works.

**Independent Test**: Can be fully tested by searching for rides where origin/destination don't exactly match any listed ride, seeing rides that cover part of the route, booking a segment, and verifying the driver sees the pickup/dropoff points.

**Acceptance Scenarios**:

1. **Given** a ride from City A to City C with stops at City B, **When** a passenger searches for rides from City A to City B, **Then** they see this ride as a partial match with adjusted pricing
2. **Given** a passenger viewing a partial route match, **When** they book the segment, **Then** the driver's itinerary is updated with the passenger's pickup and dropoff locations
3. **Given** multiple passengers on different segments, **When** the driver views their itinerary, **Then** they see an optimized route with all pickup and dropoff points in order
4. **Given** a partial booking confirmed, **When** calculating the fare, **Then** the price is proportional to the distance traveled (e.g., 50% of route = 50% of full fare)

---

### User Story 5 - Ride Sharing Requests and Notifications (Priority: P2)

When a passenger requests to join a shared ride, the driver receives a notification and can approve or decline the request. Both parties receive real-time updates about booking status, ride changes, and trip progress.

**Why this priority**: Real-time communication enhances trust and coordination but isn't required for basic booking. Asynchronous notifications can work initially before adding live features.

**Independent Test**: Can be fully tested by having a passenger request a seat on a shared ride, the driver receiving a notification, approving/declining, and the passenger receiving status updates.

**Acceptance Scenarios**:

1. **Given** a passenger requesting to book a shared ride, **When** the request is submitted, **Then** the driver receives an instant notification with passenger profile and preferences
2. **Given** a driver receiving a booking request, **When** they approve it within 24 hours, **Then** the passenger is notified, payment is processed, and the booking is confirmed
3. **Given** a driver receiving a booking request, **When** they decline it, **Then** the passenger is notified with the reason and can search for alternative rides
4. **Given** an upcoming ride within 2 hours, **When** departure time approaches, **Then** all participants receive a reminder notification
5. **Given** an active ride in progress, **When** the driver updates ride status (started, en route, completed), **Then** all passengers receive real-time status updates

---

### User Story 6 - User Profiles and Ratings (Priority: P3)

After completing a ride, both drivers and passengers can rate each other and leave reviews. Users can view their rating history and build a reputation score that affects their booking eligibility.

**Why this priority**: Ratings build trust and accountability but aren't needed for initial bookings. The platform can launch with basic identity verification before adding reputation systems.

**Independent Test**: Can be fully tested by completing a ride, both parties rating each other (1-5 stars with optional comment), viewing ratings on profiles, and verifying average rating calculation.

**Acceptance Scenarios**:

1. **Given** a completed ride, **When** a passenger rates the driver (1-5 stars) and adds an optional review, **Then** the rating is recorded and updates the driver's average score
2. **Given** a completed ride, **When** the driver rates the passenger, **Then** the passenger's reliability score is updated
3. **Given** a user viewing another user's profile before booking, **When** they check ratings, **Then** they see average star rating, total number of rides, and recent reviews
4. **Given** a user with consistently low ratings (below 3.0), **When** they attempt to book rides, **Then** they receive a warning and may have limited booking options
5. **Given** a user disputing an unfair rating, **When** they submit a dispute with evidence, **Then** support team reviews and can remove invalid ratings

---

### User Story 7 - Gender Preference and Safety Features (Priority: P2)

Users can set gender preferences for shared rides, verify their identity, and access safety features like trip sharing with emergency contacts and in-app emergency button.

**Why this priority**: Safety features are critical for user trust, especially for gender-specific preferences. This should be implemented early but can follow basic booking functionality.

**Independent Test**: Can be fully tested by a user setting gender preferences in profile, creating/searching for rides that respect these preferences, verifying identity with government ID, and testing the emergency contact feature.

**Acceptance Scenarios**:

1. **Given** a female user creating a shared ride, **When** they set preference to "Female passengers only", **Then** only users with verified female profiles can see and book the ride
2. **Given** a male user booking a ride, **When** they set preference for "Male co-riders only", **Then** the system only shows compatible rides matching this preference
3. **Given** any user, **When** they complete identity verification by uploading a government ID, **Then** their profile shows a "Verified" badge increasing trust
4. **Given** a passenger starting a ride, **When** they share trip details with emergency contacts, **Then** contacts receive live tracking link and estimated arrival time
5. **Given** a safety concern during a ride, **When** a user presses the emergency button, **Then** emergency contacts are alerted and support team is notified with GPS location

---

### Edge Cases

- **Multiple passengers requesting the last seat**: What happens when two passengers simultaneously request the final available seat on a ride?
  - *Resolution*: First confirmed payment secures the seat; second passenger receives notification that seat is no longer available and suggested alternatives
  
- **Driver cancels within 4-hour window**: How does system handle last-minute cancellations when the 4-hour minimum isn't met?
  - *Resolution*: Sliding-scale refunds apply: 75% at 2-4 hours, 50% at 1-2 hours, 25% at <1 hour; driver's reliability score decreases; repeated violations may result in account suspension
  
- **Partial route conflicts**: What happens when multiple partial bookings create scheduling conflicts (overlapping segments)?
  - *Resolution*: System validates new bookings against existing segments; conflicting requests are rejected with explanation; suggested alternative times/routes provided
  
- **Gender preference mismatches**: How does system handle if a verified male user's profile is incorrectly marked?
  - *Resolution*: Users can dispute identity verification; support reviews ID documentation; incorrect verifications are corrected within 24 hours; affected bookings are honored
  
- **Payment failure after booking confirmation**: What happens if payment processing fails after seat is reserved?
  - *Resolution*: Booking enters "pending payment" state with 15-minute window; automated retry attempted; if payment fails, seat is released and driver is notified
  
- **Driver/passenger no-show**: How does the system handle when someone doesn't appear at pickup?
  - *Resolution*: 15-minute grace period with in-app chat; after timeout, rider can cancel with documentation; no-show user receives penalty; other party is compensated
  
- **Route deviation from original itinerary**: What happens if driver significantly changes the planned route?
  - *Resolution*: Major changes (>20% distance/time increase) trigger passenger notification with option to cancel for full refund; GPS tracking ensures route accountability
  
- **Concurrent ride editing**: How does system prevent conflicting edits when driver and multiple passengers modify the same ride?
  - *Resolution*: Optimistic locking with last-write-wins; conflicting users notified of changes; critical fields (departure time, route) require all passenger confirmation

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & User Management**

- **FR-001**: System MUST allow users to register with email and password meeting security requirements (min 8 characters, mixed case, numbers)
- **FR-002**: System MUST send verification emails and require email confirmation before account activation
- **FR-003**: System MUST allow users to log in using verified credentials and maintain secure sessions
- **FR-004**: System MUST provide password reset functionality via email-based secure token
- **FR-005**: System MUST allow users to log out and terminate their session
- **FR-006**: Users MUST be able to update their profile information including name, phone number, profile photo, and preferences
- **FR-007**: (Phase 2) System MUST support identity verification via government ID upload for enhanced trust on gender-preference features

**Ride Creation & Management**

- **FR-008**: Drivers MUST be able to create rides specifying origin, destination, departure date/time, available seats (1-7), and price
- **FR-009**: Drivers MUST be able to specify whether a ride is available for sharing or exclusive booking only
- **FR-010**: (Phase 2) Drivers MUST be able to set gender preferences for passengers (Any, Male only, Female only, Non-binary welcome) on shared rides after identity verification is implemented
- **FR-011**: Drivers MUST be able to edit ride details (date, time, seats, route) before departure; edits up to 4 hours before trigger automatic passenger notifications
- **FR-012**: Drivers MUST be able to cancel rides; cancellations trigger sliding-scale refunds (full refund 4+ hours before departure, 75% at 2-4 hours, 50% at 1-2 hours, 25% at under 1 hour before departure)
- **FR-013**: System MUST automatically update ride availability as seats are booked and prevent overbooking
- **FR-014**: System MUST allow drivers to add vehicle information (make, model, year, color, license plate)

**Ride Search & Booking**

- **FR-015**: Passengers MUST be able to search for rides by entering origin, destination, and preferred date
- **FR-016**: System MUST display rides that match the full route or contain the requested route segment (partial matches)
- **FR-017**: Search results MUST show departure time, available seats, price, driver rating, and sharing type
- **FR-018**: Passengers MUST be able to view detailed ride information including driver profile, vehicle details, and complete itinerary
- **FR-019**: Passengers MUST be able to specify booking preference (willing to share / exclusive booking)
- **FR-020**: (Phase 2) Passengers MUST be able to set gender preference for co-riders when booking shared rides (after identity verification available)
- **FR-021**: (Phase 2) System MUST only show rides that match both driver's and passenger's gender preferences when both have completed identity verification
- **FR-022**: System MUST process payment securely before confirming booking
- **FR-023**: System MUST send booking confirmation to both driver and passenger(s) upon successful payment

**Partial Route Sharing**

- **FR-024**: System MUST identify rides where passenger's origin/destination falls along driver's planned route
- **FR-025**: System MUST calculate proportional pricing for partial route bookings based on distance traveled
- **FR-026**: System MUST update driver's itinerary to include intermediate pickup and dropoff points for partial bookings
- **FR-027**: System MUST optimize itinerary order to minimize total route distance while respecting time constraints
- **FR-028**: System MUST notify drivers when partial bookings add stops to their route

**Notifications & Communication**

- **FR-029**: System MUST send real-time notifications for booking requests, confirmations, cancellations, and ride updates
- **FR-030**: Drivers MUST receive instant notification when a passenger requests to join a shared ride
- **FR-031**: Drivers MUST be able to approve or decline booking requests with optional reason
- **FR-032**: System MUST notify all participants 2 hours before scheduled departure as a reminder
- **FR-033**: System MUST send status updates when ride status changes (started, en route, completed)
- **FR-034**: System MUST provide in-app messaging between confirmed ride participants
- **FR-035**: Notification delivery methods MUST include email and in-app notifications; SMS notifications MUST be optional and user-configurable

**Ratings & Reviews**

- **FR-036**: System MUST allow both drivers and passengers to rate each other (1-5 stars) after ride completion
- **FR-037**: Users MUST be able to add optional written reviews with their ratings
- **FR-038**: System MUST calculate and display average rating scores on user profiles
- **FR-039**: System MUST prevent users from rating the same ride multiple times
- **FR-040**: System MUST display total ride count and recent reviews on user profiles
- **FR-041**: System MUST flag users with consistently low ratings (below 3.0 average) for review

**Safety & Security**

- **FR-042**: System MUST allow users to share trip details (route, driver/passenger info, ETA) with emergency contacts
- **FR-043**: (Phase 2) System MUST provide an emergency button that alerts emergency contacts and support team with GPS location
- **FR-044**: (Phase 2) System MUST verify that users' stated gender matches their identity verification documents
- **FR-045**: (Phase 2) System MUST enforce gender preferences strictly when matching riders (only matching if both verified)
- **FR-046**: Payment information MUST be stored securely and never displayed in full (show last 4 digits only)
- **FR-047**: System MUST log all sensitive operations (bookings, cancellations, payments) for audit purposes

**Data & Business Logic**

- **FR-048**: System MUST support automatic refunds when drivers cancel rides
- **FR-049**: System MUST handle timezone conversions correctly for rides crossing time zones
- **FR-050**: System MUST prevent users from booking overlapping rides (same time slot)
- **FR-051**: System MUST archive completed rides for historical reference and dispute resolution
- **FR-052**: System MUST calculate and display estimated ride duration based on route distance

### Key Entities *(include if feature involves data)*

- **User**: Represents both drivers and passengers. Key attributes include: email, password hash, full name, phone number, profile photo, gender, identity verification status, average rating, total rides completed, emergency contacts, notification preferences, account creation date
  
- **Ride**: Represents a posted ride offering. Key attributes include: driver (User reference), origin address/coordinates, destination address/coordinates, departure date/time, return trip flag, available seats, total seats, price per seat, sharing type (shared/exclusive), gender preference, vehicle information, estimated duration, route waypoints, ride status (draft/active/in-progress/completed/cancelled), cancellation policy, creation timestamp

- **Booking**: Represents a passenger's reservation on a ride. Key attributes include: ride (Ride reference), passenger (User reference), booking type (full route/partial), pickup location, dropoff location, number of seats booked, total price paid, payment status, booking status (requested/confirmed/cancelled/completed), booking timestamp, gender preference specified, cancellation reason (if applicable)

- **Itinerary**: Represents the complete route with all waypoints. Key attributes include: ride (Ride reference), ordered list of stops (each with location, type [origin/pickup/dropoff/destination], associated booking if applicable, estimated time), total distance, optimized flag, last updated timestamp

- **Rating**: Represents feedback after ride completion. Key attributes include: ride (Ride reference), reviewer (User reference), reviewed user (User reference), star rating (1-5), written review text, response from reviewed user, rating timestamp, verified completion flag, dispute status

- **Notification**: Represents system communications. Key attributes include: recipient (User reference), notification type (booking_request/confirmation/cancellation/reminder/status_update/message), title, message body, related ride (Ride reference), read status, delivered status, delivery methods attempted, creation timestamp

- **Message**: Represents in-app communication between users. Key attributes include: ride (Ride reference), sender (User reference), recipients (User references), message text, sent timestamp, read timestamps, attachment URLs

- **IdentityVerification**: Represents user verification status. Key attributes include: user (User reference), document type (passport/driver_license/national_id), document images, verified gender, verification status (pending/approved/rejected), reviewer notes, submission timestamp, verification timestamp

- **EmergencyContact**: Represents safety feature contacts. Key attributes include: user (User reference), contact name, phone number, email, relationship, active status, notification preferences, added timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

**User Adoption & Engagement**

- **SC-001**: Users can complete registration and email verification in under 3 minutes with 90% success rate on first attempt
- **SC-002**: 80% of new users post their first ride or make their first booking within 7 days of registration
- **SC-003**: Users can find relevant rides for common routes in under 2 minutes from starting their search
- **SC-004**: 75% of searches return at least one matching ride (full or partial route) during peak hours

**Booking Performance**

- **SC-005**: Users can complete a full booking transaction (search, select, book, pay) in under 5 minutes
- **SC-006**: Payment processing succeeds on first attempt for 95% of transactions
- **SC-007**: Booking confirmation notifications are delivered within 30 seconds of payment completion
- **SC-008**: System prevents overbooking with 100% accuracy across concurrent booking requests

**Platform Reliability**

- **SC-009**: System handles 500 concurrent users without performance degradation (page load < 2 seconds)
- **SC-010**: Real-time notifications are delivered with 99% reliability within 1 minute of event trigger
- **SC-011**: System maintains 99.5% uptime during business hours (6 AM - 11 PM local time)
- **SC-012**: Database queries for ride search return results in under 500ms for 95th percentile requests

**User Safety & Satisfaction**

- **SC-013**: (Phase 2) 85% of users complete identity verification within their first week on the platform
- **SC-014**: (Phase 2) Gender preference filters work with 100% accuracy - no mismatched bookings occur
- **SC-015**: (Phase 2) Emergency button triggers alerts to all emergency contacts within 10 seconds
- **SC-016**: Users report feeling safe using the platform based on driver/passenger ratings and user feedback (>3.5/5.0 initial)

**Business Metrics**

- **SC-017**: Cancellation rate remains below 10% for bookings made more than 24 hours in advance
- **SC-018**: Average driver rating remains above 4.2 stars; average passenger rating above 4.0 stars
- **SC-019**: Partial route bookings represent at least 20% of total bookings within 3 months of launch
- **SC-020**: 70% of rides reach full capacity (all seats booked) on popular routes

**User Experience**

- **SC-021**: Users can successfully edit upcoming rides with 95% success rate (no errors or confusion)
- **SC-022**: Support tickets related to booking confusion decrease to less than 5% of total bookings
- **SC-023**: Mobile users complete tasks at same success rate as desktop users (within 5% margin)
- **SC-024**: First-time users can complete core tasks without external help or documentation 80% of the time

## Assumptions & Clarifications

### Resolved Clarifications

Based on user review and feedback, the following previously unclear requirements have been clarified:

- **SMS Notifications**: Optional and user-configurable in profile settings (FR-035). Email and in-app notifications are mandatory for MVP.

- **Platform Commission**: **10% commission per completed ride**, taken after driver payment is released. This applies after the driver confirms ride completion.

- **Cancellation Refunds**: **Sliding-scale refund policy** based on cancellation notice time:
  - **4+ hours before departure**: Full refund to passenger + platform waives commission
  - **2-4 hours before departure**: 75% refund to passenger
  - **1-2 hours before departure**: 50% refund to passenger
  - **Less than 1 hour before**: 25% refund to passenger
  
- **Age Requirements**: **18+ for drivers; 16+ for passengers** (parental consent required for 16-17 year-olds)

- **Payment Release Timing**: Payments released to drivers **after ride is marked complete** by the driver (allows 1-4 hour window for disputes)

- **Minimum Rating Threshold**: Users flagged when average rating falls **below 3.0 stars** (triggers review and possible restrictions)

### Phase 2 Features (Explicitly Deferred from MVP)

The following features have been identified as important but are scheduled for Phase 2 implementation due to resource constraints:

1. **Identity Verification**: Manual or automated ID verification to prevent fraud and enforce gender preferences
2. **Gender Preference Enforcement**: Strict profile verification required to enforce gender-based ride matching
3. **Emergency Features**: In-app emergency button with SOS response and location sharing
4. **GPS Tracking**: Live route tracking and real-time location updates during rides
5. **Vehicle Verification**: Driver safety inspections and insurance verification
6. **Advanced Community Features**: Photo verification, detailed dispute resolution interface

### Base Assumptions for MVP

The following assumptions are made for the Minimum Viable Product launch:

1. **Payment Processing**: Integration with standard payment gateway (Stripe/PayPal); payments held in escrow until ride completion

2. **Geographic Scope**: Service operates within country initially; international expansion in Phase 2; all addresses validated against mapping service (Google Maps/Mapbox)

3. **Vehicle Information**: Drivers self-report vehicle details with no verification required for MVP; vehicle verification moved to Phase 2

4. **Route Calculation**: Integration with mapping API for distance/duration calculation; manual GPS tracking support via mobile app

5. **Communication Channels**: Email and in-app in-app notifications mandatory; SMS optional and user-configurable

6. **Language Support**: English-only for MVP; multi-language support planned for Phase 2

7. **Accessibility**: WCAG 2.1 AA compliance for all features; specialized accessibility features (wheelchair rides) in Phase 2

8. **No-Show Policy**: 15-minute grace period before ride can be cancelled; penalty applied to no-show user; affected party is compensated on case-by-case basis

9. **Dispute Resolution**: Support team handles billing disputes; decision timeline is 5 business days; users can request escalation

10. **Data Retention**: User data retained for 3 years after last activity for legal/compliance purposes; deletion requests honored within 30 days

## Technical Constraints

The following technical constraints apply based on the existing technology stack:

1. **Framework**: TanStack Start (React) with Server-Side Rendering (SSR)
2. **Authentication**: Better Auth integration as already configured
3. **Database**: PostgreSQL with Prisma ORM
4. **Styling**: Tailwind CSS with shadcn/ui components
5. **Real-time Features**: Consider using WebSockets or Server-Sent Events for live notifications
6. **Testing**: Vitest for unit/integration tests as per constitution requirements
7. **Performance**: Must meet Core Web Vitals targets defined in constitution (LCP < 2.5s, FID < 100ms)
8. **Code Quality**: Must maintain 80% test coverage for utilities, 70% for components as per constitution

## Next Steps

1. **Technical Planning**: Create implementation plan using `/speckit.plan` command

2. **Database Schema**: Design Prisma schema for all key entities

3. **API Design**: Define REST API endpoints for all functional requirements

4. **UI/UX Design**: Create wireframes for all user flows prioritized by user story priority level

5. **Phase 2 Planning**: Plan advanced features including gender preference enforcement, identity verification, emergency features, and GPS tracking
