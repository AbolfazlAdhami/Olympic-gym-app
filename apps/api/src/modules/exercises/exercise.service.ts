import { findExerciseById, findExercises } from "./exercise.repository";

import type { ExerciseQuery } from "./exercise.query";

export async function getExercises(query: ExerciseQuery) {
  const { page, limit } = query;

  const { items, total } = await findExercises(query);

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getExerciseById(id: string) {
  const exercise = await findExerciseById(id);

  if (!exercise) {
    throw new Error("Exercise not found");
  }

  return exercise;
}
