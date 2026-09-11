import type { Exercise, ExerciseAlias, ExerciseImage, ExerciseInstruction, ExerciseMuscle, ExerciseSecondaryMuscle, ExerciseTranslation } from "../../generated/prisma/client";
import type { ExerciseDto } from "./exercise.dto";

type ExerciseWithRelations = Exercise & {
  primaryMuscles: ExerciseMuscle[];
  secondaryMuscles: ExerciseSecondaryMuscle[];
  instructions: ExerciseInstruction[];
  translations: ExerciseTranslation[];
  aliases: ExerciseAlias[];
  images: ExerciseImage[];
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

    primaryMuscles: exercise.primaryMuscles.map((item) => item.muscle),

    secondaryMuscles: exercise.secondaryMuscles.map((item) => item.muscle),

    instructions: exercise.instructions.map((item) => ({
      step: item.step,
      text: item.text,
    })),

    images: exercise.images
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        url: item.url,
        position: item.position,
      })),

    translations: exercise.translations.map((item) => ({
      language: item.language,
      name: item.name,
      description: item.description,
    })),

    aliases: exercise.aliases.map((item) => ({
      language: item.language,
      alias: item.alias,
    })),
  };
}
