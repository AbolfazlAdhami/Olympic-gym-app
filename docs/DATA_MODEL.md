# Data Model (Conceptual)

This is a conceptual model. Final fields, constraints, normalization, and migrations are decided after auditing the existing repository and exercise dataset.

## Identity
- User
- UserSettings
- FitnessProfile
- ConsentRecord

Fitness profile may include goal, experience, available training days, session duration, equipment access, preferences, limitations, and optional body metrics. Collect only information needed for the feature.

## Exercise catalog
- Exercise
- ExerciseLocalization
- ExerciseMedia
- ExerciseEnrichment
- ExerciseAlternative
- DatasetRelease
- DatasetChange
- ReviewRecord

Exercise has stable ID and canonical taxonomy. Localized names/instructions may be separate from language-neutral classification. Enrichment fields must record source/provenance, confidence where useful, review status, schema version, and timestamps.

## Program
- TrainingProgram
- ProgramVersion
- ProgramWeek (optional based on complexity)
- ProgramDay
- ProgramExercise
- ProgramExercisePrescription

A program has goal, schedule, experience range, status, creator/source, version, and dates. A prescription includes exercise ID, order, set target, rep range, rest, target RIR, optional tempo, and notes.

## Workout execution
- WorkoutSession
- WorkoutExercise
- WorkoutSet
- WorkoutNote

Planned prescription and actual workout records are separate. WorkoutSet captures actual load, reps, RIR/RPE if provided, set type, completion, and timestamp. Use units explicitly or normalize with a documented canonical unit.

## Progress
- BodyMetric
- PersonalRecord
- ProgressSnapshot (optional, derived and rebuildable)
- UserFeedback

Body metrics should be optional and privacy-sensitive. Photo progress should be opt-in, protected, and have deletion/export behavior.

## Nutrition
- Food
- FoodLocalization
- FoodSource
- FoodServing
- Recipe
- RecipeIngredient
- Meal
- FoodLogEntry
- NutritionTarget

Nutrition values require units and data provenance. Distinguish raw, cooked, drained, brand, and preparation states. Calculated totals are derived from logged quantity and nutrient-per-unit values.

## AI
- AIProviderConfiguration (secrets handled separately)
- PromptVersion
- AIRequestLog (minimize/ redact content)
- AIResponseRecord (retention policy)
- ToolInvocation
- EvaluationCase
- EvaluationRun
- RetrievalDocument
- RetrievalChunk
- Embedding (only if needed)

## Relationships (high level)
- User has profile and settings.
- User owns programs, sessions, nutrition logs, metrics, and preferences.
- Program contains days; days contain prescribed exercises.
- Session contains performed exercises; performed exercises contain actual sets.
- Exercise is referenced by both program prescriptions and workout logs.
- Food logs reference foods and/or recipes.
- AI tool access is scoped to authenticated user and permissions.
