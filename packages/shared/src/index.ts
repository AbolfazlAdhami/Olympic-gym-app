export const EXERCISE_CATEGORIES = [
  "back",
  "cardio",
  "chest",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist",
] as const;

export const BODY_PARTS = EXERCISE_CATEGORIES;

export const EQUIPMENT_VALUES = [
  "assisted",
  "band",
  "barbell",
  "body weight",
  "bosu ball",
  "cable",
  "dumbbell",
  "elliptical machine",
  "ez barbell",
  "hammer",
  "kettlebell",
  "leverage machine",
  "medicine ball",
  "olympic barbell",
  "resistance band",
  "roller",
  "rope",
  "skierg machine",
  "sled machine",
  "smith machine",
  "stability ball",
  "stationary bike",
  "stepmill machine",
  "tire",
  "trap bar",
  "upper body ergometer",
  "weighted",
  "wheel roller",
] as const;

export const MUSCLE_GROUPS = [
  "abdominals",
  "ankle stabilizers",
  "ankles",
  "biceps",
  "calves",
  "chest",
  "core",
  "deltoids",
  "forearms",
  "glutes",
  "hamstrings",
  "hands",
  "hip flexors",
  "latissimus dorsi",
  "lats",
  "lower back",
  "obliques",
  "quadriceps",
  "rhomboids",
  "rotator cuff",
  "shoulders",
  "soleus",
  "trapezius",
  "traps",
  "triceps",
  "upper back",
  "wrist extensors",
  "wrist flexors",
  "wrists",
] as const;

export const TARGETS = [
  "abductors",
  "abs",
  "adductors",
  "biceps",
  "calves",
  "cardiovascular system",
  "delts",
  "forearms",
  "glutes",
  "hamstrings",
  "lats",
  "levator scapulae",
  "pectorals",
  "quads",
  "serratus anterior",
  "spine",
  "traps",
  "triceps",
  "upper back",
] as const;

export const SECONDARY_MUSCLES = [
  "abdominals",
  "ankle stabilizers",
  "ankles",
  "back",
  "biceps",
  "brachialis",
  "calves",
  "chest",
  "core",
  "deltoids",
  "feet",
  "forearms",
  "glutes",
  "grip muscles",
  "groin",
  "hamstrings",
  "hands",
  "hip flexors",
  "inner thighs",
  "latissimus dorsi",
  "lats",
  "lower abs",
  "lower back",
  "obliques",
  "quadriceps",
  "rear deltoids",
  "rhomboids",
  "rotator cuff",
  "shins",
  "shoulders",
  "soleus",
  "sternocleidomastoid",
  "trapezius",
  "traps",
  "triceps",
  "upper back",
  "upper chest",
  "wrist extensors",
  "wrist flexors",
  "wrists",
] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];
export type BodyPart = (typeof BODY_PARTS)[number];
export type Equipment = (typeof EQUIPMENT_VALUES)[number];
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
export type Target = (typeof TARGETS)[number];
export type SecondaryMuscle = (typeof SECONDARY_MUSCLES)[number];

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  bodyPart: BodyPart;
  equipment: Equipment;
  instructions: string[];
  muscleGroup: MuscleGroup;
  secondaryMuscles: SecondaryMuscle[];
  target: Target;
  image: string;
  gifUrl: string;
  mediaId: string;
  createdAt: string;
}
