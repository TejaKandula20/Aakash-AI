import crypto from 'crypto';
import { db, getCurrentTimestampIST } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aakash_ai_hyper_local_super_secret_key_2026';

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

export function generateToken(payload, expiresInSeconds = 86400) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSig) {
    return null; // Invalid signature
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. Missing Authorization header.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Malformed Authorization header. Format must be: Bearer <token>' });
  }

  const token = parts[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
  }

  // Fetch fresh user from DB to verify user exists and is active
  const users = db.prepare('SELECT id, email, username, role, assigned_panchayat_id, assigned_panchayat_name, assigned_district, assigned_mandal, phone_number, preferred_language, is_active FROM users WHERE id = ?').all(decoded.id);
  if (!users || users.length === 0) {
    return res.status(401).json({ error: 'User account no longer exists.' });
  }

  const user = users[0];
  if (!user.is_active) {
    return res.status(403).json({ error: 'Account has been deactivated. Please contact the administrator.' });
  }

  req.user = user;
  next();
}

export function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.user.role !== requiredRole) {
      // Log unauthorized attempt
      logAudit(req.user.id, req.user.username, req.user.role, 'UNAUTHORIZED_ACCESS_ATTEMPT', `Attempted to access ${req.method} ${req.originalUrl}`, req.ip);
      return res.status(403).json({
        error: `Access denied. This resource requires '${requiredRole}' privileges.`,
        code: 'FORBIDDEN_ROLE'
      });
    }
    next();
  };
}

export function logAudit(userId, username, role, action, details, ip) {
  try {
    db.prepare(`
      INSERT INTO system_audit_logs (user_id, username, role, action, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId || null, username || 'Anonymous', role || 'unknown', action, details || '', ip || '127.0.0.1', getCurrentTimestampIST());
  } catch (e) {
    console.error('[AUDIT ERROR]', e);
  }
}
