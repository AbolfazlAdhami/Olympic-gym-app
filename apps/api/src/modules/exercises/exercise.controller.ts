import type { Request, Response } from "express";

import { parseExerciseQuery } from "./exercise.query";
import { getExerciseById, getExercises } from "./exercise.service";
import { listResponse, successResponse } from "../../shared/http/api-response";


export async function getExercisesController(req: Request, res: Response) {
  const query = parseExerciseQuery(req.query);

  const result = await getExercises(query);

  res.json(listResponse(result.items, result.meta));
}

export async function getExerciseByIdController(req: Request, res: Response) {
  const exerciseId = req.params.id as string;
  const exercise = await getExerciseById(exerciseId);

  res.json(successResponse(exercise));
}
