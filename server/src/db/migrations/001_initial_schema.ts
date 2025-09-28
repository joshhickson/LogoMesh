// server/src/db/migrations/001_initial_schema.ts
import { Migration } from './types';
import fs from 'fs';
import path from 'path';

const readSchema = () => {
  // Correct the path to point to the core/db directory from the server/db/migrations directory
  const schemaPath = path.resolve(__dirname, '../../../../core/db/schema.sql');
  return fs.readFileSync(schemaPath, 'utf-8');
};

export const up: Migration['up'] = async (db) => {
  return new Promise((resolve, reject) => {
    db.exec(readSchema(), (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

export const down: Migration['down'] = async (db) => {
  const tables = [
    'segment_llm_history',
    'segment_related_context',
    'segment_neighbors',
    'segment_fields',
    'segment_tags',
    'thought_tags',
    'tags',
    'segments',
    'thoughts',
  ];

  const dropPromises = tables.map(table => {
    return new Promise<void>((resolve, reject) => {
      db.run(`DROP TABLE IF EXISTS ${table};`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });

  await Promise.all(dropPromises);
};