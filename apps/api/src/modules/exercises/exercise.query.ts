import { z } from "zod";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const exerciseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),

  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),

  q: z.string().trim().min(1).optional(),
  equipment: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  difficulty: z.string().trim().min(1).optional(),
  muscle: z.string().trim().min(1).optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
  sort: z.enum(["name"]).default("name"),
});

export type ExerciseQuery = z.infer<typeof exerciseQuerySchema>;

export function parseExerciseQuery(query: Record<string, unknown>) {
  return exerciseQuerySchema.parse(query);
}

