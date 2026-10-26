import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dbDirectory = path.resolve(__dirname, '../../../db');
const dbPath = path.join(dbDirectory, 'padel.db');
const schemaPath = path.join(dbDirectory, 'schema.sql');
const seedPath = path.join(dbDirectory, 'seed.sql');

fs.mkdirSync(dbDirectory, { recursive: true });

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(fs.readFileSync(schemaPath, 'utf8'));

const courtCount = db.prepare('SELECT COUNT(*) AS total FROM canchas').get() as { total: number };

if (courtCount.total === 0) {
  db.exec(fs.readFileSync(seedPath, 'utf8'));
}
