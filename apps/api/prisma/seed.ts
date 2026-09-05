import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const exercise = await prisma.exercise.upsert({
    where: {
      slug: "barbell-bench-press",
    },
    update: {},
    create: {
      nameEn: "Barbell Bench Press",
      slug: "barbell-bench-press",
      equipment: "barbell",
      category: "strength",
      difficulty: "beginner",

      translations: {
        create: {
          language: "fa",
          name: "پرس سینه هالتر",
          description: "حرکت پرس سینه با استفاده از هالتر",
        },
      },

      aliases: {
        create: [
          {
            language: "fa",
            alias: "پرس سینه",
            normalized: "پرس سینه",
          },
          {
            language: "fa",
            alias: "پرس‌سینه",
            normalized: "پرس سینه",
          },
          {
            language: "fa",
            alias: "پرس سینه هالتر",
            normalized: "پرس سینه هالتر",
          },
          {
            language: "en",
            alias: "bench press",
            normalized: "bench press",
          },
        ],
      },
    },
  });

  console.log("Seeded exercise:", exercise.nameEn);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
