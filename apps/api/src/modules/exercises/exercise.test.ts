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

describe("GET /api/v1/exercises validation", () => {
  it("returns 400 for an invalid page", async () => {
    const response = await request(app).get("/api/v1/exercises").query({
      page: "abc",
    });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      error: "Validation failed",
      details: [
        {
          field: "page",
        },
      ],
    });
  });
});

describe("GET /api/v1/exercises search", () => {
  it("searches exercises by name", async () => {
    const response = await request(app).get("/api/v1/exercises").query({
      q: "bench",
      limit: 20,
    });

    expect(response.status).toBe(200);

    expect(response.body.data.length).toBeGreaterThan(0);

    expect(response.body.data.some((exercise: { name: string }) => exercise.name.toLowerCase().includes("bench"))).toBe(true);
  });
});

describe("GET /api/v1/exercises muscle filter", () => {
  it("filters exercises by muscle", async () => {
    const response = await request(app).get("/api/v1/exercises").query({
      muscle: "chest",
      limit: 20,
    });

    expect(response.status).toBe(200);

    expect(response.body.data.length).toBeGreaterThan(0);

    for (const exercise of response.body.data) {
      const muscles = [...exercise.primaryMuscles, ...exercise.secondaryMuscles];

      expect(muscles.some((muscle: string) => muscle.toLowerCase() === "chest")).toBe(true);
    }
  });
});

describe("GET /api/v1/exercises/:id success", () => {
  it("returns a complete exercise DTO", async () => {
    const listResponse = await request(app).get("/api/v1/exercises").query({
      q: "bench press",
      limit: 1,
    });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);

    const exerciseId = listResponse.body.data[0].id;

    const response = await request(app).get(`/api/v1/exercises/${exerciseId}`);

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("data");

    expect(response.body.data).toMatchObject({
      id: exerciseId,
      name: expect.any(String),
      slug: expect.any(String),
      primaryMuscles: expect.any(Array),
      secondaryMuscles: expect.any(Array),
      instructions: expect.any(Array),
      images: expect.any(Array),
      translations: expect.any(Array),
      aliases: expect.any(Array),
    });
  });
});


describe("GET /api/v1/exercises filters", () => {
  it("filters exercises by equipment", async () => {
    const response = await request(app).get("/api/v1/exercises").query({
      equipment: "barbell",
      limit: 20,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);

    for (const exercise of response.body.data) {
      expect(exercise.equipment).toBe("barbell");
    }
  });

  it("filters exercises by category", async () => {
    const response = await request(app).get("/api/v1/exercises").query({
      category: "strength",
      limit: 20,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);

    for (const exercise of response.body.data) {
      expect(exercise.category).toBe("strength");
    }
  });

  it("filters exercises by difficulty", async () => {
    const response = await request(app).get("/api/v1/exercises").query({
      difficulty: "beginner",
      limit: 20,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);

    for (const exercise of response.body.data) {
      expect(exercise.difficulty).toBe("beginner");
    }
  });
});


describe("GET /api/v1/exercises combined filters", () => {
  it("combines search and filters with AND", async () => {
    const response = await request(app).get("/api/v1/exercises").query({
      q: "bench",
      muscle: "chest",
      equipment: "barbell",
      limit: 20,
    });

    expect(response.status).toBe(200);

    expect(response.body.data.length).toBeGreaterThan(0);

    for (const exercise of response.body.data) {
      expect(exercise.name.toLowerCase()).toContain("bench");

      expect(exercise.equipment).toBe("barbell");

      const muscles = [...exercise.primaryMuscles, ...exercise.secondaryMuscles];

      expect(muscles.some((muscle: string) => muscle.toLowerCase() === "chest")).toBe(true);
    }
  });
});