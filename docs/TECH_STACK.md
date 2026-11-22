# Technology Stack

Stack is intentionally JavaScript/TypeScript-first, with Python for AI/data workloads. Reassess major choices after inspecting the current app and developer constraints.

## Mobile
- React Native + TypeScript.
- Expo recommended for development/build workflow unless current project has a strong bare-native need.
- Expo Router for navigation (if Expo chosen).
- TanStack Query for server state and cache.
- Zustand for small app/client state; do not mirror server data unnecessarily.
- React Hook Form + Zod for forms and boundary validation.
- SQLite-based local persistence for offline workout data (Expo SQLite or a maintained equivalent).
- Secure storage for tokens/secret-like local values.
- Reanimated where needed for polished interactions.
- Localization: `i18next`/`react-i18next` with RTL support and explicit Persian locale formatting.
- Charts: select a maintained React Native chart library after evaluating accessibility, RTL, performance, and Expo compatibility.

## Admin web
- React + TypeScript + Vite.
- React Router or TanStack Router; choose one.
- TanStack Query.
- React Hook Form + Zod.
- Component library: choose a compatible, accessible library (e.g. shadcn/ui built on Radix) and define RTL support before adoption.
- Admin must use backend APIs; AI provider keys must never be browser-exposed.

## Backend
- Node.js LTS + TypeScript.
- **Chosen backend framework: NestJS + TypeScript.** Use Nest modules, controllers, providers/services, dependency injection, guards, pipes, interceptors, and exception filters. NestJS is preferred over a standalone Express application because this product has many domain modules and needs consistent architecture, testability, and maintainability as it grows.
- Start with NestJS default Express adapter for broad compatibility and straightforward deployment. The underlying adapter is an implementation detail; do not build the application as a separate raw Express server. Reconsider Fastify adapter only if profiling demonstrates a meaningful need.
- REST API initially; document with OpenAPI.
- Use DTOs with `class-validator`/`class-transformer` for Nest request validation at the API boundary, and Zod for shared package contracts or runtime validation where it offers a clear benefit. Avoid maintaining duplicate validation definitions; document the source of truth per contract.
- PostgreSQL as primary database.
- Prisma ORM recommended for developer productivity and migrations; TypeORM is acceptable if already established in repository. Do not use two ORMs.
- Redis only when justified for queues, rate limiting, caching, or ephemeral coordination.
- Queue: BullMQ/Redis for batch AI enrichment and jobs when async work is needed.
- Object storage (S3-compatible) for optional photos/media/exports; exercise media may remain packaged/CDN-hosted depending current design.
- Auth: secure access/refresh strategy, rotating refresh tokens, revoke support, secure cookie strategy for web and secure storage for mobile. Decide exact implementation and threat model.

## Python / AI
- Python 3.12+ (version to confirm from deployment compatibility).
- FastAPI only if a separately deployed Python service is justified; otherwise use worker/task processes.
- Pydantic for Python-specific AI/data validation.
- Provider SDKs behind adapters.
- AI batch jobs, dataset audit, data cleaning, evaluation, embeddings/ingestion, experiments.
- Avoid duplicating core program rules in Python; keep primary rules in TypeScript shared/domain package or document a service boundary.

## AI and retrieval
- LLM provider abstraction so model/provider can change.
- Tool/function calling with strict schemas.
- Structured outputs where supported.
- Embeddings/vector search: PostgreSQL + pgvector is a reasonable initial choice if retrieval is needed; don't add vector DB before there is a concrete retrieval requirement.
- Hybrid retrieval: exact structured database filters first; vector search for knowledge documents/semantic queries.
- Evaluation: curated golden test set, correctness, schema validity, grounding, safety, Persian quality, latency, and cost.

## Data
- PostgreSQL.
- JSONB for flexible reviewed enrichment attributes only when appropriate; core queryable fields should be normalized.
- Immutable dataset releases and migration metadata.
- Food records should include source, source version/date, serving/unit definitions, and data quality state.

## Dev tooling
- npm workspaces or pnpm workspaces (choose one; pnpm recommended for monorepo consistency, but existing npm workspace can remain if already in use).
- ESLint + Prettier.
- TypeScript strict mode.
- Vitest for unit tests; Jest is acceptable if already used.
- API integration testing with test database.
- GitHub Actions CI.
- Docker Compose for local services.
- Conventional Commits.
- Changesets or another release/version mechanism for shared packages if needed.

## Suggested workspace layout
```text
apps/
  mobile/
  admin/
  api/
packages/
  contracts/
  exercise-data/
  exercise-domain/
  program-domain/
  workout-domain/
  nutrition-domain/
  localization/
  config/
services/
  ai-worker/        # Python; optional initial service/worker
docs/
```

## Recommended initial package choices
| Concern | Recommendation |
|---|---|
| Mobile | React Native + Expo + TypeScript |
| Navigation | Expo Router |
| API | NestJS + TypeScript |
| ORM | Prisma |
| DB | PostgreSQL |
| Queue | Redis + BullMQ, add when async jobs are needed |
| Admin | React + Vite |
| Validation | Zod contracts; avoid duplicate schema sources |
| Mobile server state | TanStack Query |
| Mobile local state | Zustand, selectively |
| Forms | React Hook Form |
| Python | FastAPI/worker, Pydantic |
| Vector search | pgvector if/when RAG needs it |
| CI | GitHub Actions |
| Local infra | Docker Compose |

## Technology selection caveat
Before installing anything, inspect existing repository dependencies and platform requirements. Prefer retaining compatible existing dependencies over migration churn. Verify library maintenance, licenses, React Native/Expo compatibility, and RTL support.
