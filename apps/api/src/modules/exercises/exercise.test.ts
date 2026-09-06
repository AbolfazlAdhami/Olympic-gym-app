import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../app";

describe("GET /api/v1/exercises", () => {
  it("returns a paginated list of exercises", async () => {
    const response = await request(app).get("/api/v1/exercises").query({
      limit: 10,
    });

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("meta");

    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data).toHaveLength(10);

    expect(response.body.meta).toEqual({
      page: 1,
      limit: 10,
      total: 876,
      totalPages: 88,
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

describe("GET /api/v1/exercises sorting", () => {
  it("returns exercises in different order for asc and desc", async () => {
    const ascResponse = await request(app).get("/api/v1/exercises").query({
      sort: "name",
      order: "asc",
      limit: 10,
    });

    const descResponse = await request(app).get("/api/v1/exercises").query({
      sort: "name",
      order: "desc",
      limit: 10,
    });

    expect(ascResponse.status).toBe(200);
    expect(descResponse.status).toBe(200);

    const ascNames = ascResponse.body.data.map((exercise: { name: string }) => exercise.name);

    const descNames = descResponse.body.data.map((exercise: { name: string }) => exercise.name);

    expect(ascNames).not.toEqual(descNames);

    expect(ascNames[0]).toBe("3/4 Sit-Up");
    expect(descNames[0]).toBe("Zottman Preacher Curl");
  });
});

it("returns 400 for an invalid sort", async () => {
  const response = await request(app).get("/api/v1/exercises").query({
    sort: "invalid",
  });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe("Validation failed");
});

it("returns 400 for an invalid order", async () => {
  const response = await request(app).get("/api/v1/exercises").query({
    order: "",
  });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe("Validation failed");
});


describe("GET /api/v1/exercises pagination validation", () => {
  it("returns 400 when page is 0", async () => {
    const response = await request(app).get("/api/v1/exercises").query({ page: 0 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
  });

  it("returns 400 when limit is 0", async () => {
    const response = await request(app).get("/api/v1/exercises").query({ limit: 0 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
  });

  it("returns 400 when limit exceeds the maximum", async () => {
    const response = await request(app).get("/api/v1/exercises").query({ limit: 101 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
  });

  it("returns an empty data array when page exceeds total pages", async () => {
    const response = await request(app).get("/api/v1/exercises").query({
      page: 9999,
      limit: 20,
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);

    expect(response.body.meta).toEqual({
      page: 9999,
      limit: 20,
      total: 876,
      totalPages: 44,
    });
  });
});


it("returns an empty result when no exercises match", async () => {
  const response = await request(app).get("/api/v1/exercises").query({
    q: "this-exercise-does-not-exist",
  });

  expect(response.status).toBe(200);

  expect(response.body.data).toEqual([]);

  expect(response.body.meta).toEqual({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
});