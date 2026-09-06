import type { Request, Response } from "express";

import { parseExerciseQuery } from "./exercise.query";
import { getExerciseById, getExercises } from "./exercise.service";

import { NotFoundError } from "../../errors/app-error";

export async function getExercisesController(req: Request, res: Response) {
  try {
    const query = parseExerciseQuery(req.query);

    const result = await getExercises(query);

    res.json({
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function getExerciseByIdController(req: Request, res: Response) {
  try {
    const exerciseId = req.params.id as string;
    const exercise = await getExerciseById(exerciseId);

    res.json({
      data: exercise,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(error.statusCode).json({
        error: error.message,
      });

      return;
    }
    res.status(500).json({
      error: "Internal server error",
    });
  }
}
