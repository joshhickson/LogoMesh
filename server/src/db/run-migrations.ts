// server/src/db/run-migrations.ts
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs/promises';
import { secretsService } from '@core/services/secretsService';
import { logger } from '@core/utils/logger';
import { Migration } from './migrations/types';

const dbPath = secretsService.get('DB_PATH', true)!;
const absoluteDbPath = path.resolve(__dirname, '../../', dbPath);
const migrationsDir = path.join(__dirname, 'migrations');

const db = new sqlite3.Database(absoluteDbPath);

const promisifyDbRun = (sql: string, params: any[] = []) =>
  new Promise<void>((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

const promisifyDbAll = (sql: string) =>
  new Promise<any[]>((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

async function ensureMigrationsTable() {
  await promisifyDbRun(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getAppliedMigrations(): Promise<string[]> {
  const rows = await promisifyDbAll('SELECT name FROM _migrations ORDER BY name;');
  return rows.map((r) => r.name);
}

async function runMigrations() {
  await ensureMigrationsTable();
  const appliedMigrations = await getAppliedMigrations();
  const allMigrationFiles = (await fs.readdir(migrationsDir))
    .filter(f => f.endsWith('.ts') && f !== 'types.ts')
    .sort();

  for (const fileName of allMigrationFiles) {
    if (appliedMigrations.includes(fileName)) {
      continue;
    }

    logger.info(`Applying migration: ${fileName}`);
    try {
      const migration: Migration = await import(path.join(migrationsDir, fileName));
      await migration.up(db);
      await promisifyDbRun('INSERT INTO _migrations (name) VALUES (?);', [fileName]);
      logger.info(`Successfully applied migration: ${fileName}`);
    } catch (error) {
      logger.error(`Failed to apply migration ${fileName}:`, error);
      db.close();
      process.exit(1);
    }
  }
}

async function run() {
  await runMigrations();
  logger.info('All pending migrations applied successfully.');
  db.close();
}

// Simple CLI handling for 'up' command, can be expanded later
if (process.argv[2] === 'up') {
  run();
}