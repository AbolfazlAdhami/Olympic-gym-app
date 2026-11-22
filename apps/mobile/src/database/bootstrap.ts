import { getDatabase } from "./client";
import { seedExercisesIfNeeded } from "./seed";

export async function initializeAppDatabase(): Promise<void> {
  const database = await getDatabase();
  await seedExercisesIfNeeded(database);
}
