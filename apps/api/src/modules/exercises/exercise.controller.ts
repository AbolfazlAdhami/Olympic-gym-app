import type { Request, Response } from "express";

import { parseExerciseQuery } from "./exercise.query";
import { getExerciseById, getExercises } from "./exercise.service";
import { listResponse, successResponse } from "../../shared/http/api-response";
import { mapExercise } from "./exercise.mapper";

export async function getExercisesController(req: Request, res: Response) {
  const query = parseExerciseQuery(req.query);

  const result = await getExercises(query);

 return res.json(
   listResponse(result.items, {
     page: query.page,
     limit: query.limit,
     total: result.meta.total,
     totalPages: Math.ceil(result.meta.total / query.limit),
   }),
 );
}

export async function getExerciseByIdController(req: Request, res: Response) {
  const exerciseId = req.params.id as string;
  const exercise = await getExerciseById(exerciseId);

  res.json(successResponse(exercise));
}
