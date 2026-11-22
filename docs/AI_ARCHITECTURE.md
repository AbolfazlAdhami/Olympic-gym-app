# AI Architecture

## Objective
Build a domain-specialized bodybuilding coach by grounding a capable existing model in proprietary exercise, nutrition, program, and user-progress data. Do not train a foundation model from scratch initially.

## Components
- Provider adapter: vendor-independent interface.
- AI orchestrator: intent routing, context construction, tool execution, output validation.
- Tools: exercise search, program retrieval, workout history, nutrition search, metrics, program draft generation, substitution search.
- Retrieval: curated coaching knowledge documents and approved dataset content.
- Program engine: deterministic generation and validation.
- Evaluation suite: golden test cases, regression checks, safety checks, Persian-language tests.
- Admin operations: prompt/model versioning, cost/usage, review, evaluation, provider config.

## Retrieval strategy
- Structured exercise/food/user data: SQL filters and queries first.
- Curated knowledge: keyword and vector retrieval; pgvector may be used initially.
- Hybrid retrieval and reranking only if needed.
- Keep source IDs and provenance so responses can cite/identify data origins in-app.

## Tool security
- Tools are explicitly allowlisted.
- Tool arguments are schema-validated.
- User identity and permissions come from server auth context, never model arguments.
- Read tools have scoped access.
- Write actions (program activation, log edits, profile changes) require explicit user confirmation where appropriate.
- Rate limits, timeouts, max tool iterations, and cost limits.
- Treat retrieved documents as data, not instructions; defend against prompt injection.
- Do not expose secrets to model context.

## Structured program generation
Model proposes a structured draft or requests a deterministic program-engine tool. Validate:
1. JSON schema.
2. Exercise IDs exist and are published.
3. Equipment constraints.
4. User constraints and authorization.
5. Volume and schedule rules.
6. Domain rules and workload.
7. Program version and persistence permissions.
Invalid outputs are rejected/repaired under bounded retry; never silently accept.

## Fine-tuning strategy
Consider fine-tuning only after:
- Stable task definitions and schemas exist.
- Curated consented training examples are available.
- Evaluation benchmark exists.
- Baseline provider/model performance is measured.
- Fine-tuning has a clear measurable target (e.g. structured output compliance, coaching tone, intent classification).
Fine-tuning does not replace retrieval or deterministic calculations. Do not train from scratch in early stages.

## Evaluation
Track:
- Structured schema pass rate.
- Valid catalog ID rate.
- Groundedness and source correctness.
- Program rule pass rate.
- Persian quality.
- Safety and refusal correctness.
- Tool selection and tool argument correctness.
- Latency, cost, and user feedback.
- Regression by model/prompt version.

## AI enrichment
AI-generated content remains draft until validation and human review. Record provider/model, prompt/schema version, timestamps, and review state. Apply batch cost budgets, retry limits, and concurrency limits.
