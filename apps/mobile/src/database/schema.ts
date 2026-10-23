import type { SQLiteDatabase } from "expo-sqlite";
import {
  BODY_PARTS,
  EQUIPMENT_VALUES,
  EXERCISE_CATEGORIES,
  MUSCLE_GROUPS,
  SECONDARY_MUSCLES,
  TARGETS,
} from "@gym-app/shared";
import {
  BODY_PART_LABELS_FA,
  CATEGORY_LABELS_FA,
  EQUIPMENT_LABELS_FA,
  MUSCLE_LABELS_FA,
} from "../types/exercise-labels.fa";

type EnumTable =
  | "enum_categories"
  | "enum_body_parts"
  | "enum_equipment"
  | "enum_muscle_groups"
  | "enum_targets"
  | "enum_secondary_muscles";

function createEnumTableSql(table: EnumTable, values: readonly string[], labels: Readonly<Record<string, string>>): string {
  const rows = values
    .map((value) => {
      const escapedValue = value.replaceAll("'", "''");
      const escapedLabel = (labels[value] ?? value).replaceAll("'", "''");
      return `('${escapedValue}', '${escapedLabel}')`;
    })
    .join(",\n      ");
  const labelCases = values
    .map((value) => {
      const escapedValue = value.replaceAll("'", "''");
      const escapedLabel = (labels[value] ?? value).replaceAll("'", "''");
      return `WHEN '${escapedValue}' THEN '${escapedLabel}'`;
    })
    .join("\n      ");

  return `
    CREATE TABLE IF NOT EXISTS ${table} (
      value TEXT PRIMARY KEY NOT NULL,
      label TEXT NOT NULL
    );
    INSERT OR IGNORE INTO ${table} (value, label) VALUES ${rows};
    UPDATE ${table}
    SET label = CASE value
      ${labelCases}
      ELSE label
    END;
  `;
}

const CREATE_SCHEMA_SQL = `
  ${createEnumTableSql("enum_categories", EXERCISE_CATEGORIES, CATEGORY_LABELS_FA)}
  ${createEnumTableSql("enum_body_parts", BODY_PARTS, BODY_PART_LABELS_FA)}
  ${createEnumTableSql("enum_equipment", EQUIPMENT_VALUES, EQUIPMENT_LABELS_FA)}
  ${createEnumTableSql("enum_muscle_groups", MUSCLE_GROUPS, MUSCLE_LABELS_FA)}
  ${createEnumTableSql("enum_targets", TARGETS, MUSCLE_LABELS_FA)}
  ${createEnumTableSql("enum_secondary_muscles", SECONDARY_MUSCLES, MUSCLE_LABELS_FA)}

  CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES enum_categories (value),
    body_part TEXT NOT NULL REFERENCES enum_body_parts (value),
    equipment TEXT NOT NULL REFERENCES enum_equipment (value),
    instructions_json TEXT NOT NULL,
    muscle_group TEXT NOT NULL REFERENCES enum_muscle_groups (value),
    target TEXT NOT NULL REFERENCES enum_targets (value),
    image TEXT NOT NULL,
    gif_url TEXT NOT NULL,
    media_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exercise_secondary_muscles (
    exercise_id TEXT NOT NULL,
    muscle TEXT NOT NULL REFERENCES enum_secondary_muscles (value),
    PRIMARY KEY (exercise_id, muscle),
    FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS app_metadata (
    name TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS user_registrations (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL UNIQUE,
    registered_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS favorite_exercises (
    user_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (user_id, exercise_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises (name COLLATE NOCASE);
  CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises (category);
  CREATE INDEX IF NOT EXISTS idx_exercises_body_part ON exercises (body_part);
  CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises (equipment);
  CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises (muscle_group);
  CREATE INDEX IF NOT EXISTS idx_exercises_target ON exercises (target);
  CREATE INDEX IF NOT EXISTS idx_exercise_secondary_muscles_muscle
    ON exercise_secondary_muscles (muscle);
  CREATE INDEX IF NOT EXISTS idx_favorite_exercises_exercise
    ON favorite_exercises (exercise_id);
`;

export async function initializeSchema(database: SQLiteDatabase): Promise<void> {
  const versionRow = await database.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= 4) {
    await database.execAsync(`PRAGMA foreign_keys = ON; ${CREATE_SCHEMA_SQL}`);
    return;
  }

  if (currentVersion > 0 && currentVersion < 4) {
    await database.execAsync("PRAGMA foreign_keys = OFF;");
    const resetLegacyExerciseTables = currentVersion === 1
      ? `
          DROP TABLE IF EXISTS exercise_muscles;
          DROP TABLE IF EXISTS exercise_secondary_muscles;
          DROP TABLE IF EXISTS exercises;
          DROP TABLE IF EXISTS enum_levels;
          DROP TABLE IF EXISTS enum_forces;
          DROP TABLE IF EXISTS enum_mechanics;
          DROP TABLE IF EXISTS enum_equipment;
          DROP TABLE IF EXISTS enum_categories;
          DROP TABLE IF EXISTS enum_muscles;
          DROP TABLE IF EXISTS enum_body_parts;
          DROP TABLE IF EXISTS enum_muscle_groups;
          DROP TABLE IF EXISTS enum_targets;
          DROP TABLE IF EXISTS enum_secondary_muscles;
        `
      : "";

    try {
      await database.withTransactionAsync(async () => {
        await database.execAsync(`
          ${resetLegacyExerciseTables}
          ${CREATE_SCHEMA_SQL}
          CREATE TABLE users_v4 (
            id TEXT PRIMARY KEY NOT NULL,
            display_name TEXT NOT NULL,
            email TEXT NOT NULL COLLATE NOCASE UNIQUE,
            password_hash TEXT,
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
          );
          INSERT INTO users_v4 (id, display_name, email, password_hash, created_at, updated_at)
            SELECT id, display_name, email, password_hash, created_at, updated_at FROM users;
          DROP TABLE users;
          ALTER TABLE users_v4 RENAME TO users;
          PRAGMA user_version = 4;
        `);
      });
    } finally {
      await database.execAsync("PRAGMA foreign_keys = ON;");
    }

    return;
  }

  await database.execAsync("PRAGMA foreign_keys = OFF;");

  try {
    await database.withTransactionAsync(async () => {
      await database.execAsync(`
        DROP TABLE IF EXISTS exercise_muscles;
        DROP TABLE IF EXISTS exercise_secondary_muscles;
        DROP TABLE IF EXISTS exercises;
        DROP TABLE IF EXISTS enum_levels;
        DROP TABLE IF EXISTS enum_forces;
        DROP TABLE IF EXISTS enum_mechanics;
        DROP TABLE IF EXISTS enum_equipment;
        DROP TABLE IF EXISTS enum_categories;
        DROP TABLE IF EXISTS enum_muscles;
        ${CREATE_SCHEMA_SQL}
        PRAGMA user_version = 4;
      `);
    });
  } catch (error: unknown) {
    await database.execAsync("PRAGMA foreign_keys = ON;");
    throw error;
  }

  await database.execAsync("PRAGMA foreign_keys = ON;");
}
