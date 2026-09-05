import { findExerciseById } from "./exercise.repository";

export async function getExerciseById(id: string) {
  const exercise = await findExerciseById(id);

  if (!exercise) {
    throw new Error("Exercise not found");
  }

  return exercise;
}
