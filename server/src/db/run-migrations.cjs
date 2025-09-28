const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Replicate config logic here to avoid ESM/CJS issues and make the script self-contained.
// The path is resolved from the script's location to the project root's data directory.
const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../../data/logomesh.sqlite3');
const migrationsDir = path.join(__dirname, 'migrations');

function runMigrations() {
    // Ensure the directory for the database exists.
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        console.log(`Creating database directory: ${dbDir}`);
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // Use console for logging, as the core logger is an ES Module.
    const db = new Database(dbPath, { verbose: console.log });

    // 1. Create migrations table if it doesn't exist.
    db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. Get all applied migration names.
    const appliedMigrations = db.prepare('SELECT name FROM migrations').all().map(row => row.name);
    console.log(`Applied migrations: ${appliedMigrations.join(', ') || 'None'}`);

    // 3. Get all available migration files from the 'dist' subdirectory.
    const compiledMigrationsDir = path.join(migrationsDir, 'dist');
    if (!fs.existsSync(compiledMigrationsDir)) {
        console.log('No compiled migrations found. Nothing to run.');
        db.close();
        return;
    }

    const migrationFiles = fs.readdirSync(compiledMigrationsDir)
        .filter(file => /^\d{3,}_.*\.js$/.test(file))
        .sort();

    // 4. Determine and apply pending migrations.
    let migrationsApplied = 0;
    for (const file of migrationFiles) {
        // We track migrations by their original TypeScript filename.
        const originalName = file.replace('.js', '.ts');
        if (!appliedMigrations.includes(originalName)) {
            console.log(`Applying migration: ${originalName}`);
            try {
                const migration = require(path.join(compiledMigrationsDir, file));

                if (typeof migration.up !== 'function') {
                    throw new Error(`Migration ${originalName} does not have an 'up' function.`);
                }

                // Execute the migration.
                migration.up(db);

                // Record the migration using the original filename.
                db.prepare('INSERT INTO migrations (name) VALUES (?)').run(originalName);
                console.log(`Successfully applied migration: ${originalName}`);
                migrationsApplied++;
            } catch (error) {
                console.error(`Failed to apply migration ${originalName}:`, error);
                // Exit with error because migrations must be atomic.
                process.exit(1);
            }
        }
    }

    if (migrationsApplied > 0) {
        console.log(`Total migrations applied: ${migrationsApplied}`);
    } else {
        console.log('Database is up to date. No new migrations to apply.');
    }

    db.close();
}

// Execute the function if the script is run directly.
if (require.main === module) {
    runMigrations();
}

module.exports = { runMigrations };