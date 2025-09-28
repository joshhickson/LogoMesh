import * as fs from 'fs';
import * as path from 'path';
import type { Migration } from './migrations/types';

// This script is designed to be run from the package root
const migrationsDir = path.join(__dirname, 'migrations');

function createMigration() {
  const name = process.argv[2];
  if (!name) {
    console.error('Error: Migration name must be provided.');
    console.log('Usage: npm run db:create-migration -- <migration_name>');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const filename = `${timestamp}_${name}.ts`;
  const filepath = path.join(migrationsDir, filename);

  const template: string = `import type { Migration } from './types';

export const up: Migration['up'] = (db) => {
  // Use db.exec for schema changes
  // Use db.prepare for data manipulation (safer against SQL injection)
  db.exec(\`
    -- Your migration SQL here
    SELECT 'up migration ${filename} ran successfully';
  \`);
};

export const down: Migration['down'] = (db) => {
  // Optional: Add logic to reverse the migration
  db.exec(\`
    -- Your rollback SQL here
    SELECT 'down migration ${filename} ran successfully';
  \`);
};
`;

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  fs.writeFileSync(filepath, template);

  console.log(`Created migration: ${path.relative(process.cwd(), filepath)}`);
}

createMigration();