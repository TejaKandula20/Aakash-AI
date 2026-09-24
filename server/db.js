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

// Helper for hashing password
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

// Current date in IST (Asia/Kolkata)
export function getTodayIST() {
  const d = new Date();
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function getCurrentTimestampIST() {
  const d = new Date();
  return d.toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).replace(' ', 'T') + '+05:30';
}

// Initialize tables
export function initDatabase() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      assigned_panchayat_id TEXT NOT NULL DEFAULT 'maredumilli',
      assigned_panchayat_name TEXT NOT NULL DEFAULT 'Maredumilli',
      assigned_district TEXT NOT NULL DEFAULT 'Alluri Sitharama Raju',
      assigned_mandal TEXT NOT NULL DEFAULT 'Maredumilli',
      phone_number TEXT NOT NULL DEFAULT '+91 98480 •••••',
      preferred_language TEXT NOT NULL DEFAULT 'te',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      last_login_at TEXT
    );
  `);

  // 2. Daily Alerts Table (Once-Per-Day strictly enforced by UNIQUE(date_str, panchayat_id))
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

  // 3. System Audit Logs
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

  // 4. Farmer Registry Sample Records
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

  // Seed default admin and user if not exists
  const checkAdmin = db.prepare('SELECT id FROM users WHERE email = ?').all('admin@aakash.gov.in');
  if (checkAdmin.length === 0) {
    const adminPass = hashPassword('Admin@123');
    const now = getCurrentTimestampIST();
    db.prepare(`
      INSERT INTO users (
        email, username, password_hash, salt, role,
        assigned_panchayat_id, assigned_panchayat_name, assigned_district, assigned_mandal,
        phone_number, preferred_language, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'admin@aakash.gov.in',
      'Dr. K. S. Rao (Chief Agro-Meteorologist)',
      adminPass.hash,
      adminPass.salt,
      'admin',
      'all',
      'All 13,326 Panchayats',
      'State Command Center',
      'Andhra Pradesh',
      '+91 94401 00000',
      'en',
      now
    );
    console.log('[DB] Seeded Admin: admin@aakash.gov.in / Admin@123');
  }

  const checkUser = db.prepare('SELECT id FROM users WHERE email = ?').all('farmer@aakash.gov.in');
  if (checkUser.length === 0) {
    const farmerPass = hashPassword('Farmer@123');
    const now = getCurrentTimestampIST();
    db.prepare(`
      INSERT INTO users (
        email, username, password_hash, salt, role,
        assigned_panchayat_id, assigned_panchayat_name, assigned_district, assigned_mandal,
        phone_number, preferred_language, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'farmer@aakash.gov.in',
      'V. Ramana Murthy (Paddy Farmer)',
      farmerPass.hash,
      farmerPass.salt,
      'user',
      'maredumilli',
      'Maredumilli (మారేడుమిల్లి)',
      'Alluri Sitharama Raju',
      'Maredumilli',
      '+91 98480 •••••',
      'te',
      now
    );
    console.log('[DB] Seeded User: farmer@aakash.gov.in / Farmer@123 (Maredumilli)');
  }

  const checkUser2 = db.prepare('SELECT id FROM users WHERE email = ?').all('farmer2@aakash.gov.in');
  if (checkUser2.length === 0) {
    const farmer2Pass = hashPassword('Farmer@123');
    const now = getCurrentTimestampIST();
    db.prepare(`
      INSERT INTO users (
        email, username, password_hash, salt, role,
        assigned_panchayat_id, assigned_panchayat_name, assigned_district, assigned_mandal,
        phone_number, preferred_language, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'farmer2@aakash.gov.in',
      'P. Somalingam (Coffee & Pepper Cultivator)',
      farmer2Pass.hash,
      farmer2Pass.salt,
      'user',
      'araku',
      'Araku Valley (అరకు)',
      'Alluri Sitharama Raju',
      'Araku Valley',
      '+91 94401 •••••',
      'te',
      now
    );
    console.log('[DB] Seeded User 2: farmer2@aakash.gov.in / Farmer@123 (Araku)');
  }

  // Seed initial farmer registry demo records
  const checkFarmers = db.prepare('SELECT count(*) as count FROM farmer_registry').all();
  if (checkFarmers[0].count === 0) {
    const demoFarmers = [
      { pId: 'maredumilli', name: 'వరికూటి సుబ్బారావు', phone: '+91 98480 •••••', pref: 'Both', lang: 'te', acres: 3.5, crop: 'Paddy' },
      { pId: 'maredumilli', name: 'కోటేశ్వరరావు', phone: '+91 94401 •••••', pref: 'Voice', lang: 'te', acres: 2.0, crop: 'Cotton' },
      { pId: 'maredumilli', name: 'సత్యనారాయణ', phone: '+91 89781 •••••', pref: 'SMS', lang: 'te', acres: 4.2, crop: 'Maize' },
      { pId: 'maredumilli', name: 'అప్పలరాజు', phone: '+91 70932 •••••', pref: 'Both', lang: 'te', acres: 1.8, crop: 'Paddy' },
      { pId: 'araku', name: 'బి. కామేశ్వరరావు', phone: '+91 91002 •••••', pref: 'Both', lang: 'te', acres: 5.0, crop: 'Coffee' },
      { pId: 'araku', name: 'ఎం. తారకరాముడు', phone: '+91 98492 •••••', pref: 'Voice', lang: 'te', acres: 3.0, crop: 'Pepper' }
    ];

    const insertFarmer = db.prepare(`
      INSERT INTO farmer_registry (panchayat_id, name, masked_phone, alert_preference, language, land_acres, primary_crop)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const f of demoFarmers) {
      insertFarmer.run(f.pId, f.name, f.phone, f.pref, f.lang, f.acres, f.crop);
    }
    console.log('[DB] Seeded demo farmer registry records');
  }
}
