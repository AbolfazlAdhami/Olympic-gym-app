# Security, Privacy, and Safety

## Secrets
- Provider keys, DB credentials, signing secrets, and storage credentials belong in secret management or protected environment configuration.
- Never place provider keys in mobile bundles, frontend environment variables that are client-exposed, source control, or logs.
- Separate development/staging/production secrets.
- Rotate keys and restrict provider account permissions.

## Authentication
- Secure session/token strategy.
- Refresh token rotation and revocation.
- Protect web against CSRF if cookie-based auth is used.
- Store mobile tokens in OS-backed secure storage.
- Enforce authorization server-side.
- Admin routes require separate roles/permissions and audit logging.

## Fitness data privacy
- Collect the minimum data needed.
- Treat body measurements, photos, workout records, nutrition, and fitness profile as sensitive personal data.
- Consent and clear purpose for AI processing.
- Data retention controls, export, deletion, and account removal.
- Avoid personal data in analytics and logs.
- Protect photo storage and URLs; do not expose public photo access by default.

## AI security
- Prompt injection: retrieved content is untrusted; tool instructions are server-defined.
- Allowlist tools; validate arguments; enforce user scope.
- Bound tool calls, time, tokens, and cost.
- Never let model output execute code, SQL, or arbitrary URLs.
- Validate structured outputs and domain rules.
- Require confirmation for consequential writes.
- Track AI provider/model and prompt versions.
- Apply moderation/guardrails appropriate to content.

## Health and safety scope
- The app is fitness guidance, not medical diagnosis or treatment.
- Avoid asserting diagnoses or treating injuries.
- Users reporting pain, concerning symptoms, or medical conditions should be directed to qualified healthcare professionals.
- Nutrition estimates are estimates; avoid extreme or unsafe recommendations.
- AI content that affects safety must be reviewed and evaluated.

## Admin audit
Record who edited, approved, rejected, published, or rolled back content; retain before/after diffs where appropriate without logging unnecessary secrets or personal data.
