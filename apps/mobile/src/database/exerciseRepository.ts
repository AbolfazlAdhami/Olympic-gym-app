import type { SQLiteDatabase } from "expo-sqlite";
import {
  BODY_PARTS,
  EQUIPMENT_VALUES,
  EXERCISE_CATEGORIES,
  MUSCLE_GROUPS,
  SECONDARY_MUSCLES,
  TARGETS,
} from "@gym-app/shared";
import type { BodyPart, Equipment, Exercise, ExerciseCategory, MuscleGroup, SecondaryMuscle, Target } from "@gym-app/shared";

export interface ExerciseFilters {
  readonly search?: string;
  readonly category?: ExerciseCategory;
  readonly bodyPart?: BodyPart;
  readonly equipment?: Equipment;
  readonly target?: Target;
}

export type ExerciseListItem = Pick<
  Exercise,
  "id" | "name" | "category" | "bodyPart" | "equipment" | "muscleGroup" | "target" | "image" | "gifUrl"
>;

interface ExerciseListRow {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  muscle_group: string;
  target: string;
  image: string;
  gif_url: string;
}

interface ExerciseDetailRow extends ExerciseListRow {
  instructions_json: string;
  media_id: string;
  created_at: string;
}

interface SecondaryMuscleRow {
  muscle: string;
}

function parseEnum<T extends string>(value: string, allowedValues: readonly string[], field: string): T {
  if (!allowedValues.some((allowedValue) => allowedValue === value)) {
    throw new Error(`Invalid ${field} value stored in the exercise database: ${value}`);
  }

  return value as T;
}

function parseStringArray(value: string, field: string): string[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`Invalid JSON stored for ${field}.`);
  }

  if (!Array.isArray(parsed) || !parsed.every((item: unknown) => typeof item === "string")) {
    throw new Error(`Invalid string array stored for ${field}.`);
  }

  return parsed;
}

function mapListRow(row: ExerciseListRow): ExerciseListItem {
  return {
    id: row.id,
    name: row.name,
    category: parseEnum<ExerciseCategory>(row.category, EXERCISE_CATEGORIES, "category"),
    bodyPart: parseEnum<BodyPart>(row.body_part, BODY_PARTS, "body_part"),
    equipment: parseEnum<Equipment>(row.equipment, EQUIPMENT_VALUES, "equipment"),
    muscleGroup: parseEnum<MuscleGroup>(row.muscle_group, MUSCLE_GROUPS, "muscle_group"),
    target: parseEnum<Target>(row.target, TARGETS, "target"),
    image: row.image,
    gifUrl: row.gif_url,
  };
}

export async function listExercises(
  database: SQLiteDatabase,
  filters: ExerciseFilters = {},
): Promise<ExerciseListItem[]> {
  const conditions: string[] = [];
  const parameters: string[] = [];

  if (filters.search !== undefined && filters.search.trim().length > 0) {
    conditions.push("(name LIKE ? ESCAPE '\\' OR target LIKE ? ESCAPE '\\' OR muscle_group LIKE ? ESCAPE '\\')");
    const escapedSearch = filters.search.trim().replace(/[\\%_]/g, "\\$&");
    const searchParameter = `%${escapedSearch}%`;
    parameters.push(searchParameter, searchParameter, searchParameter);
  }

  if (filters.category !== undefined) {
    conditions.push("category = ?");
    parameters.push(filters.category);
  }

  if (filters.bodyPart !== undefined) {
    conditions.push("body_part = ?");
    parameters.push(filters.bodyPart);
  }

  if (filters.equipment !== undefined) {
    conditions.push("equipment = ?");
    parameters.push(filters.equipment);
  }

  if (filters.target !== undefined) {
    conditions.push("target = ?");
    parameters.push(filters.target);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await database.getAllAsync<ExerciseListRow>(
    `SELECT id, name, category, body_part, equipment, muscle_group, target, image, gif_url
     FROM exercises
     ${whereClause}
     ORDER BY name COLLATE NOCASE`,
    ...parameters,
  );

  return rows.map(mapListRow);
}

export async function getExerciseById(database: SQLiteDatabase, exerciseId: string): Promise<Exercise | null> {
  const row = await database.getFirstAsync<ExerciseDetailRow>(
    `SELECT id, name, category, body_part, equipment, instructions_json, muscle_group,
            target, image, gif_url, media_id, created_at
     FROM exercises
     WHERE id = ?`,
    exerciseId,
  );

  if (row === null) {
    return null;
  }

  const secondaryMuscleRows = await database.getAllAsync<SecondaryMuscleRow>(
    `SELECT muscle
     FROM exercise_secondary_muscles
     WHERE exercise_id = ?
     ORDER BY muscle COLLATE NOCASE`,
    exerciseId,
  );

  return {
    id: row.id,
    name: row.name,
    category: parseEnum<ExerciseCategory>(row.category, EXERCISE_CATEGORIES, "category"),
    bodyPart: parseEnum<BodyPart>(row.body_part, BODY_PARTS, "body_part"),
    equipment: parseEnum<Equipment>(row.equipment, EQUIPMENT_VALUES, "equipment"),
    instructions: parseStringArray(row.instructions_json, "exercise instructions"),
    muscleGroup: parseEnum<MuscleGroup>(row.muscle_group, MUSCLE_GROUPS, "muscle_group"),
    secondaryMuscles: secondaryMuscleRows.map((item) =>
      parseEnum<SecondaryMuscle>(item.muscle, SECONDARY_MUSCLES, "secondary muscle"),
    ),
    target: parseEnum<Target>(row.target, TARGETS, "target"),
    image: row.image,
    gifUrl: row.gif_url,
    mediaId: row.media_id,
    createdAt: row.created_at,
  };
}

export async function addExerciseToFavorites(
  database: SQLiteDatabase,
  userId: string,
  exerciseId: string,
): Promise<void> {
  await database.runAsync(
    `INSERT OR IGNORE INTO favorite_exercises (user_id, exercise_id)
     VALUES (?, ?)`,
    userId,
    exerciseId,
  );
}

export async function removeExerciseFromFavorites(
  database: SQLiteDatabase,
  userId: string,
  exerciseId: string,
): Promise<void> {
  await database.runAsync(
    `DELETE FROM favorite_exercises
     WHERE user_id = ? AND exercise_id = ?`,
    userId,
    exerciseId,
  );
}

export async function isExerciseFavorite(
  database: SQLiteDatabase,
  userId: string,
  exerciseId: string,
): Promise<boolean> {
  const row = await database.getFirstAsync<{ is_favorite: number }>(
    `SELECT EXISTS (
       SELECT 1 FROM favorite_exercises
       WHERE user_id = ? AND exercise_id = ?
     ) AS is_favorite`,
    userId,
    exerciseId,
  );

  return row?.is_favorite === 1;
}

export async function listFavoriteExercises(
  database: SQLiteDatabase,
  userId: string,
): Promise<ExerciseListItem[]> {
  const rows = await database.getAllAsync<ExerciseListRow>(
    `SELECT e.id, e.name, e.category, e.body_part, e.equipment, e.muscle_group,
            e.target, e.image, e.gif_url
     FROM favorite_exercises AS f
     INNER JOIN exercises AS e ON e.id = f.exercise_id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC, e.name COLLATE NOCASE`,
    userId,
  );

  return rows.map(mapListRow);
}
