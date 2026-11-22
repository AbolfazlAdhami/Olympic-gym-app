# Roadmap

Roadmap is outcome-based. Milestones may be adjusted after repository audit and user feedback. Each milestone should ship a usable, testable increment.

## M0 — Repository and product baseline
**Goal:** Understand the existing app and preserve working functionality.

- [ ] Inspect monorepo, mobile app, exercise data, assets, current navigation, state, storage, and build.
- [ ] Establish lint/typecheck/test/build commands.
- [ ] Identify existing schema, data format, and localization/RTL implementation.
- [ ] Add documentation and architecture decision records (ADRs).
- [ ] Record technical debt and baseline performance.

**Exit:** Current app can be built, key flows documented, baseline checks known.

## M1 — Exercise dataset v2 and AI enrichment admin
**Goal:** Improve catalog quality with a safe, reviewable workflow.

- [ ] Audit current exercise data: duplicate IDs, inconsistent taxonomy, equipment, target/secondary muscles, media paths, Persian text quality.
- [ ] Define Exercise v2 schema, migration strategy, and taxonomy.
- [ ] Add movement pattern, exercise type/mechanics, unilateral flag, difficulty, force type, and curated tags as appropriate.
- [ ] Define provenance, confidence, review state, and schema version.
- [ ] Build admin web app for search, editing, enrichment, review, and export.
- [ ] Build secure server-side provider/key configuration.
- [ ] Implement single-exercise enrichment.
- [ ] Add schema validation and semantic checks.
- [ ] Add field-level approve/reject/edit workflow.
- [ ] Add batch processing with rate limits, retries, and cost controls.
- [ ] Version published datasets and produce changelog.
- [ ] Keep AI output unpublished until review.

**Exit:** Admin can enrich, validate, review, and publish dataset releases with audit history.

## M2 — User fitness profile and program engine
**Goal:** Generate useful, valid, transparent training plans.

- [ ] User profile: goal, experience, schedule, session length, equipment, preferences, limitations.
- [ ] Define supported goals and experience levels.
- [ ] Create program templates and split-selection rules.
- [ ] Define volume/frequency defaults and progression parameters.
- [ ] Exercise selection and substitution rules using catalog IDs.
- [ ] Program schema and validation.
- [ ] Generate 2–6 day plans (supported range to be finalized).
- [ ] Explain program choices and expose customization.
- [ ] Build RTL onboarding, program preview, and weekly schedule.
- [ ] Allow user to accept, edit, regenerate, or replace exercises.
- [ ] Version programs and preserve historical programs.

**Exit:** Users can complete onboarding, generate, review, and activate a valid program.

## M3 — Workout logging and gym mode
**Goal:** Fast, dependable tracking during gym sessions.

- [ ] Start, pause, resume, finish, and abandon workout lifecycle.
- [ ] Planned workout versus actual workout data separation.
- [ ] Set logging: load, reps, RIR/RPE, set type, completion, timestamp.
- [ ] Warm-up and working sets.
- [ ] Rest timer and configurable auto-start.
- [ ] Previous session display and quick-copy values.
- [ ] Add/remove sets and exercise substitutions.
- [ ] Workout notes, perceived difficulty, optional readiness.
- [ ] Offline-first persistence and synchronization.
- [ ] Conflict handling and idempotent sync.
- [ ] Session history and workout summary.
- [ ] Detect records using clearly defined rules.

**Exit:** User can track sessions offline and later sync without losing or duplicating sets.

## M4 — Progress analytics
**Goal:** Show meaningful progress without misleading metrics.

- [ ] Exercise performance history.
- [ ] Personal records (definition and types).
- [ ] Volume by exercise/muscle with explicit calculation methodology.
- [ ] Workout frequency and consistency.
- [ ] Body weight logging and trend averages.
- [ ] Body measurements and optional photos.
- [ ] Charts, date ranges, and data export.
- [ ] Privacy controls for measurements/photos.

**Exit:** User can review strength, adherence, and body trends.

## M5 — Nutrition / food database
**Goal:** Food lookup, meal composition, and nutrition logging.

- [ ] Define food schema and nutrition units.
- [ ] Select licensed/reliable data sources and provenance policy.
- [ ] Food search with Persian and English terms.
- [ ] Raw/cooked/brand distinctions.
- [ ] Serving sizes and unit conversions.
- [ ] Meal and recipe composition.
- [ ] Daily food diary and macro totals.
- [ ] Nutrition targets and estimates based on profile/goals.
- [ ] Data correction and quality-review flow.
- [ ] Avoid false precision; label estimated data.

**Exit:** Users can find foods, compose meals, log consumption, and review daily totals.

## M6 — AI coach foundation
**Goal:** Ground AI answers in app data and safe tools.

- [ ] Provider abstraction and model configuration.
- [ ] Tool definitions for exercise lookup, program retrieval, workout history, nutrition lookup, and progress.
- [ ] Retrieval for curated coaching knowledge.
- [ ] Structured output contracts.
- [ ] Authorization and user-context isolation.
- [ ] Prompt and tool versioning.
- [ ] Evaluation dataset and regression suite.
- [ ] Persian response quality evaluation.
- [ ] Guardrails for health, injuries, nutrition, and unsafe requests.
- [ ] Rate limits, token/cost monitoring, privacy controls.
- [ ] AI chat UI and conversation retention settings.

**Exit:** Coach can answer grounded questions, call permitted tools, and explain its reasoning at an appropriate level without fabricating app records.

## M7 — Adaptive coaching
**Goal:** Recommend changes based on longitudinal data, not one-off LLM guesses.

- [ ] Performance trend analysis.
- [ ] Adherence and missed-session context.
- [ ] Fatigue/recovery feedback collection.
- [ ] Progression recommendations.
- [ ] Volume adjustment recommendations.
- [ ] Deload flag logic with transparent criteria.
- [ ] User approval before changing active programs.
- [ ] Explain and log every program change.
- [ ] Evaluate recommendations against coach-reviewed cases.

**Exit:** Recommendations are explainable, validated, and user-controlled.

## M8 — Advanced features (post-MVP)
- [ ] Custom programs and workout templates.
- [ ] Exercise favorites and history.
- [ ] Advanced meal plans (reviewed and user-adjustable).
- [ ] Wearable integrations if justified.
- [ ] Challenges/social features, only after privacy and moderation design.
- [ ] Subscription and entitlement design, if business model requires it.
- [ ] Fine-tuning experiments after collecting high-quality, consented, de-identified training examples and evaluation data.

## Definition of done for every milestone
- Acceptance criteria are met.
- Tests and static checks run and results recorded.
- API/schema changes documented.
- Migration/release notes written.
- RTL and Persian UX verified where applicable.
- Security/privacy implications reviewed.
- No secrets committed.
