# API Conventions

## Style
- REST, versioned prefix (e.g. `/api/v1`).
- OpenAPI documentation.
- JSON request/response.
- Auth and authorization applied per route.
- Validate inputs at the boundary.
- Consistent response and error shape.
- Pagination for list endpoints.
- Idempotency for workout sync and other retryable writes.

## Example response
```json
{
  "success": true,
  "data": {},
  "metadata": {
    "requestId": "request-id",
    "timestamp": "2026-01-01T00:00:00.000Z"
  }
}
```

## Example error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  },
  "metadata": {
    "requestId": "request-id",
    "timestamp": "2026-01-01T00:00:00.000Z"
  }
}
```

## Endpoint families (illustrative)
- `/auth/*`
- `/users/me`
- `/fitness-profile`
- `/exercises`
- `/programs`
- `/programs/{id}/activate`
- `/workout-sessions`
- `/workout-sessions/{id}/sets`
- `/progress/metrics`
- `/progress/records`
- `/foods`
- `/meals`
- `/nutrition/logs`
- `/ai/coach`
- `/admin/exercises/enrichment`
- `/admin/dataset-releases`

## Workout sync
- Include client-generated operation IDs.
- Use idempotency keys for retryable mutations.
- Server validates ownership and session state.
- Define merge/conflict behavior for edits, deletes, and duplicate submissions.
- Do not trust client totals; compute canonical totals server-side or validate.

## API security
- Do not expose provider credentials.
- Use rate limits and request size limits.
- Validate ownership on every user-specific resource.
- Use role-based access for admin.
- Avoid logging sensitive payloads.
