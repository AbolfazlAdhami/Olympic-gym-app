import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});
async function main() {
  console.log("🌱 Starting database seed...");

  const exercise = await prisma.exercise.upsert({
    where: {
      slug: "barbell-bench-press-medium-grip",
    },
    update: {},
    create: {
      nameEn: "Barbell Bench Press - Medium Grip",
      slug: "barbell-bench-press-medium-grip",

      force: "push",
      mechanic: "compound",
      equipment: "barbell",
      category: "strength",
      difficulty: "intermediate",

      primaryMuscles: {
        create: [{ muscle: "chest" }],
      },

      secondaryMuscles: {
        create: [{ muscle: "triceps" }, { muscle: "shoulders" }],
      },

      instructions: {
        create: [
          {
            step: 1,
            text: "Lie back on a flat bench and grip the bar slightly wider than shoulder width.",
          },
          {
            step: 2,
            text: "Unrack the bar and position it directly above your chest.",
          },
          {
            step: 3,
            text: "Lower the bar toward your mid-chest in a controlled movement.",
          },
          {
            step: 4,
            text: "Press the bar back up until your arms are extended.",
          },
        ],
      },

      translations: {
        create: [
          {
            language: "en",
            name: "Barbell Bench Press - Medium Grip",
            description: "A compound barbell pressing exercise for the chest.",
          },
          {
            language: "fa",
            name: "پرس سینه هالتر دست متوسط",
            description: "یک حرکت ترکیبی با هالتر برای عضلات سینه.",
          },
        ],
      },

      aliases: {
        create: [
          {
            language: "fa",
            alias: "پرس سینه هالتر",
            normalized: "پرس سینه هالتر",
          },
          {
            language: "fa",
            alias: "پرس سینه",
            normalized: "پرس سینه",
          },
        ],
      },

      images: {
        create: [
          {
            url: "https://example.com/barbell-bench-press.jpg",
            position: 1,
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded exercise: ${exercise.nameEn}`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
