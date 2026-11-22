# Architecture Decision Records (ADRs)

Keep decisions brief, dated, and revisable. Proposed decisions are not final until repository inspection and explicit review.

## ADR-001 — Modular monolith initially
**Status:** Proposed  
**Decision:** Use a modular backend with domain boundaries rather than microservices.  
**Reason:** Smaller operational burden and easier transactions while the product/domain is evolving. Extract services only when justified.

## ADR-002 — TypeScript primary, Python for AI/data
**Status:** Proposed  
**Decision:** Mobile, admin, API, and primary domain logic use TypeScript. Python is used for data processing, evaluation, experiments, and optional AI workers/services.  
**Reason:** Shared types/contracts and one primary product stack while retaining Python ecosystem advantages.

## ADR-003 — React Native mobile
**Status:** Proposed  
**Decision:** React Native with TypeScript; evaluate Expo as default workflow.  
**Reason:** Cross-platform delivery and JS/TS stack fit. Inspect existing native requirements before deciding Expo vs bare.

## ADR-004 — Deterministic program engine
**Status:** Proposed  
**Decision:** Core program rules and calculations are deterministic and testable; LLM is a helper, not the authority.  
**Reason:** Reliability, explainability, validation, and repeatable outputs.

## ADR-005 — AI enrichment requires review
**Status:** Proposed  
**Decision:** AI-enriched exercise data is draft until validated and reviewed.  
**Reason:** Prevent hallucinated or unsafe data from becoming canonical.

## ADR-006 — Offline workout logging
**Status:** Proposed  
**Decision:** Workout sessions and set logs are locally persisted and synchronized idempotently.  
**Reason:** Gym connectivity may be poor; logging must not depend on network.

## ADR-007 — RAG before fine-tuning
**Status:** Proposed  
**Decision:** Start with structured data, retrieval, tool calling, and evaluation. Fine-tune only after a benchmark and high-quality data exist.  
**Reason:** Easier updates, stronger grounding, and lower initial cost.

## ADR-008 — NestJS as the backend framework
**Status:** Accepted (project direction; confirm against the existing repository during M0 audit)  
**Decision:** Use NestJS + TypeScript for the API, initially with NestJS default Express adapter. Do not use a standalone Express application as the primary framework.  
**Reason:** The product has multiple domains (exercise catalog, AI enrichment, profiles, programs, workouts, nutrition, analytics, and admin), and NestJS provides consistent modules, dependency injection, guards, validation, testing patterns, and maintainable boundaries. The Express adapter remains underneath NestJS and is not a competing architecture choice.  
**Consequences:** Follow Nest module/controller/provider conventions; keep controllers thin; use DI for service/repository/provider boundaries; use DTO validation pipes; test modules and application services. Consider the Fastify adapter only if performance profiling or deployment constraints justify switching.
