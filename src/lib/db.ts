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
const defaultEmail = 'phuongvb@mobifoneservice.com.vn';
const defaultPassword = '123456';

const userExists = db.prepare('SELECT id FROM users WHERE email = ?').get(defaultEmail);

if (!userExists) {
  const hash = bcrypt.hashSync(defaultPassword, 10);
  db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(defaultEmail, hash);
  console.log('Seeded default user:', defaultEmail);
}

// Seed default setting if not exists
const defaultAudioDir = process.env.AUDIO_DIRECTORY || 'C:\\Users\\YNWT\\Desktop\\202606';
const defaultAdminPhone = '0936658668';
const defaultAdminEmail = 'phuongvb@mobifoneservice.com.vn';

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

// Seed default 30-day license expiration if not set
const licenseExists = db.prepare('SELECT value FROM settings WHERE key = ?').get('LICENSE_EXPIRES_AT');
if (!licenseExists) {
  const initialExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('LICENSE_EXPIRES_AT', initialExpiry);
  console.log('Seeded initial 30-day license expiring at:', initialExpiry);
}

export default db;
