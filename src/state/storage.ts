import * as SQLite from 'expo-sqlite';
import type { AppState } from '../types';

const DATABASE_NAME = 'peritia.db';

let databasePromise: ReturnType<typeof SQLite.openDatabaseAsync> | null = null;

async function database() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return databasePromise;
}

export async function loadState(): Promise<AppState | null> {
  const db = await database();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY NOT NULL,
      json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  const row = await db.getFirstAsync<{ json: string }>(
    'SELECT json FROM app_state WHERE id = 1',
  );
  if (!row?.json) return null;
  try {
    return JSON.parse(row.json) as AppState;
  } catch {
    return null;
  }
}

export async function saveState(state: AppState): Promise<void> {
  const db = await database();
  await db.runAsync(
    'INSERT OR REPLACE INTO app_state (id, json, updated_at) VALUES (1, ?, ?)',
    JSON.stringify(state),
    new Date().toISOString(),
  );
}

export async function clearState(): Promise<void> {
  const db = await database();
  await db.runAsync('DELETE FROM app_state WHERE id = 1');
}
