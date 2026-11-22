# Agent Instructions

These instructions apply to AI coding agents working in this repository. Read the relevant docs before making changes.

## Start here
1. Read `README.md`.
2. Read `ROADMAP.md` and identify the current milestone/task.
3. Read the relevant architecture, domain, API, and security documents.
4. Inspect the existing code and tests before proposing or editing files.
5. Follow existing project conventions unless there is a documented reason to change them.

## Core principles
- TypeScript-first for mobile, admin, API, and shared domain logic. The backend framework is NestJS (default Express adapter initially), not a standalone Express app. Follow Nest modules/controllers/providers/guards/pipes conventions.
- React Native for mobile; React for admin web.
- Python is for AI/data tasks and optional isolated services—not a second implementation of core business rules without a clear need.
- Prefer modular monolith architecture over microservices for initial versions.
- Preserve the exercise catalog as the canonical source of exercise identity.
- Use stable exercise IDs; never create fake IDs in generated plans.
- LLM outputs are untrusted inputs. Validate all structured output using schemas and domain rules.
- Do not let an LLM bypass authorization, safety, business constraints, or database validation.
- Persian-first, RTL-aware UX; keep internal identifiers and enum values language-neutral.
- Avoid unnecessary complexity and premature infrastructure.
- Add/update tests for behavior changes.
- Do not silently change schemas, API contracts, or persisted data formats.

## Coding rules
- Use strict TypeScript.
- Avoid `any`; use `unknown` and narrow it.
- Validate external inputs at boundaries.
- Keep domain logic separate from UI, database, and provider-specific code.
- Use clear, domain-specific names.
- Keep functions focused and reasonably small.
- Prefer dependency injection for infrastructure-dependent domain/application services.
- Avoid duplicated business logic across mobile, API, and admin. Shared packages should contain stable, reusable contracts/domain logic.
- Never hardcode secrets, API keys, credentials, or tokens.
- Never commit `.env`, local database files, user workout data, or private dataset exports.
- Keep migrations reversible where practical and document data migration risks.
- Avoid breaking changes without migration plans.
- Use accessible controls, readable Persian typography, and RTL-correct layout.
- Do not mirror exercise media or anatomical visuals simply because the UI is RTL.

## AI-specific rules
- AI-generated exercise facts, nutrition facts, and safety content must be reviewed before publication unless sourced from an explicitly trusted provider with documented provenance.
- Provider API keys must only be used server-side.
- AI-generated program output must reference catalog exercise IDs.
- Validate JSON/schema, then validate semantic/business rules.
- Use deterministic calculations for calories/macros, volume, set totals, progression rules, and other numeric domain logic.
- Never claim certainty about medical diagnoses, injury treatment, or exact body-fat estimates.
- Store prompt/template versions, provider/model identifiers, and review state where appropriate.
- Make AI features observable and evaluate them with test/evaluation datasets.

## Data and privacy
- Apply least-privilege access.
- User health/fitness data is sensitive. Avoid logging full profile, measurements, photos, nutrition logs, or chat content by default.
- Use explicit consent for optional photos and AI processing.
- Support data export and deletion policies.
- Protect admin enrichment routes and published dataset workflows.

## Testing
- Unit-test domain rules and program generation.
- Test API validation, auth, authorization, and error contracts.
- Test offline workout behavior and sync conflicts.
- Test AI structured-output validation with good, malformed, and adversarial cases.
- Test RTL layouts and Persian localization.
- Run lint, typecheck, tests, and build before declaring a task complete.

## Agent task workflow
1. Summarize the task and constraints briefly.
2. Inspect related code and docs.
3. Propose the smallest appropriate implementation plan.
4. Implement only the task scope.
5. Add tests and documentation updates.
6. Run relevant checks; report commands/results honestly.
7. List changed files, decisions, limitations, and suggested next task.

## Commit conventions
Use Conventional Commits, for example:
- `feat(exercises): add exercise enrichment review workflow`
- `feat(programs): generate beginner 3-day full-body plan`
- `feat(workouts): persist workout sets offline`
- `fix(api): validate program exercise identifiers`
- `docs(roadmap): define milestone one deliverables`

## Don't
- Don't build microservices prematurely.
- Don't use LLM output directly as trusted DB writes.
- Don't build a model from scratch in the initial roadmap.
- Don't add dependency/framework without explaining the benefit.
- Don't modify unrelated files.
- Don't claim tests passed unless you actually ran them.
