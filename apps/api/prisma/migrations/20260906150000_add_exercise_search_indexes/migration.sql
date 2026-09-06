CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Exercise_nameEn_trgm_idx"
ON "Exercise"
USING GIN ("nameEn" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Exercise_slug_trgm_idx"
ON "Exercise"
USING GIN ("slug" gin_trgm_ops);