# Gym App Development Roadmap

## Product direction

Refactor and complete the existing Persian-first Expo fitness app. Keep exercise text and structure usable offline in device SQLite, and load image and GIF media from the dataset source repository. Store stable English enum keys and display Persian labels.

## Current repository baseline

- npm workspaces monorepo is present at the repository root.
- Expo SDK 54 app is present in `apps/mobile` and uses Expo Router.
- Shared exercise and enum TypeScript contracts are present in `packages/shared/src/index.ts` and follow the current dataset values.
- Exercise schema, database client, JSON parser, seed routine, and bootstrap are present in `apps/mobile/src/database`.
- Current app data asset is `apps/mobile/assets/data/exercises.fa.json`; database seed import must match that path.
- Existing routes include onboarding, home, exercise list, exercise detail, profile/favorites, and not-found screens under `apps/mobile/src/app`.
- Database schema currently defines the actual exercise fields, normalized secondary-muscle relations, local user profiles, local registration records, exercise favorites, and enum lookup tables with Persian labels. Review the current source before relying on this summary because the implementation may evolve.
- User-requested additions still to implement include local profile registration/session flows, favorite exercise UI, and additional screens.

## Phases and acceptance criteria

### Phase 1 — Existing monorepo and app baseline

**Status: Complete.** This phase is already present; do not recreate the workspace or Expo app.

Acceptance criteria: root workspaces resolve `apps/*` and `packages/*`; the mobile app starts with the existing Expo Router entry; shared code is importable from the app.

### Phase 2 — Offline SQLite domain and data

**Status: In progress.**

Scope:

1. Review and finalize schema and migrations for exercises, normalized muscles, enum lookup tables, local user profiles, registration metadata, and favorites.
2. Ensure the translated exercise JSON conforms to the shared contract, has valid enum values, and is bundled from the active dataset path.
3. Make initialization idempotent and safe: schema/migrations first, then transactional seed; avoid duplicate seed rows and preserve user-owned data when exercise content is refreshed.
4. Add typed database repositories for exercise queries, profile registration/read/update, and favorite add/remove/list/check operations.
5. Add indexes for common list, search, filter, and favorite queries; use bound parameters and transactions.

Acceptance criteria: a fresh installation creates a usable local database and seeds the complete valid dataset; repeated launches do not duplicate records; exercise filtering uses the dataset's enum values; favorite relations enforce valid user and exercise foreign keys; database failures surface in a recoverable way.

### Phase 3 — Account and navigation flows

**Status: In progress.**

Scope:

1. Define the account model as a local profile unless a backend/auth provider is explicitly introduced.
2. Add registration and profile screens with Persian validation, accessible input behavior, and clear empty/error/success states.
3. Add an explicit current-profile/session selection mechanism suitable for a local-only app.
4. Add favorites screen and detail/list actions backed by SQLite.
5. Integrate routes into the existing Expo Router navigation without breaking current exercise routes.

Acceptance criteria: a user can register a local profile, view/update it, favorite/unfavorite an exercise, and see favorites after app restart. Do not claim secure multi-device authentication without a backend.

### Phase 4 — Exercise experience and media

**Status: In progress.** Existing exercise screens and data are present; audit and finish their data integration.

Scope:

1. Read exercise list and detail data from SQLite repositories rather than parsing JSON in screens.
2. Add debounced search and composable enum/muscle filters using Persian labels while retaining English keys in storage.
3. Use performant virtualized lists appropriate to the installed Expo/RN versions.
4. Resolve dataset image and GIF paths to source-repository URLs and show them with `expo-image`.
5. Keep core text and structure functional offline; media may require an internet connection before it is cached.

Acceptance criteria: list/detail/search/filter screens use local database data; image failure does not block exercise content; large datasets remain responsive.

### Phase 5 — Production readiness

**Status: Planned.**

Scope:

1. Audit accessibility, RTL/Persian typography, dark/neon theme, empty/loading/error states, and navigation behavior.
2. Review database versioning/migrations and seed refresh strategy.
3. Review Expo app config, app icon/splash assets, EAS profiles, permissions, and release metadata.
4. Resolve lint/type errors and run the validation commands requested for the task.
5. Document known limitations and release/build steps.

Acceptance criteria: production configuration is internally consistent; documented setup and build commands work; no known critical data-loss or offline usability issue remains.

## Working log

### 2026-10-23 — Database schema foundation

- Added local user, registration metadata, favorites, and enum lookup tables to `apps/mobile/src/database/schema.ts`.
- Corrected the seed JSON import to `apps/mobile/assets/data/exercises.fa.json` after the previous underscored filename was absent.
- TypeScript validation passed with `npx tsc --noEmit` from `apps/mobile`.
- Next: verify data and schema compatibility, then implement typed repositories and SQLite migrations before wiring new screens.

### 2026-10-23 — Typed SQLite repositories

- Added typed exercise list/detail queries with enum and JSON validation in `apps/mobile/src/database/exerciseRepository.ts`.
- Added parameterized favorite add/remove/check/list operations for local profiles.
- Replaced direct exercise SQL in list and detail screens with repository calls.
- TypeScript validation passed with `npx tsc --noEmit` from `apps/mobile`.
- Next: implement the local profile/session store and registration/profile/favorites routes; do not add plaintext password storage or present local profiles as secure authentication.

### 2026-10-23 — Dataset-aligned SQLite schema

- Replaced the previously assumed exercise shape with the actual dataset fields: category, body part, equipment, instructions, muscle group, secondary muscles, target, image, GIF, media ID, and creation timestamp.
- Updated shared TypeScript types and JSON parsing to validate the dataset's exact English values; no level, force, or mechanic fields are required.
- Added a version 2 SQLite migration that rebuilds exercise and enum tables while retaining local profile and favorite table rows; exercise data is seeded again after migration.
- Updated exercise list and detail screens to remove unsupported attributes and display the dataset values.
- TypeScript validation passed with `npx tsc --noEmit` from `apps/mobile`.
- Lint could not run because Expo attempted to install missing ESLint dependencies and network access was unavailable; the attempted package changes were removed.
- Next: verify migration and seeding on device, then confirm all dataset media is bundled locally.

### 2026-10-23 — Dataset updates and category contract

- Restricted JSON Schema `category` to the same ten values present in the dataset and SQLite enum table.
- Added schema version 3 metadata storage and a deterministic fingerprint of all parsed exercise fields.
- Replaced first-install-only seeding with transactional synchronization: changed records are upserted, secondary-muscle links are refreshed, removed records are deleted, and favorites for retained exercise IDs remain linked.
- Added a non-destructive migration from schema version 2 to version 3.
- TypeScript validation, JSON category-set comparison (10 values across 1,324 records), and `git diff --check` passed.
- Persian enum display is now requested; keep the shared mappings complete for all current dataset enum values.

### 2026-10-23 — Relative exercise media paths

- Added one shared, path-validating resolver for the dataset's relative `images/` and `videos/` paths.
- Replaced the obsolete image host in the exercise list and detail routes with the matching dataset media repository.
- Exercise detail gallery now includes both its thumbnail and GIF path.

### 2026-10-23 — Bundle exercise media locally

- Updated exercise media resolution to find image and GIF files in `apps/mobile/assets/images` and `apps/mobile/assets/videos` using Metro asset contexts.
- Exercise list and detail screens now render bundled asset references, so the media does not require a network connection.
- Confirmed the assets directory contains one image and one GIF for each of the 1,324 dataset exercises. TypeScript typecheck and `git diff --check` pass.

### 2026-10-23 — Load exercise media from the dataset source

- Replaced Metro asset contexts with validated URLs to the public `hasaneyldrm/exercises-dataset` image and video folders.
- Added the repository-root `.easignore` to keep exercise images, GIFs, source-only datasets, and translation tooling out of the EAS archive while retaining the local SQLite dataset and shared package.
- Media now requires an internet connection for first load; exercise text and structure remain available offline. TypeScript typecheck and ignore-pattern checks pass.
- TypeScript validation and `git diff --check` passed.
- At the time of this entry, the label map remained unused per the user's earlier English-display choice; the later Persian-label request supersedes it.

### 2026-10-23 — Roadmap documentation

- Replaced greenfield initialization instructions with guidance for working on the existing repository.
- Added this phased roadmap and recorded current implementation status.

### 2026-10-23 — Data-driven home screen

- Replaced static category and count content with totals queried from the local exercise database.
- Added a direct action to open the exercise library and a compact view of the four most populated dataset categories.
- Added loading, empty, and retry states for the home summary. TypeScript validation and `git diff --check` passed.

### 2026-10-23 — Persian enum labels

- Added compile-time-complete Persian labels for every current category, body-part, equipment, muscle-group, secondary-muscle, and target enum.
- Applied Persian labels across the home, exercise list, filters, and exercise detail screens while retaining stable English enum keys in SQLite and search.
- Updated SQLite enum lookup-table labels in place, without replacing referenced enum keys or requiring a schema-version migration.
- TypeScript validation and `git diff --check` passed.

### 2026-10-23 — Exercise detail experience

- Reworked exercise details around local movement GIFs with a separate static-image option.
- Clarified the target, body area, equipment, primary and supporting muscles, and step-by-step instructions using the Persian enum labels.
- Kept loading, missing-media, empty-instructions, and retry states. TypeScript validation and `git diff --check` passed.

### 2026-10-23 — First-run profile and favorites

- Added a Persian welcome and registration screen that creates a local profile with display name and email; it stores no password and does not present the profile as cloud authentication.
- Added schema version 4 to allow password-free local profiles and persist the active profile ID while preserving existing profile and favorite rows.
- Added the user tab with local profile details and a removable, offline favorites list; exercise details can add or remove favorites for the active profile.
- Routed first-time users through onboarding before opening the home screen. TypeScript validation and `git diff --check` passed.

### 2026-10-23 — Favorites query and exercise-list performance

- Renamed the SQLite `EXISTS` result alias to `is_favorite` so the favorite-state query parses correctly.
- Cached the local media context keys and removed redundant JSON parsing from exercise image resolution.
- Memoized list cards and stabilized `renderItem` callbacks for both exercise and favorites lists. TypeScript validation and `git diff --check` passed.
