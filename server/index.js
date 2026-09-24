import express from 'express';
import cors from 'cors';
import https from 'https';
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

    const trimmedEmail = email.trim().toLowerCase();
    const users = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').all(trimmedEmail);

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

    // Update last login
    const now = getCurrentTimestampIST();
    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now, user.id);

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