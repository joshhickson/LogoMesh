// server/src/db/migrations/types.ts
import { Database } from 'sqlite3';

export interface Migration {
  up: (db: Database) => Promise<void>;
  down: (db: Database) => Promise<void>;
}