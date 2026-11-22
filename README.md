# Bodybuilding AI Platform

A Persian-first, RTL bodybuilding platform that combines an enriched exercise catalog, personalized training programs, gym workout logging, nutrition tracking, progress analytics, and an AI coaching layer.

## Product vision
Build a trustworthy personal bodybuilding companion that can:
- Recommend structured programs based on goals, experience, available days, time, equipment, and limitations.
- Make workouts easy to log in the gym, including sets, reps, load, RIR/RPE, rest, and notes.
- Track strength, training consistency, body weight, and measurements over time.
- Provide food catalog, meals, nutrition targets, and food tracking.
- Use an LLM grounded in validated app data and program rules—not as an unconstrained workout generator.
- Maintain an admin tool for AI-assisted exercise data enrichment, validation, review, and publishing.

## Product pillars
1. Exercise intelligence and dataset operations.
2. Fitness profile and program generation.
3. Gym tracking and progressive overload.
4. Nutrition and food data.
5. AI bodybuilding coach and retrieval.
6. Analytics and adaptive coaching.

## Documentation
- [Product specification](docs/PRODUCT.md)
- [Roadmap](ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Technology stack](docs/TECH_STACK.md)
- [Data model](docs/DATA_MODEL.md)
- [Exercise data and enrichment](docs/EXERCISE_DATA.md)
- [Program engine](docs/PROGRAM_ENGINE.md)
- [AI architecture](docs/AI_ARCHITECTURE.md)
- [API conventions](docs/API_CONVENTIONS.md)
- [Security and privacy](docs/SECURITY.md)
- [Development workflow](docs/DEVELOPMENT.md)
- [Agent instructions](AGENTS.md)

## Initial technology decisions
See `docs/TECH_STACK.md`. TypeScript/JavaScript is the primary product stack. Python is reserved for AI/data pipelines, experimentation, evaluation, and specialized services where it offers meaningful advantages.

## MVP success criteria
- User completes onboarding and receives a valid program.
- Program exercises resolve to existing catalog IDs.
- User can start, pause, resume, complete, and review workouts.
- Sets are reliably saved offline and synchronized.
- Progress history and basic analytics work.
- Admin can enrich, validate, review, and publish exercise dataset changes.
- AI responses are schema-validated, grounded, and auditable.
