import type { Exercise, ExerciseAlias, ExerciseImage, ExerciseInstruction, ExerciseMuscle, ExerciseSecondaryMuscle, ExerciseTranslation } from "../../generated/prisma/client";

type ExerciseWithRelations = Exercise & {
  primaryMuscles: ExerciseMuscle[];
  secondaryMuscles: ExerciseSecondaryMuscle[];
  instructions: ExerciseInstruction[];
  translations: ExerciseTranslation[];
  aliases: ExerciseAlias[];
  images: ExerciseImage[];
};

export type ExerciseDto = {
  id: string;
  name: string;
  slug: string;

  force: string | null;
  mechanic: string | null;
  equipment: string | null;
  category: string | null;
  difficulty: string | null;

  primaryMuscles: string[];
  secondaryMuscles: string[];

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
  }[];
};

export function toExerciseDto(exercise: ExerciseWithRelations): ExerciseDto {
  return {
    id: exercise.id,
    name: exercise.nameEn,
    slug: exercise.slug,

    force: exercise.force,
    mechanic: exercise.mechanic,
    equipment: exercise.equipment,
    category: exercise.category,
    difficulty: exercise.difficulty,

    primaryMuscles: exercise.primaryMuscles.map((item: ExerciseMuscle) => item.muscle),

    secondaryMuscles: exercise.secondaryMuscles.map((item: ExerciseSecondaryMuscle) => item.muscle),

    instructions: exercise.instructions.map((item: ExerciseInstruction) => ({
      step: item.step,
      text: item.text,
    })),

    images: exercise.images.map((item: ExerciseImage) => ({
      url: item.url,
      position: item.position,
    })),

    translations: exercise.translations.map((item: ExerciseTranslation) => ({
      language: item.language,
      name: item.name,
      description: item.description,
    })),

    
    aliases: exercise.aliases.map((item: ExerciseAlias) => ({
      language: item.language,
      alias: item.alias,
    })),
  };
}
