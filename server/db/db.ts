import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

sqlite3.verbose();
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const dbPath = path.join(__dirname, 'database.sqlite');

export const db = new sqlite3.Database(dbPath, (err?: Error | null) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');

        db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('⚠️ Failed to enable foreign keys:', pragmaErr.message);
      } else {
        console.log('🔗 Foreign keys enabled');
      }
    });

    db.get('PRAGMA foreign_keys;', (err, row) => {
  if (err) {
    console.error('Error checking foreign_keys pragma:', err);
  } else {
    console.log('Foreign keys enabled:', row['foreign_keys'] === 1);
  }
});
  }
});