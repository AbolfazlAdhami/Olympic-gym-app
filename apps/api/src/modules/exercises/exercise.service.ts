import { findExerciseById, findExercises } from "./exercise.repository";
import { toExerciseDto, type ExerciseDto } from "./exercise.dto";
import type { ExerciseQuery } from "./exercise.query";
import { NotFoundError } from "../../errors/app-error";

export async function getExercises(query: ExerciseQuery) {
  const { page, limit } = query;

  const { items, total } = await findExercises(query);

  const totalPages = Math.ceil(total / limit);

  return {
    items: items.map(toExerciseDto),
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getExerciseById(id: string): Promise<ExerciseDto> {
  const exercise = await findExerciseById(id);

  if (!exercise) {
    throw new NotFoundError("Exercise not found");
  }

  return toExerciseDto(exercise);
}
