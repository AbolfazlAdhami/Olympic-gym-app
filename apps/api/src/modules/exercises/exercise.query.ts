import { normalizePersian } from "@gym-app/utils";

export type ExerciseQuery = {
  page: number;
  limit: number;
  q?: string;
  equipment?: string;
  category?: string;
  difficulty?: string;
  muscle?: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function parseExerciseQuery(query: Record<string, unknown>): ExerciseQuery {
  const page = parsePositiveInt(typeof query.page === "string" ? query.page : undefined, DEFAULT_PAGE);

  const requestedLimit = parsePositiveInt(typeof query.limit === "string" ? query.limit : undefined, DEFAULT_LIMIT);

  const limit = Math.min(requestedLimit, MAX_LIMIT);

  const q = typeof query.q === "string" && query.q.trim() ? query.q.trim() : undefined;

  const equipment = typeof query.equipment === "string" && query.equipment.trim() ? query.equipment.trim() : undefined;

  const category = typeof query.category === "string" && query.category.trim() ? query.category.trim() : undefined;

  const difficulty = typeof query.difficulty === "string" && query.difficulty.trim() ? query.difficulty.trim() : undefined;

  const muscle = typeof query.muscle === "string" && query.muscle.trim() ? query.muscle.trim() : undefined;

  return {
    page,
    limit,
    q,
    equipment,
    category,
    difficulty,
    muscle,
  };
}
