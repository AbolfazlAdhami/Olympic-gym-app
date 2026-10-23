# Fitness dataset Persian translator

This project converts the original multilingual exercise records into a Persian-focused dataset.

## Output contract
- JSON keys remain English.
- Only Persian content is retained for translated text fields.
- `instructions` is an array of Persian strings.
- `instruction_steps` and `attribution` are omitted.
- `id`, `media_id`, `image`, `gif_url`, and `created_at` are preserved.
- English source values remain in the input file; output is written separately.

## Important schema note
The supplied source schema and sample have `instructions` as a multilingual map and `instruction_steps` as a language-to-array map. The output schema in this bundle is intentionally a new schema: `instructions` is a single array of strings and `instruction_steps` / `attribution` are not allowed. `body_part` uses the Persian enum values defined in the output schema.

The script reads `instructions.en` from the original source. It also accepts an already converted array of instructions or an `instructions.fa` array, to support safe reruns.

## Setup

Use Node.js 20+.

```bash
npm install openai dotenv ajv ajv-formats
npm install -D typescript tsx @types/node
```

Create `.env`:

```dotenv
OPENAI_BASE_URL=http://localhost:20128/v1
OPENAI_API_KEY=local-not-needed
OPENAI_MODEL=cx/gpt-6-luna
INPUT_FILE=./exercises.json
OUTPUT_FILE=./exercises.fa.json
CHECKPOINT_FILE=./.translation-checkpoint.json
FAILED_FILE=./translation-failures.json
GLOSSARY_FILE=./glossary.fa.json
SCHEMA_FILE=./exercises.fa.schema.json
DELAY_MS=250
MAX_RETRIES=3
```

Do not commit real API keys. If your local server requires an API key, set it in `.env`; never hardcode it in TypeScript.

Run:

```bash
npx tsx index.ts
```

Limit a test run:

```bash
LIMIT=5 npx tsx index.ts
```

Re-translate Persian fields intentionally:

```bash
OVERWRITE_PERSIAN=true npx tsx index.ts
```

## Workflow and recovery
- Output is written atomically to a separate file after each successful record.
- `.translation-checkpoint.json` tracks completed IDs.
- `translation-failures.json` records failed records and errors; failed records are not marked complete.
- Restarting the script resumes from output/checkpoint data; valid prior output records are checked against the output schema before being skipped.
- Once every record is present, the script validates the full output against the revised schema.
- Keep a backup of the source JSON and never set `OUTPUT_FILE` to the source path.

## Accuracy notes
- The prompt requests the same number of instruction items as the English sentence split; records with count mismatch fail rather than silently changing order.
- Review `glossary.fa.json` periodically. Unknown classification terms are translated by the model and should be added to the glossary after human review for long-term consistency.
- The example source says `3/4 sit-up` and `hip flexors`; the example translation prompt preserves the source's anatomy wording rather than independently diagnosing whether a dataset classification is ideal.
- The model identifier is used exactly as supplied. Confirm it is exposed by your local server before a full run.
