import exerciseDataset from "../../assets/data/exercises_fa.json";
import { CATEGORY_LABELS, EQUIPMENT_LABELS, FORCE_LABELS, LEVEL_LABELS, MECHANIC_LABELS, MUSCLE_LABELS } from "@gym-app/shared";
import type { Category, Equipment, Exercise, Force, Level, Mechanic, Muscle } from "@gym-app/shared";

function asRecord(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${context} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];

  if (typeof value !== "string") {
    throw new Error(`${key} must be a string.`);
  }

  return value;
}

function readStringArray(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];

  if (!Array.isArray(value) || !value.every((item: unknown) => typeof item === "string")) {
    throw new Error(`${key} must be an array of strings.`);
  }

  return value;
}

function parseEnum<T extends Record<string, string>>(value: unknown, labels: T, field: string): keyof T;
function parseEnum<T extends Record<string, string>>(value: unknown, labels: T, field: string, nullable: true): keyof T | null;
function parseEnum<T extends Record<string, string>>(value: unknown, labels: T, field: string, nullable = false): keyof T | null {
  if (value === null && nullable) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`${field} must be a string${nullable ? " or null" : ""}.`);
  }

  const match = Object.entries(labels).find((entry) => entry[1] === value);

  if (!match) {
    throw new Error(`Unknown ${field} value: ${value}`);
  }

  return match[0] as keyof T;
}

function parseMuscles(value: unknown, field: string): Muscle[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value.map((item: unknown, index: number) => parseEnum(item, MUSCLE_LABELS, `${field}[${index}]`));
}

function parseExercise(value: unknown): Exercise {
  const record = asRecord(value, "Exercise");

  return {
    id: readString(record, "id"),
    name: readString(record, "name"),
    level: parseEnum(record["level"], LEVEL_LABELS, "level") as Level,
    force: parseEnum(record["force"], FORCE_LABELS, "force", true) as Force | null,
    mechanic: parseEnum(record["mechanic"], MECHANIC_LABELS, "mechanic", true) as Mechanic | null,
    equipment: parseEnum(record["equipment"], EQUIPMENT_LABELS, "equipment", true) as Equipment | null,
    primaryMuscles: parseMuscles(record["primaryMuscles"], "primaryMuscles"),
    secondaryMuscles: parseMuscles(record["secondaryMuscles"], "secondaryMuscles"),
    instructions: readStringArray(record, "instructions"),
    category: parseEnum(record["category"], CATEGORY_LABELS, "category") as Category,
    images: readStringArray(record, "images"),
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
