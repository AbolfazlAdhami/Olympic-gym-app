-- CreateIndex
CREATE INDEX "Exercise_equipment_idx" ON "Exercise"("equipment");

-- CreateIndex
CREATE INDEX "Exercise_category_idx" ON "Exercise"("category");

-- CreateIndex
CREATE INDEX "Exercise_difficulty_idx" ON "Exercise"("difficulty");

-- CreateIndex
CREATE INDEX "ExerciseMuscle_muscle_idx" ON "ExerciseMuscle"("muscle");

-- CreateIndex
CREATE INDEX "ExerciseSecondaryMuscle_muscle_idx" ON "ExerciseSecondaryMuscle"("muscle");

-- Enable trigram extension for substring search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigram indexes for exercise search
CREATE INDEX "Exercise_nameEn_trgm_idx"
ON "Exercise"
USING GIN ("nameEn" gin_trgm_ops);

CREATE INDEX "Exercise_slug_trgm_idx"
ON "Exercise"
USING GIN ("slug" gin_trgm_ops);