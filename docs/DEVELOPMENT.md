# Development Workflow

## Repository setup
- Inspect current repo before reorganizing.
- Choose and standardize package manager.
- Configure workspace packages.
- Set TypeScript strictness.
- Lint, format, test, and build.
- Establish environment variable validation.
- Add Docker Compose for local dependencies.
- Add CI workflow for lint/typecheck/tests/build.

## Branching and commits
- Use small feature branches or the team's agreed strategy.
- Conventional Commit messages.
- Keep changes focused and reviewable.

## Suggested task loop
1. Read docs and issue.
2. Inspect code and current tests.
3. Write acceptance criteria.
4. Plan implementation.
5. Implement minimal change.
6. Add tests.
7. Run targeted tests and full checks as appropriate.
8. Update docs.
9. Summarize changes, decisions, test results, and follow-up.

## Quality gates
- Typecheck.
- Lint.
- Unit tests.
- Integration tests for API/data boundaries.
- Mobile build or simulator smoke test for mobile changes.
- RTL/Persian layout test.
- Schema and migration validation.
- Security review for auth, AI, user data, or admin changes.

## Environment variables
Create `.env.example` with names and safe placeholders. Validate required variables at startup. Do not include real secrets. Keep local `.env` ignored.

## Dataset changes
- Validate dataset against schema.
- Produce diff and report.
- Preserve stable IDs.
- Check referenced media.
- Update dataset release version.
- Document any breaking migration.

## AI feature changes
- Update schemas and tool contracts.
- Add evaluation cases.
- Test invalid and malicious model output.
- Check grounding and permission scope.
- Measure provider cost and latency.
