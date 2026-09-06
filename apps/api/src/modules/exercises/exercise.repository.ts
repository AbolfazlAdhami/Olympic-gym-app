import { prisma } from "../../config/database";
import type { ExerciseQuery } from "./exercise.query";

export async function findExercises(query: ExerciseQuery) {
  const { page, limit, q, equipment, category, difficulty, muscle } = query;

  const where = {
    ...(q
      ? {
          OR: [
            {
              nameEn: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              slug: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(equipment ? { equipment } : {}),

    ...(category ? { category } : {}),

    ...(difficulty ? { difficulty } : {}),

    ...(muscle
      ? {
          OR: [
            {
              primaryMuscles: {
                some: {
                  muscle: {
                    equals: muscle,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
              secondaryMuscles: {
                some: {
                  muscle: {
                    equals: muscle,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.exercise.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        nameEn: "asc",
      },
      include: {
        translations: true,
        aliases: true,
      },
    }),

    prisma.exercise.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
}

export async function findExerciseById(id: string) {
  return prisma.exercise.findUnique({
    where: {
      id,
    },
    include: {
      translations: true,
      aliases: true,
    },
  });
}