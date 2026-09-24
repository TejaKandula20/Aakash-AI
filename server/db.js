import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'aakash.sqlite');
export const db = new DatabaseSync(dbPath);

export function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, salt, expectedHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

export function getTodayIST() {
  const d = new Date();
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function getCurrentTimestampIST() {
  const d = new Date();
  return d.toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).replace(' ', 'T') + '+05:30';
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      assigned_panchayat_id TEXT NOT NULL DEFAULT 'ap-asr-maredumilli',
      assigned_panchayat_name TEXT NOT NULL DEFAULT 'Maredumilli Gram Panchayat',
      assigned_district TEXT NOT NULL DEFAULT 'Alluri Sitharama Raju',
      assigned_mandal TEXT NOT NULL DEFAULT 'Maredumilli',
      phone_number TEXT NOT NULL DEFAULT '+91 98480 •••••',
      preferred_language TEXT NOT NULL DEFAULT 'te',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      last_login_at TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_str TEXT NOT NULL,
      panchayat_id TEXT NOT NULL,
      panchayat_name TEXT NOT NULL,
      user_id INTEGER,
      risk_type TEXT NOT NULL,
      risk_level TEXT NOT NULL DEFAULT 'WARNING',
      trigger_reason TEXT NOT NULL,
      channel TEXT NOT NULL DEFAULT 'VOICE_CALL',
      status TEXT NOT NULL DEFAULT 'DELIVERED',
      recipient_count INTEGER NOT NULL DEFAULT 1,
      delivery_stats TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(date_str, panchayat_id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS system_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      role TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS farmer_registry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      panchayat_id TEXT NOT NULL,
      name TEXT NOT NULL,
      masked_phone TEXT NOT NULL,
      alert_preference TEXT NOT NULL DEFAULT 'Both',
      language TEXT NOT NULL DEFAULT 'te',
      land_acres REAL NOT NULL DEFAULT 2.5,
      primary_crop TEXT NOT NULL DEFAULT 'Paddy'
    );
  `);

  // 1. Seed requested Admin: kandulatejachowdary@gmail.com (username: tejakandula) / teja@9999
  const checkAdmin = db.prepare('SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?').all('kandulatejachowdary@gmail.com', 'tejakandula');
  if (checkAdmin.length === 0) {
    const adminPass = hashPassword('teja@9999');
    const now = getCurrentTimestampIST();
    db.prepare(`
      INSERT INTO users (
        email, username, password_hash, salt, role,
        assigned_panchayat_id, assigned_panchayat_name, assigned_district, assigned_mandal,
        phone_number, preferred_language, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'kandulatejachowdary@gmail.com',
      'tejakandula',
      adminPass.hash,
      adminPass.salt,
      'admin',
      'ap-asr-maredumilli',
      'Maredumilli Gram Panchayat',
      'Alluri Sitharama Raju',
      'Maredumilli',
      '+91 94401 00000',
      'en',
      now
    );
    console.log('[DB] Seeded Admin: kandulatejachowdary@gmail.com / teja@9999');
  }

  // 2. Seed requested User: msuchitra954@gmail.com (username: suchitra) / suchitra@9999
  const checkUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?').all('msuchitra954@gmail.com', 'suchitra');
  if (checkUser.length === 0) {
    const userPass = hashPassword('suchitra@9999');
    const now = getCurrentTimestampIST();
    db.prepare(`
      INSERT INTO users (
        email, username, password_hash, salt, role,
        assigned_panchayat_id, assigned_panchayat_name, assigned_district, assigned_mandal,
        phone_number, preferred_language, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'msuchitra954@gmail.com',
      'suchitra',
      userPass.hash,
      userPass.salt,
      'user',
      'ap-asr-maredumilli',
      'Maredumilli Gram Panchayat',
      'Alluri Sitharama Raju',
      'Maredumilli',
      '+91 98480 •••••',
      'te',
      now
    );
    console.log('[DB] Seeded User: msuchitra954@gmail.com / suchitra@9999');
  }

  // Demo farmer registry records
  const checkFarmers = db.prepare('SELECT count(*) as count FROM farmer_registry').all();
  if (checkFarmers[0].count === 0) {
    const demoFarmers = [
      { pId: 'ap-asr-maredumilli', name: 'వరికూటి సుబ్బారావు', phone: '+91 98480 •••••', pref: 'Both', lang: 'te', acres: 3.5, crop: 'Paddy' },
      { pId: 'ap-asr-maredumilli', name: 'కోటేశ్వరరావు', phone: '+91 94401 •••••', pref: 'Voice', lang: 'te', acres: 2.0, crop: 'Cotton' },
      { pId: 'ap-asr-maredumilli', name: 'సత్యనారాయణ', phone: '+91 89781 •••••', pref: 'SMS', lang: 'te', acres: 4.2, crop: 'Maize' },
      { pId: 'ap-asr-maredumilli', name: 'అప్పలరాజు', phone: '+91 70932 •••••', pref: 'Both', lang: 'te', acres: 1.8, crop: 'Paddy' },
      { pId: 'ap-asr-araku', name: 'బి. కామేశ్వరరావు', phone: '+91 91002 •••••', pref: 'Both', lang: 'te', acres: 5.0, crop: 'Coffee' },
      { pId: 'ap-asr-araku', name: 'ఎం. తారకరాముడు', phone: '+91 98492 •••••', pref: 'Voice', lang: 'te', acres: 3.0, crop: 'Pepper' }
    ];

    const insertFarmer = db.prepare(`
      INSERT INTO farmer_registry (panchayat_id, name, masked_phone, alert_preference, language, land_acres, primary_crop)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const f of demoFarmers) {
      insertFarmer.run(f.pId, f.name, f.phone, f.pref, f.lang, f.acres, f.crop);
    }
  }
}
