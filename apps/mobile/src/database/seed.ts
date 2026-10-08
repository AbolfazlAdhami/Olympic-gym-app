import type { SQLiteDatabase } from "expo-sqlite";
import { getExerciseSeed } from "./seedData";

let seedPromise: Promise<void> | null = null;

export function seedExercisesIfNeeded(database: SQLiteDatabase): Promise<void> {
  if (seedPromise === null) {
    seedPromise = seedExercises(database).catch((error: unknown) => {
      seedPromise = null;
      throw error;
    });
  }

  return seedPromise;
}

async function seedExercises(database: SQLiteDatabase): Promise<void> {
  const row = await database.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM exercises");

  if (row === null) {
    throw new Error("Could not read the exercise count.");
  }

  if (row.count > 0) {
    return;
  }

  const exercises = getExerciseSeed();

  if (exercises.length === 0) {
    throw new Error("The exercise seed dataset is empty.");
  }

  const exerciseStatement = await database.prepareAsync(`
    INSERT INTO exercises (
      id,
      name,
      level,
      force,
      mechanic,
      equipment,
      category,
      instructions_json,
      images_json
    ) VALUES (
      $id,
      $name,
      $level,
      $force,
      $mechanic,
      $equipment,
      $category,
      $instructions,
      $images
    )
  `);

  const muscleStatement = await database.prepareAsync(`
    INSERT INTO exercise_muscles (
      exercise_id,
      muscle,
      role
    ) VALUES (
      $exerciseId,
      $muscle,
      $role
    )
  `);

  try {
    await database.withTransactionAsync(async () => {
      for (const exercise of exercises) {
        await exerciseStatement.executeAsync({
          $id: exercise.id,
          $name: exercise.name,
          $level: exercise.level,
          $force: exercise.force,
          $mechanic: exercise.mechanic,
          $equipment: exercise.equipment,
          $category: exercise.category,
          $instructions: JSON.stringify(exercise.instructions),
          $images: JSON.stringify(exercise.images),
        });

        for (const muscle of exercise.primaryMuscles) {
          await muscleStatement.executeAsync({
            $exerciseId: exercise.id,
            $muscle: muscle,
            $role: "primary",
          });
        }

        for (const muscle of exercise.secondaryMuscles) {
          await muscleStatement.executeAsync({
            $exerciseId: exercise.id,
            $muscle: muscle,
            $role: "secondary",
          });
        }
      }
    });
  } finally {
    await exerciseStatement.finalizeAsync();
    await muscleStatement.finalizeAsync();
  }
}
