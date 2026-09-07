import type { Exercise } from "../../generated/prisma/client";

type ExerciseWithRelations = Exercise & {
  primaryMuscles: {
    muscle: string;
  }[];

  secondaryMuscles: {
    muscle: string;
  }[];

  instructions: {
    step: number;
    text: string;
  }[];

  images: {
    url: string;
    position: number;
  }[];

  translations: {
    language: string;
    name: string;
    description: string | null;
  }[];

  aliases: {
    language: string;
    alias: string;
    normalized: string;
  }[];
};

export function mapExercise(exercise: ExerciseWithRelations) {
  return {
    id: exercise.id,
    name: exercise.nameEn,
    slug: exercise.slug,

    metadata: {
      force: exercise.force,
      mechanic: exercise.mechanic,
      equipment: exercise.equipment,
      category: exercise.category,
      difficulty: exercise.difficulty,
    },

    muscles: {
      primary: exercise.primaryMuscles.map((item) => item.muscle),
      secondary: exercise.secondaryMuscles.map((item) => item.muscle),
    },

    instructions: exercise.instructions.map((item) => ({
      step: item.step,
      text: item.text,
    })),

    images: exercise.images.sort((a, b) => a.position - b.position).map((item) => item.url),

    translations: exercise.translations.map((item) => ({
      language: item.language,
      name: item.name,
      description: item.description,
    })),

    aliases: exercise.aliases.map((item) => ({
      language: item.language,
      alias: item.alias,
      normalized: item.normalized,
    })),
  };
}
