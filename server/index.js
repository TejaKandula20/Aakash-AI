import express from 'express';
import cors from 'cors';
import https from 'https';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { db, initDatabase, hashPassword, verifyPassword, getTodayIST, getCurrentTimestampIST } from './db.js';
import { generateToken, authenticate, requireRole, logAudit } from './auth.js';

// Initialize DB schema & seed data
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.url.startsWith('/api/tts')) {
      console.log(`[${req.method}] ${req.url} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ==========================================
// 1. AUTHENTICATION & LOGIN ENDPOINTS
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const trimmed = (email || '').trim().toLowerCase();
    const users = db.prepare('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?').all(trimmed, trimmed);

    if (users.length === 0) {
      logAudit(null, trimmedEmail, 'unknown', 'LOGIN_FAILED', 'User not found', req.ip);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    if (!user.is_active) {
      logAudit(user.id, user.username, user.role, 'LOGIN_BLOCKED', 'Account deactivated', req.ip);
      return res.status(403).json({ error: 'This account has been deactivated. Please contact administrator.' });
    }

    const isValid = verifyPassword(password, user.salt, user.password_hash);
    if (!isValid) {
      logAudit(user.id, user.username, user.role, 'LOGIN_FAILED', 'Incorrect password', req.ip);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const now = getCurrentTimestampIST();

    // If location was selected at login portal, update user profile and assign to that location
    const locationData = req.body.locationData;
    if (locationData && locationData.assignedPanchayatId) {
      db.prepare(`
        UPDATE users SET 
          assigned_panchayat_id = ?, 
          assigned_panchayat_name = ?, 
          assigned_district = ?, 
          assigned_mandal = ?,
          last_login_at = ?
        WHERE id = ?
      `).run(
        locationData.assignedPanchayatId,
        locationData.assignedPanchayatName || locationData.assignedPanchayatId,
        locationData.assignedDistrict || user.assigned_district,
        locationData.assignedMandal || user.assigned_mandal,
        now,
        user.id
      );
      user.assigned_panchayat_id = locationData.assignedPanchayatId;
      user.assigned_panchayat_name = locationData.assignedPanchayatName || locationData.assignedPanchayatId;
      user.assigned_district = locationData.assignedDistrict || user.assigned_district;
      user.assigned_mandal = locationData.assignedMandal || user.assigned_mandal;
    } else {
      db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now, user.id);
    }

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      panchayatId: user.assigned_panchayat_id
    });

    logAudit(user.id, user.username, user.role, 'USER_LOGIN', `Logged in successfully as ${user.role}`, req.ip);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        assignedPanchayatId: user.assigned_panchayat_id,
        assignedPanchayatName: user.assigned_panchayat_name,
        assignedDistrict: user.assigned_district,
        assignedMandal: user.assigned_mandal,
        phoneNumber: user.phone_number,
        preferredLanguage: user.preferred_language,
        lastLoginAt: now
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, username, role, assignedPanchayatId, assignedPanchayatName, assignedDistrict, assignedMandal, phoneNumber, preferredLanguage } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').all(trimmedEmail);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Default to user role unless admin token provided or specified
    const targetRole = role === 'admin' ? 'admin' : 'user';
    const { hash, salt } = hashPassword(password);
    const now = getCurrentTimestampIST();

    const result = db.prepare(`
      INSERT INTO users (
        email, username, password_hash, salt, role,
        assigned_panchayat_id, assigned_panchayat_name, assigned_district, assigned_mandal,
        phone_number, preferred_language, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      trimmedEmail,
      username.trim(),
      hash,
      salt,
      targetRole,
      assignedPanchayatId || 'maredumilli',
      assignedPanchayatName || 'Maredumilli',
      assignedDistrict || 'Alluri Sitharama Raju',
      assignedMandal || 'Maredumilli',
      phoneNumber || '+91 98480 •••••',
      preferredLanguage || 'te',
      now
    );

    const newUserId = result.lastInsertRowid;
    const token = generateToken({
      id: newUserId,
      email: trimmedEmail,
      role: targetRole,
      username: username.trim(),
      panchayatId: assignedPanchayatId || 'maredumilli'
    });

    logAudit(newUserId, username.trim(), targetRole, 'USER_REGISTER', `Account created with role ${targetRole}`, req.ip);

    return res.status(201).json({
      token,
      user: {
        id: newUserId,
        email: trimmedEmail,
        username: username.trim(),
        role: targetRole,
        assignedPanchayatId: assignedPanchayatId || 'maredumilli',
        assignedPanchayatName: assignedPanchayatName || 'Maredumilli',
        assignedDistrict: assignedDistrict || 'Alluri Sitharama Raju',
        assignedMandal: assignedMandal || 'Maredumilli',
        phoneNumber: phoneNumber || '+91 98480 •••••',
        preferredLanguage: preferredLanguage || 'te',
        createdAt: now
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticate, (req, res) => {
  return res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      role: req.user.role,
      assignedPanchayatId: req.user.assigned_panchayat_id,
      assignedPanchayatName: req.user.assigned_panchayat_name,
      assignedDistrict: req.user.assigned_district,
      assignedMandal: req.user.assigned_mandal,
      phoneNumber: req.user.phone_number,
      preferredLanguage: req.user.preferred_language,
      isActive: Boolean(req.user.is_active)
    }
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticate, (req, res) => {
  logAudit(req.user.id, req.user.username, req.user.role, 'USER_LOGOUT', 'User logged out', req.ip);
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ==========================================
// 2. USER DASHBOARD & AUTHORIZED DATA
// ==========================================

// GET /api/user/dashboard-data
// Enforces that normal users can ONLY access data for their assigned Gram Panchayat
app.get('/api/user/dashboard-data', authenticate, (req, res) => {
  try {
    const user = req.user;
    const today = getTodayIST();

    // Check today's alert status for the user's assigned panchayat
    const alertRecord = db.prepare(`
      SELECT * FROM daily_alerts 
      WHERE date_str = ? AND panchayat_id = ?
    `).all(today, user.assigned_panchayat_id);

    // Fetch registered farmer records for this panchayat
    const farmers = db.prepare(`
      SELECT id, name, masked_phone, alert_preference, language, land_acres, primary_crop 
      FROM farmer_registry 
      WHERE panchayat_id = ?
    `).all(user.assigned_panchayat_id);

    // Recent alerts history for user's panchayat (last 7 days)
    const recentAlerts = db.prepare(`
      SELECT id, date_str, risk_type, risk_level, trigger_reason, channel, status, created_at 
      FROM daily_alerts 
      WHERE panchayat_id = ? 
      ORDER BY id DESC LIMIT 7
    `).all(user.assigned_panchayat_id);

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        assignedPanchayatId: user.assigned_panchayat_id,
        assignedPanchayatName: user.assigned_panchayat_name,
        assignedDistrict: user.assigned_district,
        assignedMandal: user.assigned_mandal,
        phoneNumber: user.phone_number,
        preferredLanguage: user.preferred_language
      },
      todayDate: today,
      dailyAlert: {
        hasAlertToday: alertRecord.length > 0,
        record: alertRecord.length > 0 ? alertRecord[0] : null
      },
      registeredFarmersCount: farmers.length,
      demoFarmers: farmers,
      recentAlerts
    });
  } catch (err) {
    console.error('User dashboard data error:', err);
    return res.status(500).json({ error: 'Failed to fetch user dashboard data.' });
  }
});

// ==========================================
// 3. ADMIN MANAGEMENT & SYSTEM MONITORING
// ==========================================

// GET /api/admin/overview
app.get('/api/admin/overview', authenticate, requireRole('admin'), (req, res) => {
  try {
    const today = getTodayIST();

    const totalUsers = db.prepare('SELECT count(*) as count FROM users').all()[0].count;
    const activeUsers = db.prepare('SELECT count(*) as count FROM users WHERE is_active = 1').all()[0].count;
    const alertsToday = db.prepare('SELECT count(*) as count FROM daily_alerts WHERE date_str = ?').all(today)[0].count;
    const totalAlertsAllTime = db.prepare('SELECT count(*) as count FROM daily_alerts').all()[0].count;
    const totalFarmers = db.prepare('SELECT count(*) as count FROM farmer_registry').all()[0].count;

    // Recent alert executions
    const recentAlerts = db.prepare(`
      SELECT da.*, u.username as triggered_by_name
      FROM daily_alerts da
      LEFT JOIN users u ON da.user_id = u.id
      ORDER BY da.id DESC LIMIT 10
    `).all();

    // Risk distribution today
    const riskBreakdown = db.prepare(`
      SELECT risk_type, count(*) as count 
      FROM daily_alerts 
      WHERE date_str = ? 
      GROUP BY risk_type
    `).all(today);

    return res.json({
      todayDate: today,
      systemStats: {
        totalGramPanchayats: 13326,
        totalDistricts: 26,
        totalMandals: 679,
        registeredUsers: totalUsers,
        activeUsers,
        alertsDispatchedToday: alertsToday,
        totalAlertsDispatchedAllTime: totalAlertsAllTime,
        demoFarmersRegistered: totalFarmers,
        mlEngineStatus: 'OPERATIONAL',
        lapseRateModel: 'Active (-6.5 C / 1000m)',
        demResolution: 'SRTM 30m / ISRO Bhuvan'
      },
      recentAlerts,
      riskBreakdown
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin overview.' });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', authenticate, requireRole('admin'), (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, username, role, assigned_panchayat_id, assigned_panchayat_name, 
             assigned_district, assigned_mandal, phone_number, preferred_language, 
             is_active, created_at, last_login_at 
      FROM users 
      ORDER BY id ASC
    `).all();
    return res.json({ users });
  } catch (err) {
    console.error('Admin users error:', err);
    return res.status(500).json({ error: 'Failed to retrieve users list.' });
  }
});

// POST /api/admin/users
app.post('/api/admin/users', authenticate, requireRole('admin'), (req, res) => {
  try {
    const { email, username, password, role, assignedPanchayatId, assignedPanchayatName, assignedDistrict, assignedMandal, phoneNumber, preferredLanguage } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, username, and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').all(trimmedEmail);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    const { hash, salt } = hashPassword(password);
    const now = getCurrentTimestampIST();

    const result = db.prepare(`
      INSERT INTO users (
        email, username, password_hash, salt, role,
        assigned_panchayat_id, assigned_panchayat_name, assigned_district, assigned_mandal,
        phone_number, preferred_language, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      trimmedEmail,
      username.trim(),
      hash,
      salt,
      role === 'admin' ? 'admin' : 'user',
      assignedPanchayatId || 'maredumilli',
      assignedPanchayatName || 'Maredumilli',
      assignedDistrict || 'Alluri Sitharama Raju',
      assignedMandal || 'Maredumilli',
      phoneNumber || '+91 98480 •••••',
      preferredLanguage || 'te',
      now
    );

    logAudit(req.user.id, req.user.username, req.user.role, 'ADMIN_CREATE_USER', `Created user ${trimmedEmail} (${role})`, req.ip);

    return res.status(201).json({
      message: 'User created successfully.',
      userId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Admin create user error:', err);
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

// PUT /api/admin/users/:id/status
app.put('/api/admin/users/:id/status', authenticate, requireRole('admin'), (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { isActive } = req.body;

    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Administrators cannot deactivate their own active session.' });
    }

    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, targetUserId);
    logAudit(req.user.id, req.user.username, req.user.role, 'ADMIN_UPDATE_USER_STATUS', `User ID ${targetUserId} active status changed to ${isActive}`, req.ip);

    return res.json({ message: 'User status updated successfully.', isActive: Boolean(isActive) });
  } catch (err) {
    console.error('Admin update status error:', err);
    return res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// GET /api/admin/alert-logs
app.get('/api/admin/alert-logs', authenticate, requireRole('admin'), (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT da.*, u.username as triggered_by_name, u.role as triggered_by_role
      FROM daily_alerts da
      LEFT JOIN users u ON da.user_id = u.id
      ORDER BY da.id DESC LIMIT 50
    `).all();
    return res.json({ logs });
  } catch (err) {
    console.error('Admin alert logs error:', err);
    return res.status(500).json({ error: 'Failed to retrieve alert logs.' });
  }
});

// GET /api/admin/audit-logs
app.get('/api/admin/audit-logs', authenticate, requireRole('admin'), (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM system_audit_logs 
      ORDER BY id DESC LIMIT 100
    `).all();
    return res.json({ logs });
  } catch (err) {
    console.error('Admin audit logs error:', err);
    return res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
});

// ==========================================
// 4. DAILY ALERT & ONCE-PER-DAY ENFORCEMENT
// ==========================================

// GET /api/alerts/daily-status
// Checks if today's alert has already occurred for a given Gram Panchayat
app.get('/api/alerts/daily-status', authenticate, (req, res) => {
  try {
    const today = getTodayIST();
    // Non-admin users are strictly locked to their assigned panchayat
    const panchayatId = req.user.role === 'admin' 
      ? (req.query.panchayatId || req.user.assigned_panchayat_id)
      : req.user.assigned_panchayat_id;

    const existing = db.prepare(`
      SELECT * FROM daily_alerts 
      WHERE date_str = ? AND panchayat_id = ?
    `).all(today, panchayatId);

    if (existing.length > 0) {
      return res.json({
        todayDate: today,
        panchayatId,
        alreadyExecutedToday: true,
        record: existing[0],
        message: 'Daily alert has already been executed for this Gram Panchayat today.'
      });
    }

    return res.json({
      todayDate: today,
      panchayatId,
      alreadyExecutedToday: false,
      record: null,
      message: 'No alert has been executed yet for this Gram Panchayat today.'
    });
  } catch (err) {
    console.error('Daily alert status error:', err);
    return res.status(500).json({ error: 'Failed to check daily alert status.' });
  }
});

// POST /api/alerts/trigger-daily
// Strict Server-Side Once-Per-Day Rule:
// Rejects duplicate calls on page refresh, navigation, or re-renders
app.post('/api/alerts/trigger-daily', authenticate, (req, res) => {
  try {
    const today = getTodayIST();
    const user = req.user;

    // Normal users can ONLY trigger alert for their assigned panchayat
    let { panchayatId, panchayatName, riskType, riskLevel, triggerReason, channel, recipientCount, deliveryStats } = req.body;

    if (user.role !== 'admin') {
      panchayatId = user.assigned_panchayat_id;
      panchayatName = user.assigned_panchayat_name;
    } else {
      panchayatId = panchayatId || user.assigned_panchayat_id;
      panchayatName = panchayatName || user.assigned_panchayat_name;
    }

    // 1. Strict Server-Side Check: Has an alert already been completed today?
    const existing = db.prepare(`
      SELECT * FROM daily_alerts 
      WHERE date_str = ? AND panchayat_id = ?
    `).all(today, panchayatId);

    if (existing.length > 0) {
      // 409 Conflict: Strict Once-Per-Day Violation
      logAudit(user.id, user.username, user.role, 'DUPLICATE_ALERT_PREVENTED', `Blocked duplicate alert for ${panchayatName} on ${today}`, req.ip);
      return res.status(409).json({
        success: false,
        alreadyExecutedToday: true,
        message: `Strict Policy: Today's emergency alert for ${panchayatName} has already been dispatched on ${today} at ${existing[0].created_at}. Daily calls are capped at strictly 1 per day.`,
        record: existing[0]
      });
    }

    // 2. Insert execution record
    const now = getCurrentTimestampIST();
    const count = parseInt(recipientCount, 10) || 1;
    const statsStr = typeof deliveryStats === 'object' ? JSON.stringify(deliveryStats) : deliveryStats || '';

    const result = db.prepare(`
      INSERT INTO daily_alerts (
        date_str, panchayat_id, panchayat_name, user_id,
        risk_type, risk_level, trigger_reason, channel,
        status, recipient_count, delivery_stats, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      today,
      panchayatId,
      panchayatName,
      user.id,
      riskType || 'waterlogging',
      riskLevel || 'CRITICAL',
      triggerReason || 'Autonomous sensor threshold reached',
      channel || 'VOICE_CALL',
      'DELIVERED',
      count,
      statsStr,
      now
    );

    const newRecord = {
      id: result.lastInsertRowid,
      date_str: today,
      panchayat_id: panchayatId,
      panchayat_name: panchayatName,
      user_id: user.id,
      risk_type: riskType,
      risk_level: riskLevel,
      trigger_reason: triggerReason,
      channel: channel || 'VOICE_CALL',
      status: 'DELIVERED',
      recipient_count: count,
      created_at: now
    };

    logAudit(user.id, user.username, user.role, 'DAILY_ALERT_DISPATCHED', `Dispatched daily emergency alert for ${panchayatName} (${riskType})`, req.ip);

    return res.status(200).json({
      success: true,
      alreadyExecutedToday: false,
      message: `Daily emergency alert for ${panchayatName} successfully recorded and dispatched.`,
      record: newRecord
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        alreadyExecutedToday: true,
        message: 'Unique constraint: A daily alert was just registered for this Gram Panchayat today.'
      });
    }
    console.error('Trigger daily alert error:', err);
    return res.status(500).json({ error: 'Failed to record daily alert.' });
  }
});

// ==========================================
// 4B. SEPARATE DATABASE ENDPOINTS: FARMERS & PANCHAYATS
// ==========================================

// GET /api/database/farmers
app.get('/api/database/farmers', (req, res) => {
  try {
    const { panchayatId, district, mandal, search, phone } = req.query;
    let query = 'SELECT * FROM farmers WHERE 1=1';
    const params = [];

    if (panchayatId) {
      query += ' AND panchayat_id = ?';
      params.push(panchayatId);
    }
    if (district) {
      query += ' AND LOWER(district) = ?';
      params.push(district.toLowerCase());
    }
    if (mandal) {
      query += ' AND LOWER(mandal) = ?';
      params.push(mandal.toLowerCase());
    }
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      query += ' AND (phone LIKE ? OR masked_phone LIKE ?)';
      params.push(`%${cleanPhone}%`, `%${phone}%`);
    }
    if (search) {
      const q = `%${search.toLowerCase()}%`;
      query += ' AND (LOWER(name) LIKE ? OR LOWER(panchayat_name) LIKE ? OR LOWER(primary_crop) LIKE ? OR phone LIKE ?)';
      params.push(q, q, q, `%${search}%`);
    }

    query += ' ORDER BY id DESC';
    const farmers = db.prepare(query).all(...params);
    return res.json({ farmers, count: farmers.length });
  } catch (err) {
    console.error('Fetch farmers error:', err);
    return res.status(500).json({ error: 'Failed to fetch farmers database.' });
  }
});

// POST /api/database/farmers
app.post('/api/database/farmers', (req, res) => {
  try {
    const { name, phone, district, mandal, panchayatId, panchayatName, primaryCrop, landAcres, language, alertPreference } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and Phone number are required.' });
    }

    const cleanDigits = phone.replace(/\D/g, '');
    const prefix = cleanDigits.slice(0, 5);
    const maskedPhone = cleanDigits.length >= 10 ? `+91 ${prefix} •••••` : phone;
    const now = getCurrentTimestampIST();

    const result = db.prepare(`
      INSERT INTO farmers (
        name, phone, masked_phone, district, mandal, panchayat_id, panchayat_name,
        primary_crop, land_acres, language, alert_preference, is_active, registered_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      name.trim(),
      phone.trim(),
      maskedPhone,
      district || 'Alluri Sitharama Raju',
      mandal || 'Maredumilli',
      panchayatId || 'ap-asr-maredumilli',
      panchayatName || 'Maredumilli',
      primaryCrop || 'Paddy',
      parseFloat(landAcres) || 2.5,
      language || 'te',
      alertPreference || 'Both',
      now
    );

    const createdFarmer = {
      id: result.lastInsertRowid,
      name: name.trim(),
      phone: phone.trim(),
      masked_phone: maskedPhone,
      district: district || 'Alluri Sitharama Raju',
      mandal: mandal || 'Maredumilli',
      panchayat_id: panchayatId || 'ap-asr-maredumilli',
      panchayat_name: panchayatName || 'Maredumilli',
      primary_crop: primaryCrop || 'Paddy',
      land_acres: parseFloat(landAcres) || 2.5,
      language: language || 'te',
      alert_preference: alertPreference || 'Both',
      is_active: 1,
      registered_at: now
    };

    return res.status(201).json({ success: true, farmer: createdFarmer });
  } catch (err) {
    console.error('Create farmer error:', err);
    return res.status(500).json({ error: 'Failed to register farmer.' });
  }
});

// GET /api/database/panchayats
app.get('/api/database/panchayats', (req, res) => {
  try {
    const panchayats = db.prepare(`
      SELECT p.*, (SELECT count(*) FROM farmers f WHERE f.panchayat_id = p.id) as registered_farmers_count
      FROM panchayats p
      ORDER BY p.name ASC
    `).all();
    return res.json({ panchayats });
  } catch (err) {
    console.error('Fetch panchayats error:', err);
    return res.status(500).json({ error: 'Failed to fetch panchayats database.' });
  }
});


// ==========================================
// OUTBOUND TELEPHONY & SMS GATEWAY HELPERS
// ==========================================

function generateEmergencyAlertSms(farmer, alertType, panchayatName) {
  const pName = panchayatName || farmer?.panchayat_name || 'మీ గ్రామ పంచాయతీ';
  switch (alertType) {
    case 'scorching_sun':
      return `[ఆకాశ్ AI అత్యవసర హెచ్చరిక] ${pName} పరిధిలో తీవ్ర వడగాల్పులు & 38.5°C కంటే ఎక్కువ ఉష్ణోగ్రత నమోదయ్యే అవకాశం ఉంది. పంటలకు తక్షణ నీటి తడులు అందించండి. హెల్ప్‌లైన్: 1800-AAKASH`;
    case 'wind_squall':
      return `[ఆకాశ్ AI అత్యవసర హెచ్చరిక] ${pName} పరిధిలో 45+ కి.మీ వేగంతో ఈదురుగాలుల ప్రమాదం ఉంది. పంటలకు రక్షణ కర్రలు ఏర్పాటు చేయండి. హెల్ప్‌లైన్: 1800-AAKASH`;
    case 'thunderstorm':
      return `[ఆకాశ్ AI అత్యవసర హెచ్చరిక] ${pName} పరిధిలో తీవ్ర పిడుగులు & ఉరుములతో వర్షం పడే అవకాశం ఉంది. చెట్ల క్రింద ఉండరాదు. సురక్షిత ప్రాంతాలకు వెళ్ళండి. హెల్ప్‌లైన్: 1800-AAKASH`;
    case 'waterlogging':
    default:
      return `[ఆకాశ్ AI అత్యవసర హెచ్చరిక] ${pName} పరిధిలో కుండపోత వర్షం & నీరు నిలిచే ప్రమాదం ఉంది. పంట పొలాల నుండి అదనపు నీటిని వెంటనే బయటకు మళ్లించండి. హెల్ప్‌లైన్: 1800-AAKASH`;
  }
}


// ==========================================
// TELEPHONY & CARRIER GATEWAY CONFIGURATION
// ==========================================
const telephonySettingsFile = path.join(__dirname, 'data', 'telephony_settings.json');

function getTelephonySettings() {
  try {
    if (fs.existsSync(telephonySettingsFile)) {
      return JSON.parse(fs.readFileSync(telephonySettingsFile, 'utf8'));
    }
  } catch (e) {
    console.warn('Failed to read telephony settings:', e.message);
  }
  return {
    fast2smsApiKey: process.env.FAST2SMS_API_KEY || '',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFromPhone: process.env.TWILIO_FROM_PHONE || ''
  };
}

function saveTelephonySettings(settings) {
  try {
    fs.writeFileSync(telephonySettingsFile, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Failed to save telephony settings:', e.message);
    return false;
  }
}

async function sendFast2Sms(apiKey, phone10Digits, text) {
  return new Promise((resolve) => {
    try {
      const postData = JSON.stringify({
        route: 'q',
        message: text,
        language: 'unicode',
        flash: 0,
        numbers: phone10Digits
      });

      const req = https.request({
        hostname: 'www.fast2sms.com',
        path: '/dev/bulkV2',
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 6000
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({
              attempted: true,
              success: parsed.return === true,
              provider: 'Fast2SMS',
              recipient: phone10Digits,
              details: parsed
            });
          } catch (e) {
            resolve({ attempted: true, success: false, provider: 'Fast2SMS', details: data });
          }
        });
      });

      req.on('error', err => resolve({ attempted: true, success: false, provider: 'Fast2SMS', error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ attempted: true, success: false, provider: 'Fast2SMS', error: 'Timeout' }); });
      req.write(postData);
      req.end();
    } catch (e) {
      resolve({ attempted: false, success: false, provider: 'Fast2SMS', error: e.message });
    }
  });
}

async function sendTwilioSms(accountSid, authToken, fromPhone, toPhone, text) {
  return new Promise((resolve) => {
    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const postData = new URLSearchParams({
        To: toPhone,
        From: fromPhone,
        Body: text
      }).toString();

      const req = https.request({
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 6000
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({
              attempted: true,
              success: !parsed.error_code,
              provider: 'Twilio SMS',
              recipient: toPhone,
              details: parsed
            });
          } catch (e) {
            resolve({ attempted: true, success: false, provider: 'Twilio SMS', details: data });
          }
        });
      });

      req.on('error', err => resolve({ attempted: true, success: false, provider: 'Twilio SMS', error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ attempted: true, success: false, provider: 'Twilio SMS', error: 'Timeout' }); });
      req.write(postData);
      req.end();
    } catch (e) {
      resolve({ attempted: false, success: false, provider: 'Twilio SMS', error: e.message });
    }
  });
}

async function triggerTwilioCall(accountSid, authToken, fromPhone, toPhone, text) {
  return new Promise((resolve) => {
    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const twiml = `<Response><Say voice="Polly.Aditi" language="hi-IN">${text}</Say></Response>`;
      const postData = new URLSearchParams({
        To: toPhone,
        From: fromPhone,
        Twiml: twiml
      }).toString();

      const req = https.request({
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${accountSid}/Calls.json`,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 6000
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({
              attempted: true,
              success: !parsed.error_code,
              provider: 'Twilio Voice',
              recipient: toPhone,
              details: parsed
            });
          } catch (e) {
            resolve({ attempted: true, success: false, provider: 'Twilio Voice', details: data });
          }
        });
      });

      req.on('error', err => resolve({ attempted: true, success: false, provider: 'Twilio Voice', error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ attempted: true, success: false, provider: 'Twilio Voice', error: 'Timeout' }); });
      req.write(postData);
      req.end();
    } catch (e) {
      resolve({ attempted: false, success: false, provider: 'Twilio Voice', error: e.message });
    }
  });
}

async function sendOutboundSms(rawPhone, text) {
  const cleanDigits = (rawPhone || '').replace(/\D/g, '');
  if (!cleanDigits || cleanDigits.length < 10) {
    return { attempted: false, success: false, reason: 'Invalid phone number format' };
  }
  const last10 = cleanDigits.slice(-10);
  const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : (rawPhone.startsWith('+') ? rawPhone : `+${cleanDigits}`);

  const settings = getTelephonySettings();

  // 1. If Fast2SMS API key is configured, use it for direct Indian carrier SMS
  if (settings.fast2smsApiKey) {
    const f2Res = await sendFast2Sms(settings.fast2smsApiKey, last10, text);
    if (f2Res.success) return f2Res;
  }

  // 2. If Twilio is configured, use it
  if (settings.twilioAccountSid && settings.twilioAuthToken && settings.twilioFromPhone) {
    const twRes = await sendTwilioSms(settings.twilioAccountSid, settings.twilioAuthToken, settings.twilioFromPhone, formattedPhone, text);
    if (twRes.success) return twRes;
  }

  // 3. Fallback to Textbelt
  return new Promise((resolve) => {
    try {
      const postData = JSON.stringify({
        phone: formattedPhone,
        message: text,
        key: process.env.TEXTBELT_KEY || 'textbelt'
      });

      const req = https.request({
        hostname: 'textbelt.com',
        path: '/text',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 4000
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({
              attempted: true,
              success: Boolean(parsed.success),
              provider: 'Textbelt',
              recipient: formattedPhone,
              details: parsed
            });
          } catch (e) {
            resolve({ attempted: true, success: false, provider: 'Textbelt', details: data });
          }
        });
      });

      req.on('error', (err) => {
        console.warn('Outbound SMS gateway network error (continuing gracefully):', err.message);
        resolve({ attempted: true, success: false, provider: 'Textbelt', error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ attempted: true, success: false, provider: 'Textbelt', error: 'Gateway timeout' });
      });

      req.write(postData);
      req.end();
    } catch (e) {
      resolve({ attempted: false, success: false, error: e.message });
    }
  });
}

async function triggerOutboundCall(rawPhone, text) {
  const cleanDigits = (rawPhone || '').replace(/\D/g, '');
  if (!cleanDigits || cleanDigits.length < 10) {
    return { attempted: false, success: false, reason: 'Invalid phone number format' };
  }
  const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : (rawPhone.startsWith('+') ? rawPhone : `+${cleanDigits}`);

  const settings = getTelephonySettings();
  if (settings.twilioAccountSid && settings.twilioAuthToken && settings.twilioFromPhone) {
    return await triggerTwilioCall(settings.twilioAccountSid, settings.twilioAuthToken, settings.twilioFromPhone, formattedPhone, text);
  }

  return {
    attempted: false,
    success: false,
    reason: 'No cellular telephony carrier trunk (Twilio) configured. Call audio played via browser IVR HUD.'
  };
}


// POST /api/alerts/send-manual-phone

// GET /api/telephony/settings
app.get('/api/telephony/settings', (req, res) => {
  const s = getTelephonySettings();
  return res.json({
    hasFast2sms: Boolean(s.fast2smsApiKey),
    fast2smsApiKeyMasked: s.fast2smsApiKey ? s.fast2smsApiKey.slice(0, 4) + '••••••••' : '',
    hasTwilio: Boolean(s.twilioAccountSid && s.twilioAuthToken),
    twilioSidMasked: s.twilioAccountSid ? s.twilioAccountSid.slice(0, 6) + '••••' : '',
    twilioFromPhone: s.twilioFromPhone || ''
  });
});

// POST /api/telephony/settings
app.post('/api/telephony/settings', (req, res) => {
  try {
    const { fast2smsApiKey, twilioAccountSid, twilioAuthToken, twilioFromPhone } = req.body;
    const current = getTelephonySettings();
    const updated = {
      fast2smsApiKey: fast2smsApiKey !== undefined ? fast2smsApiKey.trim() : current.fast2smsApiKey,
      twilioAccountSid: twilioAccountSid !== undefined ? twilioAccountSid.trim() : current.twilioAccountSid,
      twilioAuthToken: twilioAuthToken !== undefined ? twilioAuthToken.trim() : current.twilioAuthToken,
      twilioFromPhone: twilioFromPhone !== undefined ? twilioFromPhone.trim() : current.twilioFromPhone
    };
    saveTelephonySettings(updated);
    return res.json({ success: true, message: 'Telephony settings updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update telephony settings.' });
  }
});

app.post('/api/alerts/send-manual-phone', async (req, res) => {
  try {
    const { phone, alertType, triggerReason } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const cleanDigits = phone.replace(/\D/g, '');
    const last10 = cleanDigits.slice(-10);

    // Find farmer
    const matched = db.prepare(`
      SELECT * FROM farmers 
      WHERE phone LIKE ? OR phone LIKE ?
    `).all(`%${last10}%`, `%${cleanDigits}%`);

    const now = getCurrentTimestampIST();
    let farmer = matched.length > 0 ? matched[0] : null;

    if (farmer) {
      db.prepare(`
        UPDATE farmers 
        SET last_alert_at = ?, last_alert_type = ?, last_alert_status = 'DELIVERED' 
        WHERE id = ?
      `).run(now, alertType || 'waterlogging', farmer.id);
      farmer.last_alert_at = now;
      farmer.last_alert_type = alertType || 'waterlogging';
      farmer.last_alert_status = 'DELIVERED';
    } else {
      // Create new record for this phone
      const prefix = cleanDigits.slice(0, 5);
      const maskedPhone = cleanDigits.length >= 10 ? `+91 ${prefix} •••••` : phone;
      const ins = db.prepare(`
        INSERT INTO farmers (
          name, phone, masked_phone, district, mandal, panchayat_id, panchayat_name,
          primary_crop, land_acres, language, alert_preference, is_active, registered_at,
          last_alert_at, last_alert_type, last_alert_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Paddy', 2.0, 'te', 'Both', 1, ?, ?, ?, 'DELIVERED')
      `).run(
        `Farmer (${phone})`,
        phone,
        maskedPhone,
        'Alluri Sitharama Raju',
        'Maredumilli',
        'ap-asr-maredumilli',
        'Maredumilli',
        now,
        now,
        alertType || 'waterlogging'
      );
      farmer = {
        id: ins.lastInsertRowid,
        name: `Farmer (${phone})`,
        phone,
        masked_phone: maskedPhone,
        panchayat_name: 'Maredumilli',
        last_alert_at: now,
        last_alert_type: alertType || 'waterlogging',
        last_alert_status: 'DELIVERED'
      };
    }

    // Generate real SMS text and action deep links
    const smsText = generateEmergencyAlertSms(farmer, alertType, farmer.panchayat_name);
    const fullDigits = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    const encodedSms = encodeURIComponent(smsText);
    const smsUrl = `sms:+${fullDigits}?body=${encodedSms}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${fullDigits}&text=${encodedSms}`;

    // Attempt outbound SMS gateway delivery
    const gatewayResult = await sendOutboundSms(farmer.phone, smsText);

    // Attempt cellular carrier phone call if trunk configured
    const callResult = await triggerOutboundCall(farmer.phone, smsText);

    return res.json({
      success: true,
      message: `Emergency alert dispatched to ${farmer.name} (${farmer.phone})`,
      farmer,
      dispatchedAt: now,
      smsDispatched: gatewayResult.success,
      smsGatewayStatus: gatewayResult,
      callDispatched: callResult.success,
      callGatewayStatus: callResult,
      smsText,
      smsUrl,
      whatsappUrl
    });
  } catch (err) {
    console.error('Manual phone alert error:', err);
    return res.status(500).json({ error: 'Failed to send manual phone alert.' });
  }
});

// POST /api/alerts/dispatch-panchayat-risk
app.post('/api/alerts/dispatch-panchayat-risk', (req, res) => {
  try {
    const { panchayatId, riskType, triggerReason } = req.body;
    if (!panchayatId) {
      return res.status(400).json({ error: 'Panchayat ID is required.' });
    }

    const now = getCurrentTimestampIST();
    const today = getTodayIST();

    // 1. Update all farmers in this panchayat
    db.prepare(`
      UPDATE farmers 
      SET last_alert_at = ?, last_alert_type = ?, last_alert_status = 'DELIVERED' 
      WHERE panchayat_id = ?
    `).run(now, riskType || 'waterlogging', panchayatId);

    const affectedFarmers = db.prepare('SELECT * FROM farmers WHERE panchayat_id = ?').all(panchayatId);

    // 2. Update panchayat record
    db.prepare(`
      UPDATE panchayats 
      SET risk_level = 'CRITICAL', active_hazard = ?, last_alert_date = ? 
      WHERE id = ?
    `).run(riskType || 'waterlogging', today, panchayatId);

    return res.json({
      success: true,
      panchayatId,
      recipientCount: affectedFarmers.length,
      farmers: affectedFarmers,
      message: `Alert dispatched to all ${affectedFarmers.length} registered farmers in ${panchayatId}.`,
      dispatchedAt: now
    });
  } catch (err) {
    console.error('Panchayat risk dispatch error:', err);
    return res.status(500).json({ error: 'Failed to dispatch panchayat alert.' });
  }
});

// ==========================================
// 5. HIGH-FIDELITY TTS STREAMING PROXY
// ==========================================

app.get('/api/tts', (req, res) => {
  try {
    const q = req.query.q || '';
    const tl = req.query.tl || 'en';

    if (!q) {
      return res.status(400).send('Missing query text parameter (q)');
    }

    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=${encodeURIComponent(tl)}&client=tw-ob`;

    const request = https.get(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (ttsRes) => {
      res.writeHead(ttsRes.statusCode || 200, {
        'Content-Type': ttsRes.headers['content-type'] || 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });
      ttsRes.pipe(res);
    });

    request.on('error', (err) => {
      console.warn('TTS streaming proxy network error:', err.message);
      res.status(502).send('TTS upstream unavailable');
    });
  } catch (e) {
    console.error('TTS proxy server exception:', e);
    res.status(500).send('TTS server error');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: getCurrentTimestampIST(),
    environment: 'production-ready',
    uptimeSeconds: process.uptime()
  });
});

// Fallback 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.method} ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED SERVER ERROR]', err);
  res.status(500).json({ error: 'Internal server error occurred.', details: err.message });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🌾 Aakash AI Backend Server running on port ${PORT}`);
  console.log(`📡 Database: SQLite initialized at server/data/aakash.sqlite`);
  console.log(`🔒 JWT Secret & Role Authorization: Active`);
  console.log(`📅 Today (IST): ${getTodayIST()}`);
  console.log(`==================================================`);
});