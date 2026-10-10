import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

// استفاده از کلید API شما (اگر در .env تنظیم شده باشد)
const apiKey = process.env.API_KEY || "sk-16bbf52aed188fd3-cxq77w-e7967fb4";

if (!apiKey) {
  console.error("Error: API key is not defined.");
  process.exit(1);
}

// تنظیمات کلاینت با BaseURL لوکال شما
const openai = new OpenAI({
  baseURL: "http://localhost:20128/v1",
  apiKey: apiKey,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "FitnessApp Translator",
  },
});

const INPUT_FILE = path.join(__dirname, "exercises.json");
const OUTPUT_FILE = path.join(__dirname, "exercises_fully_translated.json");
const DELAY_BETWEEN_REQUESTS_MS = 1000;

interface Exercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

const dictionary = {
  level: {
    beginner: "مبتدی",
    intermediate: "متوسط",
    expert: "پیشرفته",
  } as Record<string, string>,

  force: {
    pull: "کششی",
    push: "فشاری",
    static: "ایستا",
  } as Record<string, string>,

  mechanic: {
    isolation: "تک مفصلی (ایزوله)",
    compound: "چند مفصلی (کامپاند)",
  } as Record<string, string>,

  equipment: {
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
  } as Record<string, string>,

  category: {
    strength: "قدرتی",
    stretching: "کششی",
    plyometrics: "پلایومتریک",
    strongman: "مردان آهنین",
    powerlifting: "پاورلیفتینگ",
    cardio: "هوازی (کاردیو)",
    "olympic weightlifting": "وزنه‌برداری المپیکی",
  } as Record<string, string>,

  muscles: {
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
  } as Record<string, string>,
};

const translateCategoryField = (
  dict: Record<string, string>,
  value: string | null,
): string | null => {
  if (!value) return null;
  return dict[value.toLowerCase()] || value;
};

const translateMuscles = (muscles: string[]): string[] => {
  return muscles.map((m) => dictionary.muscles[m.toLowerCase()] || m);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function translateWithAI(
  name: string,
  instructions: string[],
): Promise<{ translatedName: string; translatedInstructions: string[] }> {
  const textToTranslate = instructions.join("\n");
  const prompt = `You are a professional fitness expert. Translate the following exercise name and instructions into natural and highly accurate Persian.
Return EXACTLY a valid JSON object with no markdown formatting, no code blocks, and no extra text.

Format:
{
  "name": "Persian translation of the exercise name",
  "instructions": [
"Persian translation of instruction line 1",
"Persian translation of instruction line 2"
  ]
}

Input:
Exercise Name: ${name}
Instructions:
${textToTranslate}`;

  try {
    const response = await openai.chat.completions.create({
      model: "cx/gpt-6-luna",
      messages: [
        // مشکل کپی‌پیست اینجا بود که با حذف بک‌تیک‌ها از متن حل شد
        {
          role: "system",
          content:
            "You output only strictly valid JSON without any markdown formatting or backticks.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    let content = response.choices[0].message?.content?.trim();
    if (!content) throw new Error("Empty response from API");

    // پاکسازی امن بدون استفاده از سه بک‌تیک چسبیده به هم
    const mdBlockRegex = new RegExp("^`{3}(json)?\\n?|\\n?`{3}$", "g");
    content = content.replace(mdBlockRegex, "");

    const parsed = JSON.parse(content);
    return {
      translatedName: parsed.name || name,
      translatedInstructions: parsed.instructions || instructions,
    };
  } catch (error) {
    console.error(`\n[!] Error translating AI fields for "${name}":`, error);
    throw error;
  }
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Error: Input file not found at ${INPUT_FILE}`);
    process.exit(1);
  }

  let exercises: Exercise[] = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

  if (fs.existsSync(OUTPUT_FILE)) {
    exercises = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
    console.log("Found existing output file. Resuming translation...");
  }

  let translatedCount = 0;

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];

    const isAlreadyTranslated =
      /[\u0600-\u06FF]/.test(ex.name) || /[\u0600-\u06FF]/.test(ex.level);

    if (!isAlreadyTranslated) {
      process.stdout.write(
        `Processing [${i + 1}/${exercises.length}]: ${ex.name}... `,
      );

      try {
        ex.level = translateCategoryField(dictionary.level, ex.level) as string;
        ex.force = translateCategoryField(dictionary.force, ex.force);
        ex.mechanic = translateCategoryField(dictionary.mechanic, ex.mechanic);
        ex.equipment = translateCategoryField(
          dictionary.equipment,
          ex.equipment,
        );
        ex.category = translateCategoryField(
          dictionary.category,
          ex.category,
        ) as string;
        ex.primaryMuscles = translateMuscles(ex.primaryMuscles);
        ex.secondaryMuscles = translateMuscles(ex.secondaryMuscles);

        if (ex.instructions && ex.instructions.length > 0) {
          const aiResult = await translateWithAI(ex.name, ex.instructions);
          ex.name = aiResult.translatedName;
          ex.instructions = aiResult.translatedInstructions;
        }

        console.log("Done.");
        translatedCount++;

        fs.writeFileSync(
          OUTPUT_FILE,
          JSON.stringify(exercises, null, 2),
          "utf-8",
        );

        await sleep(DELAY_BETWEEN_REQUESTS_MS);
      } catch (error) {
        console.error(
          `\n[!] Process paused at index ${i} due to an error. Run the script again to resume.`,
        );
        break;
      }
    }
  }

  console.log(
    `\nProcess finished. Successfully processed ${translatedCount} items.`,
  );
}

main().catch((err) => {
  console.error("Unhandled error:", err);
});
