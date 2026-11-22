# Product Specification

## Audience
Gym users and bodybuilding enthusiasts who prefer Persian-language, RTL experiences. The first target audience is people who want structured resistance training, consistent logging, and measurable progress.

## Problem
Exercise reference apps show movements but often do not connect them to personalized training plans, actual workout performance, progression, nutrition, and long-term coaching.

## Product promise
Help users understand what to train, execute it, log it, and make informed progress—with transparent rules and AI assistance grounded in trusted app data.

## Personas
- Beginner: needs a simple safe program, technique cues, and confidence.
- Intermediate: wants structured hypertrophy, progression, and flexibility.
- Advanced: wants program control, volume tracking, detailed analytics, and custom programming.
- Admin/content curator: needs tools to enrich, verify, review, and publish exercise content.

## Core user journeys
### Onboarding
1. Create account or use supported guest experience.
2. Set age range (avoid collecting exact age if not necessary), height/weight optionally, training experience, goal, available days, session duration, equipment, preferences, and limitations.
3. Review data/privacy and optional AI processing consent.
4. Generate program.
5. Review, customize, and activate.

### Training
1. View today's workout.
2. Start session.
3. Review exercise instructions and prior performance.
4. Log warm-up and working sets.
5. Rest timer.
6. Replace exercise if needed.
7. Finish and review summary.

### Progress
- Review strength history, PRs, training consistency, volume, body weight trend, and optional measurements.
- Choose date range.
- Export or delete personal records as supported.

### Nutrition
- Search foods.
- Select serving and units.
- Build meal/recipe.
- Log meal.
- Review daily calories/macros and estimates.

### AI coach
- Ask a question in Persian or English.
- Coach retrieves relevant app data and uses authorized tools.
- Coach distinguishes recorded facts, calculated metrics, and suggestions.
- User can accept or reject suggested program changes.

## Functional requirements
- Exercise catalog supports search/filter, localized details, media, equipment, and target/secondary muscles.
- Program generator produces structured plans, with IDs that resolve to catalog entries.
- Programs are editable and versioned.
- Workout logging stores actual sets separately from prescription.
- Workout logging works offline and syncs safely.
- Nutrition entries preserve food source, quantity, units, and calculation provenance.
- Progress dashboards show trends and methodology.
- AI features are permission-aware, validated, and auditable.
- Admin workflow supports draft, review, approval, publication, rollback, and export.

## Non-functional requirements
- Fast startup and smooth workout interactions.
- Offline-capable workout logging.
- Secure authentication and authorization.
- Data minimization and user-controlled privacy.
- Maintainable modular architecture.
- Reliable schema migration.
- Persian RTL, accessibility, and localization.
- AI cost/latency controls.
- Observability without exposing sensitive data.

## Out of scope for early MVP
- Training a foundation LLM from scratch.
- Medical diagnosis or injury treatment.
- Fully automated, unreviewed AI publishing.
- Social network and public body-photo sharing.
- Wearables integrations before core workout tracking works.
