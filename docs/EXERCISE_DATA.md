# Exercise Data and Enrichment

## Existing dataset
Current exercise schema is a Persian exercise array with:
- `id` (4-digit stable ID)
- `name`
- `category`
- `body_part`
- `equipment`
- `instructions`
- `muscle_group`
- `secondary_muscles`
- `target`
- `media_id`
- `image`
- `gif_url`
- `created_at`

Preserve stable IDs and media references during migration.

## Audit before changing schema
Audit:
- Duplicate/missing IDs.
- Duplicate exercises and near-duplicate names.
- Invalid/missing image or GIF paths.
- Equipment naming consistency.
- Muscle group and secondary-muscle taxonomy consistency.
- Category/body_part agreement.
- Persian spelling/terminology quality.
- Instruction count, clarity, and safety.
- Unknown, ambiguous, or unsupported facts.

## Potential v2 additions
Optional additions to assess:
- `movement_pattern`: controlled enum taxonomy (e.g. horizontal_push, vertical_push, horizontal_pull, vertical_pull, squat, hinge, lunge, carry, rotation, anti_rotation, isolation, cardio).
- `exercise_type`: compound/isolation/cardio/mobility/other.
- `difficulty`: beginner/intermediate/advanced (not a substitute for individual ability).
- `force_type`: push/pull/static/other.
- `mechanic`: compound/isolation/other.
- `is_unilateral`.
- `exercise_family`.
- `joint_actions`.
- `coaching_cues`.
- `common_mistakes`.
- `safety_notes` (reviewed).
- `breathing_cues`.
- `tempo_guidance` (optional, not rigid universal prescription).
- `alternative_exercise_ids`.
- `regression_exercise_ids`.
- `progression_exercise_ids`.
- `tags`.
- `data_source`, `source_reference`, `enrichment_model`, `enrichment_prompt_version`, `confidence`, `review_status`, `reviewed_by`, `reviewed_at`, `schema_version`.

Do not add every field without validating use cases and taxonomy.

## Taxonomy principles
- Classification IDs and enum values remain language-neutral.
- Localized labels belong in localization dictionaries or localization records.
- Define one canonical field for primary muscle/category semantics; resolve overlaps among `category`, `body_part`, `muscle_group`, and `target`.
- Equipment values should be normalized to enums plus optional descriptive detail.
- Secondary muscle involvement should be defined consistently. Do not automatically treat all secondary muscles as full-volume sets.
- Avoid embedding arbitrary AI prose in taxonomy fields.

## AI enrichment workflow
1. Admin selects exercise or batch.
2. Backend sends approved source data and enrichment schema to provider.
3. Provider output is parsed as untrusted data.
4. Schema validation and domain validation run.
5. Provenance is recorded per batch/field where feasible.
6. Admin reviews, edits, approves/rejects.
7. Approved content becomes a draft dataset release.
8. Release validation and diff review.
9. Publish immutable version; mobile clients consume compatible release.
10. Rollback to previous release if needed.

## Quality states
Suggested: `unreviewed`, `ai_draft`, `needs_review`, `approved`, `rejected`, `published`, `deprecated`. Exact states and transitions should be defined.

## Dataset versioning
- Semantic or date-based dataset release IDs.
- Release changelog.
- Schema version.
- Validation report.
- Approved record count.
- Dataset artifact checksum.
- Rollback capability.

## AI content policy
AI may suggest classifications and prose. Do not automatically publish safety-critical, anatomy, nutrition, or exercise claims without review. Mark unknown rather than hallucinate. Never allow AI to change stable IDs or media paths unless a controlled migration explicitly authorizes it.
