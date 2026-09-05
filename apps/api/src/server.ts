import "dotenv/config";

import app from "./app";
import { prisma } from "./config/database";

const PORT = Number(process.env.PORT) || 4000;

const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close();
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  server.close();
});
