# Data Migration Process

This document outlines the process for creating and applying database migrations for the LogoMesh project. We use a custom, script-based migration system to manage schema changes in a structured and version-controlled way. This approach was chosen to avoid complex dependencies and potential module resolution issues.

## Creating a New Migration

To create a new migration file, use the following npm script from the `server/` workspace (or use the `-w server` flag from the root):

```bash
npm run db:create-migration --name=your-migration-name
```

Replace `your-migration-name` with a descriptive, snake_case name for the change you are making (e.g., `add_user_table`, `add_index_to_thoughts`).

This will generate a new, timestamped file in `server/src/db/migrations/` with the format `YYYYMMDDHHMMSS_your_migration_name.ts`. The file will contain a boilerplate `up` and `down` function.

### `up()` function

The `up` function should contain the logic to apply the desired schema changes. It receives an instance of the `better-sqlite3` database connection.

- Use `db.exec()` for schema changes (`CREATE TABLE`, `ALTER TABLE`, etc.).
- Use `db.prepare()` for data manipulation to protect against SQL injection.

### `down()` function

The `down` function should contain the logic to revert the changes made in the `up` function. This is crucial for rollbacks and maintaining a clean state during development. Currently, the `down` function is not executed by the runner, but it is a best practice to include it for future use.

## Applying Migrations

Migrations are **not** applied automatically when the server starts. They must be run as a separate step during deployment or development.

To apply all pending migrations, run the following command from the `server/` workspace (or use the `-w server` flag from the root):

```bash
npm run db:migrate
```

## How It Works

The `db:migrate` script is a two-step process:

1.  **`db:compile-migrations`**: This script uses a dedicated `tsconfig.json` (`server/src/db/migrations/tsconfig.json`) to compile all TypeScript migration files (`*.ts`) into CommonJS JavaScript files (`*.js`). The output is placed in the `server/src/db/migrations/dist/` directory. It also creates a `package.json` file in the `dist` directory with `{"type": "commonjs"}` to ensure the compiled files are treated as CommonJS modules.
2.  **`run-migrations.cjs`**: After compilation, this Node.js script is executed. It connects to the database, checks the `migrations` table to see which migrations have already been applied, and then executes the `up()` function from any pending migration files found in the `dist` directory. It uses a regex filter to only run files that match the timestamped naming convention (`^\d{3,}_.*\.js$`).