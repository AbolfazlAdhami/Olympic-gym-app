import exerciseDataset from "../../assets/data/exercises.fa.json";
import {
  BODY_PARTS,
  EQUIPMENT_VALUES,
  EXERCISE_CATEGORIES,
  MUSCLE_GROUPS,
  SECONDARY_MUSCLES,
  TARGETS,
} from "@gym-app/shared";
import type { BodyPart, Equipment, Exercise, ExerciseCategory, MuscleGroup, SecondaryMuscle, Target } from "@gym-app/shared";

function asRecord(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${context} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${key} must be a non-empty string.`);
  }

  return value;
}

function readStringArray(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];

  if (!Array.isArray(value) || !value.every((item: unknown) => typeof item === "string" && item.trim().length > 0)) {
    throw new Error(`${key} must be an array of non-empty strings.`);
  }

  return value;
}

function parseEnum<T extends string>(value: string, allowedValues: readonly string[], field: string): T {
  if (!allowedValues.some((allowedValue) => allowedValue === value)) {
    throw new Error(`Unknown ${field} value: ${value}`);
  }

  return value as T;
}

function parseExercise(value: unknown): Exercise {
  const record = asRecord(value, "Exercise");
  const createdAt = readString(record, "created_at");

  if (Number.isNaN(Date.parse(createdAt))) {
    throw new Error("created_at must be a valid date-time string.");
  }

  const image = readString(record, "image");
  const gifUrl = readString(record, "gif_url");

  if (!image.startsWith("images/") || !gifUrl.startsWith("videos/")) {
    throw new Error("Exercise image paths must use the images/ and videos/ directories.");
  }

  return {
    id: readString(record, "id"),
    name: readString(record, "name"),
    category: parseEnum<ExerciseCategory>(readString(record, "category"), EXERCISE_CATEGORIES, "category"),
    bodyPart: parseEnum<BodyPart>(readString(record, "body_part"), BODY_PARTS, "body_part"),
    equipment: parseEnum<Equipment>(readString(record, "equipment"), EQUIPMENT_VALUES, "equipment"),
    instructions: readStringArray(record, "instructions"),
    muscleGroup: parseEnum<MuscleGroup>(readString(record, "muscle_group"), MUSCLE_GROUPS, "muscle_group"),
    secondaryMuscles: readStringArray(record, "secondary_muscles").map((muscle) =>
      parseEnum<SecondaryMuscle>(muscle, SECONDARY_MUSCLES, "secondary_muscles"),
    ),
    target: parseEnum<Target>(readString(record, "target"), TARGETS, "target"),
    image,
    gifUrl,
    mediaId: readString(record, "media_id"),
    createdAt,
  };
}

let parsedExercises: Exercise[] | undefined;

export function getExerciseSeed(): readonly Exercise[] {
  if (parsedExercises === undefined) {
    const dataset: unknown = exerciseDataset;

    if (!Array.isArray(dataset)) {
      throw new Error("The exercise dataset must be an array.");
    }

    const exercises = dataset.map(parseExercise);
    const ids = new Set<string>();

    for (const exercise of exercises) {
      if (ids.has(exercise.id)) {
        throw new Error(`Duplicate exercise id: ${exercise.id}`);
      }

      ids.add(exercise.id);
    }

    parsedExercises = exercises;
  }

  return parsedExercises;
}
