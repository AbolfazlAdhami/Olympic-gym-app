import type { SQLiteDatabase } from "expo-sqlite";

export interface LocalProfile {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
}

interface ProfileRow {
  id: string;
  display_name: string;
  email: string;
  created_at: string;
}

interface ExistingProfileRow {
  id: string;
}

export class ProfileInputError extends Error {}

export class ProfileAlreadyExistsError extends Error {}

function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

function mapProfile(row: ProfileRow): LocalProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    createdAt: row.created_at,
  };
}

export async function getActiveProfile(database: SQLiteDatabase): Promise<LocalProfile | null> {
  const row = await database.getFirstAsync<ProfileRow>(
    `SELECT users.id, users.display_name, users.email, users.created_at
     FROM app_metadata
     INNER JOIN users ON users.id = app_metadata.value
     WHERE app_metadata.name = ?`,
    "active_user_id",
  );

  return row === null ? null : mapProfile(row);
}

export async function registerLocalProfile(
  database: SQLiteDatabase,
  input: { displayName: string; email: string },
): Promise<LocalProfile> {
  const displayName = input.displayName.trim().replace(/\s+/g, " ");
  const email = input.email.trim().toLocaleLowerCase();

  if (displayName.length < 2 || displayName.length > 60) {
    throw new ProfileInputError("نام باید بین ۲ تا ۶۰ نویسه باشد.");
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ProfileInputError("یک ایمیل معتبر وارد کنید.");
  }

  const id = createLocalId("profile");
  const registrationId = createLocalId("registration");

  await database.withTransactionAsync(async () => {
    const existingProfile = await database.getFirstAsync<ExistingProfileRow>(
      "SELECT id FROM users WHERE email = ? COLLATE NOCASE",
      email,
    );

    if (existingProfile !== null) {
      throw new ProfileAlreadyExistsError("برای این ایمیل قبلاً یک پروفایل ساخته شده است.");
    }

    await database.runAsync(
      `INSERT INTO users (id, display_name, email, password_hash)
       VALUES (?, ?, ?, NULL)`,
      id,
      displayName,
      email,
    );
    await database.runAsync(
      "INSERT INTO user_registrations (id, user_id) VALUES (?, ?)",
      registrationId,
      id,
    );
    await database.runAsync(
      `INSERT INTO app_metadata (name, value)
       VALUES ('active_user_id', ?)
       ON CONFLICT (name) DO UPDATE SET
         value = excluded.value,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
      id,
    );
  });

  const profile = await database.getFirstAsync<ProfileRow>(
    "SELECT id, display_name, email, created_at FROM users WHERE id = ?",
    id,
  );

  if (profile === null) {
    throw new Error("The new local profile could not be read after registration.");
  }

  return mapProfile(profile);
}

export async function deleteLocalProfile(database: SQLiteDatabase, profileId: string): Promise<void> {
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      "DELETE FROM app_metadata WHERE name = ? AND value = ?",
      "active_user_id",
      profileId,
    );
    await database.runAsync("DELETE FROM users WHERE id = ?", profileId);
  });
}
