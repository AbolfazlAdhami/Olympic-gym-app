import { prisma } from "../../config/database";
import { Prisma } from "../../generated/prisma/client";
import type { ExerciseQuery } from "./exercise.query";
import { normalizePersian } from "@gym-app/utils";

export async function findExercises(query: ExerciseQuery) {
  const { page, limit, q, equipment, category, difficulty, muscle } = query;

  const filters: Prisma.ExerciseWhereInput[] = [];

  if (q) {
    const normalizedQ = normalizePersian(q);

    filters.push({
      OR: [
        {
          nameEn: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          translations: {
            some: { name: { contains: normalizedQ, mode: "insensitive" } },
          },
        },
        {
          aliases: {
            some: {
              alias: {
                contains: normalizedQ,
                mode: "insensitive",
              },
            },
          },
        },
        {
          aliases: {
            some: {
              normalized: {
                contains: normalizedQ,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }

  if (equipment) {
    filters.push({
      equipment,
    });
  }

  if (category) {
    filters.push({
      category,
    });
  }

  if (difficulty) {
    filters.push({
      difficulty,
    });
  }

  if (muscle) {
    filters.push({
      OR: [
        {
          primaryMuscles: {
            some: {
              muscle: {
                equals: muscle,
                mode: "insensitive",
              },
            },
          },
        },
        {
          secondaryMuscles: {
            some: {
              muscle: {
                equals: muscle,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }

  const where: Prisma.ExerciseWhereInput = {
    AND: filters,
  };

  const skip = (page - 1) * limit;
  const [items, total] = await prisma.$transaction([
    prisma.exercise.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ nameEn: "asc" }, { id: "asc" }],
      include: {
        primaryMuscles: true,
        secondaryMuscles: true,
        instructions: {
          orderBy: {
            step: "asc",
          },
        },
        images: {
          orderBy: {
            position: "asc",
          },
        },
        translations: true,
        aliases: true,
      },
    }),
    prisma.exercise.count({ where }),
  ]);

  return { items, total };
}



export async function findExerciseById(id: string) {
  return prisma.exercise.findUnique({
    where: { id },
    include: {
      primaryMuscles: true,
      secondaryMuscles: true,
      instructions: {
        orderBy: {
          step: "asc",
        },
      },
      images: {
        orderBy: {
          position: "asc",
        },
      },
      translations: true,
      aliases: true,
    },
  });
}