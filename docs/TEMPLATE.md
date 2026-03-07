# Architecture Decision Record (ADR)

**Project Name:** RideSharing Web App
**Decision Title:** [e.g., Select SvelteKit for Capstone Web App]
**Status:** [Proposed | Accepted]
**Date:** [YYYY-MM-DD]

---

## 1. Context

Describe the problem and constraints that required a decision.

> _Example: "Our team needed a framework for a semester-long capstone app. Bakeoff metrics showed significant differences in LCP, bundle size, and implementation speed across three candidates."_

## 2. Decision

State the architectural decision clearly in one sentence.

> _Example: "We will use SvelteKit as the primary full-stack framework for the capstone project."_

## 3. Rationale (Data-Based)

Cite 3 specific metrics from your scorecard that justify this decision.

- **Metric A:** (e.g., "Our JS Bundle was 40% smaller than the nearest competitor.")
- **Metric B:** (e.g., "Documentation score was 5/5, which is critical for our team.")
- **Metric C:** (e.g., "HMR was instant, reducing friction during UI iteration.")

## 4. Consequences and Risks

Identify trade-offs, known risks, and how your team will mitigate them.

> _Example: "The biggest risk with this stack is the smaller community. We will mitigate this by relying heavily on the official Discord and keeping our dependencies minimal to avoid abandoned libraries."_

## 5. Alternatives Considered

Briefly explain why the 2nd place stack was not selected.

> _Example: "React was a close second due to its massive ecosystem, but the initial configuration complexity and the high boilerplate code resulted in a 20% slower implementation time during the bakeoff."_

---

## Appendix: Grading Rubric for the Post-Mortem

| Criteria            | Proficient                                                                              | Needs Improvement                                                                     |
| ------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Data Usage**      | Decision is referenced directly against recorded Bakeoff metrics (Velocity, LCP, etc.). | Decision is based entirely on "feeling" or "it was easy," ignoring the recorded data. |
| **Risk Assessment** | Identifies legitimate trade-offs and mitigation steps in ADR consequences.              | Claims the chosen stack is perfect with no downsides.                                 |
| **Clarity**         | The ADR decision statement is concise and professional.                                 | The reasoning is rambling or unclear.                                                 |
