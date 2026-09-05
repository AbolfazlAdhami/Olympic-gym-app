/*
  Warnings:

  - You are about to drop the column `gifUrl` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Exercise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "gifUrl",
DROP COLUMN "thumbnailUrl",
DROP COLUMN "videoUrl",
ADD COLUMN     "force" TEXT,
ADD COLUMN     "mechanic" TEXT;

-- CreateTable
CREATE TABLE "ExerciseMuscle" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "muscle" TEXT NOT NULL,

    CONSTRAINT "ExerciseMuscle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSecondaryMuscle" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "muscle" TEXT NOT NULL,

    CONSTRAINT "ExerciseSecondaryMuscle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseInstruction" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "ExerciseInstruction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseImage" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ExerciseImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseMuscle_exerciseId_muscle_key" ON "ExerciseMuscle"("exerciseId", "muscle");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseSecondaryMuscle_exerciseId_muscle_key" ON "ExerciseSecondaryMuscle"("exerciseId", "muscle");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseInstruction_exerciseId_step_key" ON "ExerciseInstruction"("exerciseId", "step");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseImage_exerciseId_position_key" ON "ExerciseImage"("exerciseId", "position");

-- AddForeignKey
ALTER TABLE "ExerciseMuscle" ADD CONSTRAINT "ExerciseMuscle_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSecondaryMuscle" ADD CONSTRAINT "ExerciseSecondaryMuscle_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseInstruction" ADD CONSTRAINT "ExerciseInstruction_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseImage" ADD CONSTRAINT "ExerciseImage_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
