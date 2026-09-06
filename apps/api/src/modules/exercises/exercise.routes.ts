import { Router } from "express";

import { parseExerciseQuery } from "./exercise.query";
import { getExerciseById, getExercises } from "./exercise.service";

const router = Router();

router.get("/", async (req, res) => {
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
});

router.get("/:id", async (req, res) => {
  try {
    const exercise = await getExerciseById(req.params.id);

    res.json({
      data: exercise,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Exercise not found") {
      res.status(404).json({
        error: "Exercise not found",
      });

      return;
    }

    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;
