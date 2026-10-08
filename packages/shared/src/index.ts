export const LEVEL_LABELS = {
  beginner: "مبتدی",
  intermediate: "متوسط",
  expert: "پیشرفته",
} as const;

export type Level = keyof typeof LEVEL_LABELS;

export const FORCE_LABELS = {
  pull: "کششی",
  push: "فشاری",
  static: "ایستا",
} as const;

export type Force = keyof typeof FORCE_LABELS;

export const MECHANIC_LABELS = {
  isolation: "تک مفصلی (ایزوله)",
  compound: "چند مفصلی (کامپاند)",
} as const;

export type Mechanic = keyof typeof MECHANIC_LABELS;

export const EQUIPMENT_LABELS = {
  machine: "دستگاه",
  cable: "سیم‌کش",
  barbell: "هالتر",
  dumbbell: "دمبل",
  "body only": "وزن بدن",
  bands: "کش ورزشی",
  "medicine ball": "توپ طبی",
  kettlebells: "کتل‌بل",
  "foam roll": "فوم رول",
  "e-z curl bar": "میله لاری (EZ)",
  "exercise ball": "توپ سوئیسی",
  other: "سایر",
} as const;

export type Equipment = keyof typeof EQUIPMENT_LABELS;

export const CATEGORY_LABELS = {
  strength: "قدرتی",
  stretching: "کششی",
  plyometrics: "پلایومتریک",
  strongman: "مردان آهنین",
  powerlifting: "پاورلیفتینگ",
  cardio: "هوازی (کاردیو)",
  "olympic weightlifting": "وزنه‌برداری المپیکی",
} as const;

export type Category = keyof typeof CATEGORY_LABELS;

export const MUSCLE_LABELS = {
  abdominals: "شکم",
  abductors: "دورکننده‌ ران (ابداکتور)",
  adductors: "نزدیک‌کننده‌ ران (اداکتور)",
  biceps: "جلو بازو",
  calves: "ساق پا",
  chest: "سینه",
  forearms: "ساعد",
  glutes: "باسن (سرینی)",
  hamstrings: "پشت پا (همسترینگ)",
  lats: "زیربغل (پشتی بزرگ)",
  "lower back": "فیله کمر",
  "middle back": "بخش میانی پشت",
  neck: "گردن",
  quadriceps: "چهار سر ران",
  shoulders: "شانه (دلتوئید)",
  traps: "کول (ذوزنقه‌ای)",
  triceps: "پشت بازو",
} as const;

export type Muscle = keyof typeof MUSCLE_LABELS;

export interface Exercise {
  id: string;
  name: string;
  level: Level;
  force: Force | null;
  mechanic: Mechanic | null;
  equipment: Equipment | null;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  instructions: string[];
  category: Category;
  images: string[];
}
