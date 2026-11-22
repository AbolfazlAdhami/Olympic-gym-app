# Architecture

## Architecture style
Use a modular monolith for the initial backend. Separate modules by domain and use clear contracts. Extract services only when deployment, scaling, team ownership, or reliability requirements justify it.

## Main apps
- `mobile`: React Native application (TypeScript).
- `admin`: React web application for content management, AI enrichment, review, and dataset release.
- `api`: **NestJS + TypeScript** modular monolith; API, auth, domain orchestration, persistence, and AI tool orchestration. Use the default Express adapter initially; avoid a separate raw Express app.
- `ai-worker` (optional initially): Python worker for batch enrichment, evaluation, ingestion, or tasks where Python libraries are useful.

## Backend framework
- NestJS is the selected framework for the API. Organize features as Nest modules with controllers, application services/providers, domain logic, and infrastructure adapters.
- Keep controllers thin; enforce authentication/authorization through guards and validate inputs with pipes/DTOs.
- Use dependency injection for repositories, external providers, and AI adapters so implementations can be tested and replaced.
- Do not introduce standalone Express routing or a second HTTP framework into the API.

## Domain modules
- Identity & Access
- User Profile / Fitness Profile
- Exercise Catalog
- Dataset Management / Enrichment
- Program Generation
- Program Management
- Workout Sessions
- Progress & Metrics
- Nutrition & Food
- AI Coach
- Notifications (later)

## Boundaries
- UI: presentation and interaction.
- Application: use cases/orchestration.
- Domain: business rules, invariants, domain types.
- Infrastructure: database, provider clients, filesystem/object storage, queue.
- Shared contracts: versioned DTO/schema definitions, not shared database entities.

## Initial request flow
Mobile/admin -> API -> authentication/authorization -> input validation -> application use case -> domain rules -> repositories/provider adapters -> response DTO.

## AI request flow
Client -> API AI orchestration -> identify user intent -> authorize tools -> retrieve relevant data -> model -> tool calls (bounded) -> schema/domain validation -> response. Never trust model-provided user IDs, access control, or invented exercise/food identifiers.

## Data ownership
PostgreSQL is canonical for user/profile/program/session/nutrition records. Published exercise dataset may be stored in PostgreSQL and/or immutable versioned JSON artifacts. Do not create two competing sources of truth; define release and sync strategy.

## Offline mobile
- Local persistence for active session and pending set logs.
- Outbox queue with operation IDs.
- Idempotent server writes.
- Retry/backoff and clear sync state.
- Conflict strategy documented per record.
- Avoid relying on network for timers or set completion.

## Deployments
Initial development can use Docker Compose for API, PostgreSQL, Redis (if required), and worker. Production deployment can begin as a small containerized modular service with managed database. Keep environment-specific configuration externalized.

## Decisions to record (ADR)
- ADR-001: Monorepo and modular architecture.
- ADR-002: Exercise dataset canonical storage and release versioning.
- ADR-003: API framework choice.
- ADR-004: Mobile offline storage and synchronization.
- ADR-005: LLM provider abstraction and tool interface.
- ADR-006: Nutrition data sources/licensing.
- ADR-007: Authentication/session model.
