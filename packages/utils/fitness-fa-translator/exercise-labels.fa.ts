// exercise-labels.fa.ts

export const BODY_PART_LABELS_FA: Record<string, string> = {
  back: "پشت",
  cardio: "هوازی",
  chest: "سینه",
  "lower arms": "ساعد",
  "lower legs": "ساق پا",
  neck: "گردن",
  shoulders: "شانه",
  "upper arms": "بازو",
  "upper legs": "ران",
  waist: "میان‌تنه",
};

export const CATEGORY_LABELS_FA: Record<string, string> = {
  ...BODY_PART_LABELS_FA,
};

export const EQUIPMENT_LABELS_FA: Record<string, string> = {
  machine: "دستگاه",
  cable: "سیم‌کش",
  barbell: "هالتر",
  dumbbell: "دمبل",
  "body weight": "وزن بدن",
  "body only": "وزن بدن",
  bands: "کش ورزشی",
  "medicine ball": "توپ طبی",
  kettlebells: "کتل‌بل",
  "foam roll": "فوم رول",
  "e-z curl bar": "میله EZ",
  "exercise ball": "توپ ورزشی",
  "smith machine": "دستگاه اسمیت",
  "trap bar": "هالتر ترپ",
  other: "سایر تجهیزات",
};

export const MUSCLE_LABELS_FA: Record<string, string> = {
  abs: "عضلات شکم",
  abdominals: "عضلات شکم",
  "hip flexors": "عضلات خم‌کننده مفصل ران",
  "lower back": "عضلات پایین کمر",
  "middle back": "عضلات بخش میانی پشت",
  lats: "عضله پشتی بزرگ (زیربغل)",
  chest: "عضلات سینه",
  biceps: "جلو بازو",
  triceps: "پشت بازو",
  forearms: "ساعد",
  shoulders: "شانه",
  deltoids: "عضلات دلتوئید",
  traps: "عضله ذوزنقه‌ای (کول)",
  quadriceps: "عضلات چهارسر ران",
  hamstrings: "عضلات پشت ران",
  calves: "عضلات ساق پا",
  glutes: "عضلات سرینی",
  abductors: "عضلات دورکننده ران",
  adductors: "عضلات نزدیک‌کننده ران",
  neck: "عضلات گردن",
  obliques: "عضلات مورب شکم",
};

type LabelGroup = "body_part" | "category" | "equipment" | "muscle";

const LABEL_GROUPS: Record<LabelGroup, Record<string, string>> = {
  body_part: BODY_PART_LABELS_FA,
  category: CATEGORY_LABELS_FA,
  equipment: EQUIPMENT_LABELS_FA,
  muscle: MUSCLE_LABELS_FA,
};

/**
 * Returns the Persian label if available.
 * Unknown values fall back to their original English value.
 */
export function getExerciseLabel(
  group: LabelGroup,
  value: string | null | undefined,
): string {
  if (!value) return "";

  return LABEL_GROUPS[group][value.trim().toLowerCase()] ?? value;
}
