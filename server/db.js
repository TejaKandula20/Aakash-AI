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
  // 1. Users table
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

  // 2. Daily alerts table
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

  // 3. System audit logs table
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

  // 4. Dedicated Farmers Database table
  db.exec(`
    CREATE TABLE IF NOT EXISTS farmers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      masked_phone TEXT NOT NULL,
      district TEXT NOT NULL,
      mandal TEXT NOT NULL,
      panchayat_id TEXT NOT NULL,
      panchayat_name TEXT NOT NULL,
      primary_crop TEXT NOT NULL DEFAULT 'Paddy',
      land_acres REAL NOT NULL DEFAULT 2.5,
      language TEXT NOT NULL DEFAULT 'te',
      alert_preference TEXT NOT NULL DEFAULT 'Both',
      is_active INTEGER NOT NULL DEFAULT 1,
      registered_at TEXT NOT NULL,
      last_alert_at TEXT,
      last_alert_type TEXT,
      last_alert_status TEXT
    );
  `);

  // 5. Dedicated Panchayats Database table
  db.exec(`
    CREATE TABLE IF NOT EXISTS panchayats (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      local_name TEXT NOT NULL,
      district TEXT NOT NULL,
      mandal TEXT NOT NULL,
      elevation_meters REAL NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      soil_type TEXT NOT NULL DEFAULT 'Red Sandy Loam',
      risk_level TEXT NOT NULL DEFAULT 'NORMAL',
      active_hazard TEXT,
      last_alert_date TEXT,
      created_at TEXT NOT NULL
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

  // 3. Seed Panchayats table
  const checkPanchayats = db.prepare('SELECT count(*) as count FROM panchayats').all();
  if (checkPanchayats[0].count === 0) {
    const initialPanchayats = [
      { id: 'ap-asr-maredumilli', name: 'Maredumilli', localName: 'మారేడుమిల్లి', district: 'Alluri Sitharama Raju', mandal: 'Maredumilli', elev: 450, lat: 17.59, lon: 81.71, soil: 'Forest Loam', risk: 'WARNING', hazard: 'waterlogging' },
      { id: 'ap-asr-araku', name: 'Araku Valley', localName: 'అరకు లోయ', district: 'Alluri Sitharama Raju', mandal: 'Araku Valley', elev: 911, lat: 18.33, lon: 82.87, soil: 'Red Clay Loam', risk: 'WARNING', hazard: 'waterlogging' },
      { id: 'ap-kadapa-pulivendula', name: 'Pulivendula', localName: 'పులివెందుల', district: 'YSR Kadapa', mandal: 'Pulivendula', elev: 280, lat: 14.42, lon: 78.23, soil: 'Red Sandy Loam', risk: 'WARNING', hazard: 'scorching_sun' },
      { id: 'ap-guntur-tenali', name: 'Tenali', localName: 'తెనాలి', district: 'Guntur', mandal: 'Tenali', elev: 15, lat: 16.24, lon: 80.64, soil: 'Delta Alluvial', risk: 'NORMAL', hazard: null },
      { id: 'ap-annamayya-valasapalle', name: 'Valasapalle', localName: 'వలసపల్లె', district: 'Annamayya', mandal: 'Madanapalle', elev: 680, lat: 13.55, lon: 78.50, soil: 'Red Gravelly Loam', risk: 'NORMAL', hazard: null },
      { id: 'ap-chittoor-kanipakam', name: 'Kanipakam', localName: 'కాణిపాకం', district: 'Chittoor', mandal: 'Irala', elev: 330, lat: 13.28, lon: 79.03, soil: 'Red Sandy', risk: 'NORMAL', hazard: null },
      { id: 'ap-krishna-gudivada', name: 'Gudivada', localName: 'గుడివాడ', district: 'Krishna', mandal: 'Gudivada', elev: 9, lat: 16.43, lon: 80.99, soil: 'Black Cotton', risk: 'NORMAL', hazard: null },
      { id: 'ap-kurnool-yemmiganur', name: 'Yemmiganur', localName: 'ఎమ్మిగనూరు', district: 'Kurnool', mandal: 'Yemmiganur', elev: 378, lat: 15.77, lon: 77.48, soil: 'Black Soil', risk: 'NORMAL', hazard: null }
    ];

    const insertPanchayat = db.prepare(`
      INSERT INTO panchayats (id, name, local_name, district, mandal, elevation_meters, latitude, longitude, soil_type, risk_level, active_hazard, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = getCurrentTimestampIST();
    for (const p of initialPanchayats) {
      insertPanchayat.run(p.id, p.name, p.localName, p.district, p.mandal, p.elev, p.lat, p.lon, p.soil, p.risk, p.hazard, now);
    }
    console.log('[DB] Seeded initial Panchayats table');
  }

  // 3b. Seed Official Palnadu Gram Panchayats (from https://palnadu.ap.gov.in/village-panchayats/)
  const checkPalnadu = db.prepare('SELECT count(*) as count FROM panchayats WHERE district = ?').all('Palnadu');
  if (checkPalnadu[0].count < 366) {
    const palnaduFile = path.join(dataDir, 'palnadu_panchayats.json');
    if (fs.existsSync(palnaduFile)) {
      const palnaduList = JSON.parse(fs.readFileSync(palnaduFile, 'utf8'));
      const insertPanchayat = db.prepare(`
        INSERT OR REPLACE INTO panchayats (
          id, name, local_name, district, mandal,
          elevation_meters, latitude, longitude,
          soil_type, risk_level, active_hazard, last_alert_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const now = getCurrentTimestampIST();
      db.exec('BEGIN TRANSACTION;');
      for (const p of palnaduList) {
        insertPanchayat.run(
          p.id, p.name, p.localName, p.district, p.mandal,
          p.elevationMeters, p.latitude, p.longitude,
          p.soilType, p.riskLevel, p.activeHazard, p.lastAlertDate,
          now
        );
      }
      db.exec('COMMIT;');
      console.log(`[DB] Seeded ${palnaduList.length} official Palnadu Gram Panchayats from palnadu.ap.gov.in`);
    }
  }

  // 4. Seed Farmers table
  const checkFarmers = db.prepare('SELECT count(*) as count FROM farmers').all();
  if (checkFarmers[0].count === 0) {
    const demoFarmers = [
      { name: 'వరికూటి సుబ్బారావు', phone: '+91 98480 11234', masked: '+91 98480 •••••', district: 'Alluri Sitharama Raju', mandal: 'Maredumilli', pId: 'ap-asr-maredumilli', pName: 'Maredumilli', crop: 'Paddy', acres: 3.5, lang: 'te', pref: 'Both', alertAt: '2026-09-24T07:15:00+05:30', alertType: 'waterlogging', alertStatus: 'DELIVERED' },
      { name: 'కోటేశ్వరరావు', phone: '+91 94401 22345', masked: '+91 94401 •••••', district: 'Alluri Sitharama Raju', mandal: 'Maredumilli', pId: 'ap-asr-maredumilli', pName: 'Maredumilli', crop: 'Cotton', acres: 2.0, lang: 'te', pref: 'Voice', alertAt: '2026-09-24T07:15:00+05:30', alertType: 'waterlogging', alertStatus: 'DELIVERED' },
      { name: 'పి. సత్యనారాయణ', phone: '+91 89781 33456', masked: '+91 89781 •••••', district: 'Alluri Sitharama Raju', mandal: 'Maredumilli', pId: 'ap-asr-maredumilli', pName: 'Maredumilli', crop: 'Maize', acres: 4.2, lang: 'te', pref: 'SMS', alertAt: '2026-09-24T07:15:00+05:30', alertType: 'waterlogging', alertStatus: 'DELIVERED' },
      { name: 'చింతల అప్పలరాజు', phone: '+91 70932 44567', masked: '+91 70932 •••••', district: 'Alluri Sitharama Raju', mandal: 'Maredumilli', pId: 'ap-asr-maredumilli', pName: 'Maredumilli', crop: 'Paddy', acres: 1.8, lang: 'te', pref: 'Both', alertAt: '2026-09-24T07:15:00+05:30', alertType: 'waterlogging', alertStatus: 'DELIVERED' },
      { name: 'బి. కామేశ్వరరావు', phone: '+91 91002 55678', masked: '+91 91002 •••••', district: 'Alluri Sitharama Raju', mandal: 'Araku Valley', pId: 'ap-asr-araku', pName: 'Araku Valley', crop: 'Coffee', acres: 5.0, lang: 'te', pref: 'Both', alertAt: null, alertType: null, alertStatus: null },
      { name: 'ఎం. తారకరాముడు', phone: '+91 98492 66789', masked: '+91 98492 •••••', district: 'Alluri Sitharama Raju', mandal: 'Araku Valley', pId: 'ap-asr-araku', pName: 'Araku Valley', crop: 'Pepper', acres: 3.0, lang: 'te', pref: 'Voice', alertAt: null, alertType: null, alertStatus: null },
      { name: 'కె. వెంకటరమణ', phone: '+91 94405 77890', masked: '+91 94405 •••••', district: 'YSR Kadapa', mandal: 'Pulivendula', pId: 'ap-kadapa-pulivendula', pName: 'Pulivendula', crop: 'Groundnut', acres: 6.0, lang: 'te', pref: 'Both', alertAt: '2026-09-24T12:30:00+05:30', alertType: 'scorching_sun', alertStatus: 'DELIVERED' }
    ];

    const insertFarmer = db.prepare(`
      INSERT INTO farmers (
        name, phone, masked_phone, district, mandal, panchayat_id, panchayat_name,
        primary_crop, land_acres, language, alert_preference, is_active, registered_at,
        last_alert_at, last_alert_type, last_alert_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    `);

    const now = getCurrentTimestampIST();
    for (const f of demoFarmers) {
      insertFarmer.run(f.name, f.phone, f.masked, f.district, f.mandal, f.pId, f.pName, f.crop, f.acres, f.lang, f.pref, now, f.alertAt, f.alertType, f.alertStatus);
    }
    console.log('[DB] Seeded initial Farmers table');
  }
}
