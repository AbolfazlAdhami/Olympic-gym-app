import { prisma } from "../../config/database";

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
