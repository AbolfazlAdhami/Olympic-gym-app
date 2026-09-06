import { Router } from "express";

import { getExerciseByIdController, getExercisesController } from "./exercise.controller";

const router = Router();

router.get("/", getExercisesController);

router.get("/:id", getExerciseByIdController);

export default router;
