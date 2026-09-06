import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";

import { prisma } from "../src/config/database";

type SourceExercise = {
  id: string;
  name: string;
  force: string | null;
  level: string | null;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string | null;
  images: string[];
};

const DATASET_PATH = path.resolve(process.cwd(), "data/exercises.json");

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Reading exercise dataset...");

  const file = await fs.readFile(DATASET_PATH, "utf-8");
  const exercises = JSON.parse(file) as SourceExercise[];

  console.log(`Found ${exercises.length} exercises.`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const source of exercises) {
    try {
      const slug = slugify(source.name);

      if (!slug) {
        throw new Error(`Could not generate slug for "${source.name}"`);
      }

      const existing = await prisma.exercise.findUnique({
        where: { slug },
        select: { id: true },
      });

      const exercise = existing
        ? await prisma.exercise.update({
            where: { id: existing.id },
            data: {
              nameEn: source.name,
              force: source.force,
              mechanic: source.mechanic,
              equipment: source.equipment,
              category: source.category,
              difficulty: source.level,
            },
          })
        : await prisma.exercise.create({
            data: {
              nameEn: source.name,
              slug,
              force: source.force,
              mechanic: source.mechanic,
              equipment: source.equipment,
              category: source.category,
              difficulty: source.level,
            },
          });

      await prisma.$transaction([
        prisma.exerciseMuscle.deleteMany({
          where: { exerciseId: exercise.id },
        }),

        prisma.exerciseSecondaryMuscle.deleteMany({
          where: { exerciseId: exercise.id },
        }),

        prisma.exerciseInstruction.deleteMany({
          where: { exerciseId: exercise.id },
        }),

        prisma.exerciseImage.deleteMany({
          where: { exerciseId: exercise.id },
        }),

        prisma.exerciseMuscle.createMany({
          data: source.primaryMuscles.map((muscle) => ({
            exerciseId: exercise.id,
            muscle,
          })),
        }),

        prisma.exerciseSecondaryMuscle.createMany({
          data: source.secondaryMuscles.map((muscle) => ({
            exerciseId: exercise.id,
            muscle,
          })),
        }),

        prisma.exerciseInstruction.createMany({
          data: source.instructions.map((text, index) => ({
            exerciseId: exercise.id,
            step: index + 1,
            text,
          })),
        }),

        prisma.exerciseImage.createMany({
          data: source.images.map((url, index) => ({
            exerciseId: exercise.id,
            url,
            position: index,
          })),
        }),
      ]);

      if (existing) {
        updated++;
      } else {
        created++;
      }

      if ((created + updated) % 100 === 0) {
        console.log(`Progress: ${created + updated}/${exercises.length}`);
      }
    } catch (error) {
      failed++;

      console.error(`Failed to import "${source.name}" (${source.id})`, error);
    }
  }

  console.log("\nImport completed.");
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
}

main()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
