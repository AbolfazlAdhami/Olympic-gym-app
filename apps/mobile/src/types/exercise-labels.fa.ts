import type {
  BodyPart,
  Equipment,
  ExerciseCategory,
  MuscleGroup,
  SecondaryMuscle,
  Target,
} from "@gym-app/shared";

export const BODY_PART_LABELS_FA: Record<BodyPart, string> = {
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

export const CATEGORY_LABELS_FA: Record<ExerciseCategory, string> = BODY_PART_LABELS_FA;

export const EQUIPMENT_LABELS_FA: Record<Equipment, string> = {
  assisted: "کمک‌دار",
  band: "کش ورزشی",
  barbell: "هالتر",
  "body weight": "وزن بدن",
  "bosu ball": "توپ بوسو",
  cable: "سیم‌کش",
  dumbbell: "دمبل",
  "elliptical machine": "دستگاه الپتیکال",
  "ez barbell": "هالتر EZ",
  hammer: "چکش تمرینی",
  kettlebell: "کتل‌بل",
  "leverage machine": "دستگاه اهرمی",
  "medicine ball": "توپ طبی",
  "olympic barbell": "هالتر المپیکی",
  "resistance band": "کش مقاومتی",
  roller: "فوم رولر",
  rope: "طناب",
  "skierg machine": "دستگاه اسکی ارگ",
  "sled machine": "دستگاه سورتمه",
  "smith machine": "دستگاه اسمیت",
  "stability ball": "توپ تعادلی",
  "stationary bike": "دوچرخهٔ ثابت",
  "stepmill machine": "دستگاه پله",
  tire: "لاستیک تمرینی",
  "trap bar": "هالتر ترپ",
  "upper body ergometer": "ارگومتر بالاتنه",
  weighted: "وزنه‌دار",
  "wheel roller": "چرخ شکم",
};

type MuscleLabelKey = MuscleGroup | SecondaryMuscle | Target;

export const MUSCLE_LABELS_FA: Record<MuscleLabelKey, string> = {
  abdominals: "شکم",
  "ankle stabilizers": "تثبیت‌کننده‌های مچ پا",
  ankles: "مچ پا",
  back: "پشت",
  biceps: "جلو بازو",
  brachialis: "عضلهٔ بازویی",
  calves: "ساق پا",
  chest: "سینه",
  core: "میان‌تنه",
  deltoids: "دلتوئید",
  feet: "پاها",
  forearms: "ساعد",
  glutes: "باسن (سرینی)",
  "grip muscles": "عضلات گیرش",
  groin: "کشالهٔ ران",
  hamstrings: "پشت پا (همسترینگ)",
  hands: "دست‌ها",
  "hip flexors": "خم‌کننده‌های ران",
  "inner thighs": "داخل ران",
  "latissimus dorsi": "پشتی بزرگ",
  lats: "زیربغل",
  "lower abs": "پایین شکم",
  "lower back": "فیلهٔ کمر",
  obliques: "عضلات مورب شکم",
  quadriceps: "چهارسر ران",
  "rear deltoids": "دلتوئید پشتی",
  rhomboids: "عضلات لوزی پشت",
  "rotator cuff": "چرخاننده‌های شانه",
  shins: "جلوی ساق پا",
  shoulders: "شانه",
  soleus: "عضلهٔ نعلی ساق",
  sternocleidomastoid: "عضلهٔ جناغی‌چنبری‌پستانی",
  trapezius: "ذوزنقه‌ای",
  traps: "کول",
  triceps: "پشت بازو",
  "upper back": "بالای پشت",
  "upper chest": "بالای سینه",
  "wrist extensors": "بازکننده‌های مچ دست",
  "wrist flexors": "خم‌کننده‌های مچ دست",
  wrists: "مچ دست",
  abs: "شکم",
  abductors: "دورکننده‌های ران",
  adductors: "نزدیک‌کننده‌های ران",
  "cardiovascular system": "دستگاه قلبی‌عروقی",
  delts: "شانه (دلتوئید)",
  "levator scapulae": "بالابرندهٔ کتف",
  pectorals: "عضلات سینه‌ای",
  quads: "چهارسر ران",
  "serratus anterior": "دندانه‌ای قدامی",
  spine: "ستون فقرات",
};

type LabelGroup = "body_part" | "category" | "equipment" | "muscle" | "target";

const LABEL_GROUPS: Record<LabelGroup, Readonly<Record<string, string>>> = {
  body_part: BODY_PART_LABELS_FA,
  category: CATEGORY_LABELS_FA,
  equipment: EQUIPMENT_LABELS_FA,
  muscle: MUSCLE_LABELS_FA,
  target: MUSCLE_LABELS_FA,
};

/** Returns the Persian label; unknown values remain visible for safe forward compatibility. */
export function getExerciseLabel(group: LabelGroup, value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return LABEL_GROUPS[group][value.trim().toLowerCase()] ?? value;
}
