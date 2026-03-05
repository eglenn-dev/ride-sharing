# Ride-Sharing Application Constitution

## Core Principles

### I. Code Quality Standards (NON-NEGOTIABLE)

**Type Safety First**
- Strict TypeScript mode enabled at all times
- No `any` types without explicit justification and approval
- All function parameters and return types must be explicitly typed
- Zod schemas required for all external data boundaries (API requests/responses, form inputs)

**Clean Code Practices**
- Single Responsibility Principle: Each component/function does one thing well
- DRY (Don't Repeat Yourself): Extract shared logic into reusable utilities
- Maximum function length: 50 lines; Maximum component length: 200 lines
- Meaningful names: No abbreviations except commonly accepted ones (e.g., `id`, `url`)

**Code Organization**
- Components in `/src/components` with co-located tests
- Business logic in `/src/lib` utilities, never in components
- API routes in `/src/routes/api` following REST conventions
- Prisma schema changes require migration files, never `db push` in production

### II. Testing Standards (NON-NEGOTIABLE)

**Test-Driven Development**
- Write tests before implementation for all new features
- Minimum coverage: 80% for utilities, 70% for components
- All tests must pass before PR approval

**Testing Strategy**
- Unit tests: All utility functions, hooks, and business logic
- Component tests: User interactions, conditional rendering, error states
- Integration tests: Critical user flows (booking, payment, authentication)
- E2E tests: Happy path for core features (search, book, pay, review)

**Test Quality**
- Use React Testing Library best practices: query by role/label, not implementation details
- Test user behavior, not implementation
- Mock external dependencies (APIs, databases) in unit/component tests
- No skipped tests in main branch

### III. User Experience Consistency

**Design System Compliance**
- Use shadcn/ui components for all UI elements
- Tailwind CSS for styling; no inline styles or CSS modules
- Consistent spacing using Tailwind spacing scale (4px increments)
- Color palette defined in `tailwind.config`; no arbitrary colors

**Responsive Design**
- Mobile-first development approach
- Test on mobile (375px), tablet (768px), desktop (1024px+)
- Touch targets minimum 44x44px for interactive elements
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)

**Accessibility (WCAG 2.1 AA)**
- Semantic HTML required for all components
- ARIA labels for icon buttons and interactive elements
- Keyboard navigation fully supported
- Color contrast ratio minimum 4.5:1 for text
- Form validation errors announced to screen readers

**Loading & Error States**
- Loading states for all async operations
- Error boundaries for graceful error handling
- Toast notifications for user feedback (success, error, warning)
- Optimistic updates for better perceived performance

### IV. Performance Requirements

**Core Web Vitals Targets**
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s on 3G

**Bundle Size**
- Initial JavaScript bundle: < 200KB gzipped
- Route-based code splitting for all pages
- Lazy load non-critical components
- Image optimization: WebP format, responsive sizes, lazy loading

**Runtime Performance**
- React component re-renders minimized using `memo`, `useMemo`, `useCallback`
- Database queries optimized: use `select` to fetch only needed fields
- API response times: < 200ms for 95th percentile
- Infinite scroll/pagination for large lists (> 50 items)

**Caching Strategy**
- TanStack Query for server state with appropriate stale times
- Cache static assets with service workers
- Database connection pooling configured in Prisma

## Security & Data Protection

**Authentication & Authorization**
- Better Auth integration for all protected routes
- Session validation on every protected API call
- Role-based access control (RBAC) for admin features
- Password requirements: min 8 characters, mixed case, numbers

**Data Validation**
- Server-side validation for all user inputs
- Sanitize data before database insertion
- Rate limiting on public API endpoints
- CORS configured to allow only trusted origins

**Privacy Compliance**
- PII (Personally Identifiable Information) encrypted at rest
- User data deletion capability (GDPR compliance)
- Audit logs for sensitive operations (bookings, payments)
- No sensitive data in client-side logs or error messages

## Development Workflow

**Code Review Process**
- All changes require PR review and approval
- Automated checks must pass: lint, format, type-check, tests
- PR description includes: what changed, why, testing approach
- Breaking changes require migration guide

**Quality Gates**
- ESLint with TanStack config: no warnings allowed
- Prettier formatting enforced
- Type checking with `tsc --noEmit`
- Vitest coverage threshold met
- No console.log statements in production code

**Git Practices**
- Conventional commits format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Branch naming: `feat/feature-name`, `fix/bug-description`
- Squash commits before merging to main

**Deployment**
- Staging environment for pre-production testing
- Database migrations run before deployment
- Rollback plan documented for major changes
- Environment variables never committed to repo

## Governance

**Constitutional Authority**
- This constitution supersedes all other development practices
- Deviations require documented justification and team approval
- Amendments require consensus and update documentation

**Enforcement**
- All PRs verified for constitutional compliance
- Automated checks enforce non-negotiable principles
- Team retrospectives review adherence monthly
- Complexity increases must demonstrate clear user value

**Continuous Improvement**
- Performance metrics monitored weekly
- User feedback drives UX refinements
- Tech debt tracked and prioritized quarterly
- Constitution reviewed and updated semi-annually

**Version**: 1.0.0 | **Ratified**: 2026-03-05 | **Last Amended**: 2026-03-05
