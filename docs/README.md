# Architecture Decision Record (ADR)

**Project Name:** RideSharing Web App
**Decision Title:** Selected TanStack Start for Capstone Web App
**Status:** Proposed
**Date:** 2026-03-07

---

## 1. Context

Our team needed a React-based full-stack framework for a semester-long capstone ride-sharing web app. We ran a bakeoff comparing three stacks, Astro + SSR, TanStack + tRPC, and Bun + Svelte, scoring each across LCP, bundle size, velocity, DX frustration, and ecosystem. React is a project prerequisite, which constrained the decision.

## 2. Decision

We will use TanStack Start with tRPC as the primary full-stack framework for the ride-sharing capstone project.

## 3. Rationale (Data-Based)

TanStack Start scored lowest overall (80.25 vs Astro's 89.1 and Bun + Svelte's 89.57), but the following metrics and constraints justify the decision:

- **LCP:** TanStack tied for best at 0.3s (with Astro), outperforming Bun + Svelte's 0.5s, critical for a user-facing ride-sharing app where first-load performance directly impacts rider retention.
- **Ecosystem:** Scored 4/5, tying Astro. The React ecosystem provides the libraries and patterns needed for a complex real-time app (maps, state management, auth).
- **React prerequisite:** Bun + Svelte (89.57) and Astro + SSR (89.1) scored higher overall, but neither is a React-based full-stack framework, making them ineligible given project constraints.

## 4. Consequences and Risks

- **Maturity risk:** TanStack Start is still maturing, there is a risk of breaking changes or missing features. _Mitigation:_ pin dependency versions and monitor release notes closely.
- **Fewer community resources:** Compared to Next.js or Svelte, TanStack Start has fewer tutorials and community resources. _Mitigation:_ rely on official TanStack docs, the TanStack Discord, and tRPC documentation as primary references.
- **Higher DX frustration:** The bakeoff measured DX frustration at 3 (vs 1 for Bun + Svelte), indicating a steeper initial learning curve. _Mitigation:_ the team will invest in shared documentation and pair programming during early sprints to flatten the curve.

## 5. Alternatives Considered

Bun + Svelte was the top scorer (89.57) with excellent velocity (6), lowest DX frustration (1), and best ecosystem score (5). However, Svelte is not React-based, making it ineligible given the React prerequisite. Additionally, the Bun runtime is newer with less production stability than Node-based alternatives.

---
