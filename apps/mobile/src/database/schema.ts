import type { SQLiteDatabase } from "expo-sqlite";

export async function initializeSchema(database: SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      level TEXT NOT NULL CHECK (
        level IN ('beginner', 'intermediate', 'expert')
      ),
      force TEXT CHECK (
        force IS NULL OR force IN ('pull', 'push', 'static')
      ),
      mechanic TEXT CHECK (
        mechanic IS NULL OR mechanic IN ('isolation', 'compound')
      ),
      equipment TEXT CHECK (
        equipment IS NULL OR equipment IN (
          'machine',
          'cable',
          'barbell',
          'dumbbell',
          'body only',
          'bands',
          'medicine ball',
          'kettlebells',
          'foam roll',
          'e-z curl bar',
          'exercise ball',
          'other'
        )
      ),
      category TEXT NOT NULL CHECK (
        category IN (
          'strength',
          'stretching',
          'plyometrics',
          'strongman',
          'powerlifting',
          'cardio',
          'olympic weightlifting'
        )
      ),
      instructions_json TEXT NOT NULL,
      images_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exercise_muscles (
      exercise_id TEXT NOT NULL,
      muscle TEXT NOT NULL CHECK (
        muscle IN (
          'abdominals',
          'abductors',
          'adductors',
          'biceps',
          'calves',
          'chest',
          'forearms',
          'glutes',
          'hamstrings',
          'lats',
          'lower back',
          'middle back',
          'neck',
          'quadriceps',
          'shoulders',
          'traps',
          'triceps'
        )
      ),
      role TEXT NOT NULL CHECK (role IN ('primary', 'secondary')),
      PRIMARY KEY (exercise_id, muscle, role),
      FOREIGN KEY (exercise_id)
        REFERENCES exercises (id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_exercises_name
      ON exercises (name COLLATE NOCASE);

    CREATE INDEX IF NOT EXISTS idx_exercises_level
      ON exercises (level);

    CREATE INDEX IF NOT EXISTS idx_exercises_force
      ON exercises (force);

    CREATE INDEX IF NOT EXISTS idx_exercises_mechanic
      ON exercises (mechanic);

    CREATE INDEX IF NOT EXISTS idx_exercises_equipment
      ON exercises (equipment);

    CREATE INDEX IF NOT EXISTS idx_exercises_category
      ON exercises (category);

    CREATE INDEX IF NOT EXISTS idx_exercise_muscles_muscle_role
      ON exercise_muscles (muscle, role);
  `);
}
