import type { SQLiteDatabase } from "expo-sqlite";
import type { Exercise } from "@gym-app/shared";
import { getExerciseSeed } from "./seedData";

let seedPromise: Promise<void> | null = null;

export function seedExercisesIfNeeded(database: SQLiteDatabase): Promise<void> {
  if (seedPromise === null) {
    seedPromise = synchronizeExerciseDataset(database).catch((error: unknown) => {
      seedPromise = null;
      throw error;
    });
  }

  return seedPromise;
}

function calculateDatasetVersion(exercises: readonly Exercise[]): string {
  const serializedDataset = JSON.stringify(exercises);
  let firstHash = 0x811c9dc5;
  let secondHash = 0x9747b28c;

  for (let index = 0; index < serializedDataset.length; index += 1) {
    const characterCode = serializedDataset.charCodeAt(index);
    firstHash = Math.imul(firstHash ^ characterCode, 0x01000193);
    secondHash = Math.imul(secondHash ^ characterCode, 0x5bd1e995);
    secondHash ^= secondHash >>> 13;
  }

  const firstHex = (firstHash >>> 0).toString(16).padStart(8, "0");
  const secondHex = (secondHash >>> 0).toString(16).padStart(8, "0");
  return `${exercises.length}:${firstHex}${secondHex}`;
}

async function synchronizeExerciseDataset(database: SQLiteDatabase): Promise<void> {
  const exercises = getExerciseSeed();

  if (exercises.length === 0) {
    throw new Error("The exercise seed dataset is empty.");
  }

  const datasetVersion = calculateDatasetVersion(exercises);
  const versionRow = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_metadata WHERE name = ?",
    "exercise_dataset_version",
  );

  if (versionRow?.value === datasetVersion) {
    return;
  }

  await database.execAsync(`
    CREATE TEMP TABLE IF NOT EXISTS seed_exercise_ids (
      id TEXT PRIMARY KEY NOT NULL
    );
    DELETE FROM seed_exercise_ids;
  `);

  const exerciseStatement = await database.prepareAsync(`
    INSERT INTO exercises (
      id,
      name,
      category,
      body_part,
      equipment,
      instructions_json,
      muscle_group,
      target,
      image,
      gif_url,
      media_id,
      created_at
    ) VALUES (
      $id,
      $name,
      $category,
      $bodyPart,
      $equipment,
      $instructions,
      $muscleGroup,
      $target,
      $image,
      $gifUrl,
      $mediaId,
      $createdAt
    )
    ON CONFLICT (id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      body_part = excluded.body_part,
      equipment = excluded.equipment,
      instructions_json = excluded.instructions_json,
      muscle_group = excluded.muscle_group,
      target = excluded.target,
      image = excluded.image,
      gif_url = excluded.gif_url,
      media_id = excluded.media_id,
      created_at = excluded.created_at
  `);

  const secondaryMuscleDeleteStatement = await database.prepareAsync(
    "DELETE FROM exercise_secondary_muscles WHERE exercise_id = ?",
  );
  const secondaryMuscleInsertStatement = await database.prepareAsync(
    `INSERT INTO exercise_secondary_muscles (exercise_id, muscle)
     VALUES ($exerciseId, $muscle)`,
  );
  const datasetIdStatement = await database.prepareAsync(
    "INSERT INTO seed_exercise_ids (id) VALUES (?)",
  );

  try {
    await database.withTransactionAsync(async () => {
      for (const exercise of exercises) {
        await datasetIdStatement.executeAsync(exercise.id);
        await exerciseStatement.executeAsync({
          $id: exercise.id,
          $name: exercise.name,
          $category: exercise.category,
          $bodyPart: exercise.bodyPart,
          $equipment: exercise.equipment,
          $instructions: JSON.stringify(exercise.instructions),
          $muscleGroup: exercise.muscleGroup,
          $target: exercise.target,
          $image: exercise.image,
          $gifUrl: exercise.gifUrl,
          $mediaId: exercise.mediaId,
          $createdAt: exercise.createdAt,
        });

        await secondaryMuscleDeleteStatement.executeAsync(exercise.id);

        for (const muscle of exercise.secondaryMuscles) {
          await secondaryMuscleInsertStatement.executeAsync({
            $exerciseId: exercise.id,
            $muscle: muscle,
          });
        }
      }

      await database.runAsync(
        `DELETE FROM exercises
         WHERE NOT EXISTS (
           SELECT 1 FROM seed_exercise_ids WHERE seed_exercise_ids.id = exercises.id
         )`,
      );

      await database.runAsync(
        `INSERT INTO app_metadata (name, value)
         VALUES (?, ?)
         ON CONFLICT (name) DO UPDATE SET
           value = excluded.value,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
        "exercise_dataset_version",
        datasetVersion,
      );
    });
  } finally {
    await Promise.all([
      exerciseStatement.finalizeAsync(),
      secondaryMuscleDeleteStatement.finalizeAsync(),
      secondaryMuscleInsertStatement.finalizeAsync(),
      datasetIdStatement.finalizeAsync(),
    ]);
  }
}
