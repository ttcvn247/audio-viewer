import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'app.db');
const db = new Database(dbPath);

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS used_licenses (
    key TEXT PRIMARY KEY,
    used_at TEXT NOT NULL
  );
`);

// Seed default user if not exists
const defaultEmail = 'demo@mobifoneservice.com.vn';
const defaultPassword = 'demo@123';

const userExists = db.prepare('SELECT id FROM users WHERE email = ?').get(defaultEmail);

if (!userExists) {
  const hash = bcrypt.hashSync(defaultPassword, 10);
  db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(defaultEmail, hash);
  console.log('Seeded default user:', defaultEmail);
}

// Seed default setting if not exists
const defaultAudioDir = process.env.AUDIO_DIRECTORY || 'C:\\Recordings';
const defaultAdminPhone = '0936658668';
const defaultAdminEmail = 'demo@mobifoneservice.com.vn';

const settingExists = db.prepare('SELECT key FROM settings WHERE key = ?').get('AUDIO_DIRECTORY');
if (!settingExists) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('AUDIO_DIRECTORY', defaultAudioDir);
  console.log('Seeded default AUDIO_DIRECTORY:', defaultAudioDir);
}

const phoneExists = db.prepare('SELECT key FROM settings WHERE key = ?').get('ADMIN_PHONE');
if (!phoneExists) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('ADMIN_PHONE', defaultAdminPhone);
}

const emailExists = db.prepare('SELECT key FROM settings WHERE key = ?').get('ADMIN_EMAIL');
if (!emailExists) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('ADMIN_EMAIL', defaultAdminEmail);
}

export default db;
