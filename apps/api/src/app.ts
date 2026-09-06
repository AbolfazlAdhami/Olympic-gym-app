import cors from "cors";
import express from "express";

import exerciseRoutes from "./modules/exercises/exercise.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

//  Test Error Route
app.get("/api/v1/test-error", () => {
  throw new Error("Something went wrong");
});

app.use("/api/v1/exercises", exerciseRoutes);

app.use(errorMiddleware);

export default app;
