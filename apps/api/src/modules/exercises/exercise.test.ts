import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../app";

describe("GET /api/v1/exercises", () => {
  it("returns a paginated list of exercises", async () => {
    const response = await request(app).get("/api/v1/exercises").query({
      limit: 1,
    });

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("meta");

    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data).toHaveLength(1);

    expect(response.body.meta).toEqual({
      page: 1,
      limit: 1,
      total: 876,
      totalPages: 876,
    });
  });
});



describe("GET /api/v1/exercises/:id", () => {
  it("returns 404 when the exercise does not exist", async () => {
    const response = await request(app).get("/api/v1/exercises/00000000-0000-0000-0000-000000000000");

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      error: "Exercise not found",
    });
  });
});