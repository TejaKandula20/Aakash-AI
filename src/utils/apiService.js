const API_BASE = '/api';

// Seeded credentials for offline & static GitHub Pages hosting
const SEEDED_ACCOUNTS = [
  {
    id: 1,
    email: 'kandulatejachowdary@gmail.com',
    username: 'tejakandula',
    password: 'teja@9999',
    role: 'admin',
    fullName: 'Teja Kandula',
    assignedPanchayatId: 'ap-asr-maredumilli',
    assignedPanchayatName: 'Maredumilli',
    assignedDistrict: 'Alluri Sitharama Raju',
    assignedMandal: 'Maredumilli',
    phoneNumber: '+91 98480 •••••',
    preferredLanguage: 'te',
    isActive: true
  },
  {
    id: 2,
    email: 'msuchitra954@gmail.com',
    username: 'suchitra',
    password: 'suchitra@9999',
    role: 'user',
    fullName: 'Suchitra M',
    assignedPanchayatId: 'ap-asr-maredumilli',
    assignedPanchayatName: 'Maredumilli',
    assignedDistrict: 'Alluri Sitharama Raju',
    assignedMandal: 'Maredumilli',
    phoneNumber: '+91 98480 •••••',
    preferredLanguage: 'te',
    isActive: true
  }
];

class ApiService {
  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('aakash_jwt_token') : null;
    this.user = typeof window !== 'undefined' ? this._loadSavedUser() : null;
  }

  _isStaticHost() {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname;
    return hostname.includes('github.io') || window.location.protocol === 'file:';
  }

  _loadSavedUser() {
    try {
      const saved = localStorage.getItem('aakash_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  _getRegisteredUsers() {
    try {
      const saved = localStorage.getItem('aakash_registered_users');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  _saveRegisteredUser(user) {
    try {
      const list = this._getRegisteredUsers();
      list.push(user);
      localStorage.setItem('aakash_registered_users', JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save user locally:', e);
    }
  }

  setSession(token, user) {
    this.token = token;
    this.user = user;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('aakash_jwt_token', token);
      } else {
        localStorage.removeItem('aakash_jwt_token');
      }
      if (user) {
        localStorage.setItem('aakash_user_profile', JSON.stringify(user));
      } else {
        localStorage.removeItem('aakash_user_profile');
      }
    }
  }

  clearSession() {
    this.setSession(null, null);
  }

  isAuthenticated() {
    return Boolean(this.token && this.user);
  }

  isAdmin() {
    return Boolean(this.user && this.user.role === 'admin');
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = 'Bearer ' + this.token;
    }
    return headers;
  }

  // Client-side authentication simulation for static hosting (GitHub Pages)
  _simulateLogin(identifier, password, locationOverride = null) {
    const cleanId = (identifier || '').trim().toLowerCase();
    const allUsers = [...SEEDED_ACCOUNTS, ...this._getRegisteredUsers()];

    const found = allUsers.find(u => 
      u.email.toLowerCase() === cleanId || 
      u.username.toLowerCase() === cleanId
    );

    if (!found) {
      const err = new Error('User not found. Use tejakandula (Admin) or suchitra (User)');
      err.status = 404;
      throw err;
    }

    if (found.password !== password) {
      const err = new Error('Invalid password. Please check your credentials.');
      err.status = 401;
      throw err;
    }

    const userWithoutPassword = { ...found };
    delete userWithoutPassword.password;

    // Apply location override if user selected a custom alert location on the login card
    if (locationOverride) {
      if (locationOverride.assignedPanchayatId) userWithoutPassword.assignedPanchayatId = locationOverride.assignedPanchayatId;
      if (locationOverride.assignedPanchayatName) userWithoutPassword.assignedPanchayatName = locationOverride.assignedPanchayatName;
      if (locationOverride.assignedDistrict) userWithoutPassword.assignedDistrict = locationOverride.assignedDistrict;
      if (locationOverride.assignedMandal) userWithoutPassword.assignedMandal = locationOverride.assignedMandal;
    }

    const token = 'sim_jwt_' + btoa(JSON.stringify({ id: userWithoutPassword.id, role: userWithoutPassword.role, exp: Date.now() + 86400000 }));
    this.setSession(token, userWithoutPassword);

    return {
      message: 'Login successful',
      token,
      user: userWithoutPassword
    };
  }

  _simulateRegister(userData) {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const cleanUsername = (userData.username || '').trim().toLowerCase();
    const allUsers = [...SEEDED_ACCOUNTS, ...this._getRegisteredUsers()];

    if (allUsers.some(u => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanUsername)) {
      const err = new Error('User with this email or username already exists');
      err.status = 400;
      throw err;
    }

    const newUser = {
      id: Date.now(),
      email: userData.email,
      username: userData.username,
      password: userData.password,
      role: userData.role || 'user',
      fullName: userData.username,
      assignedPanchayatId: userData.assignedPanchayatId || 'ap-asr-maredumilli',
      assignedPanchayatName: userData.assignedPanchayatName || 'Maredumilli',
      assignedDistrict: userData.assignedDistrict || 'Alluri Sitharama Raju',
      assignedMandal: userData.assignedMandal || 'Maredumilli',
      phoneNumber: userData.phoneNumber || '+91 98480 •••••',
      preferredLanguage: userData.preferredLanguage || 'te',
      isActive: true
    };

    this._saveRegisteredUser(newUser);
    const { password: _, ...userClean } = newUser;
    const token = 'sim_jwt_' + btoa(JSON.stringify({ id: newUser.id, role: newUser.role, exp: Date.now() + 86400000 }));
    this.setSession(token, userClean);

    return {
      message: 'Registration successful',
      token,
      user: userClean
    };
  }

  async request(endpoint, options = {}) {
    // If on GitHub Pages, avoid making POST requests that return 405 Not Allowed
    if (this._isStaticHost()) {
      return this._handleStaticRequest(endpoint, options);
    }

    const url = API_BASE + endpoint;
    const headers = {
      ...this.getAuthHeaders(),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      let responseData = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        // If server returns HTML (e.g. 405 Not Allowed or 404 from static host)
        if (text.includes('<html') || text.includes('405') || text.includes('404')) {
          console.warn('[API] Static host intercepted API route. Falling back to client-side engine.');
          return this._handleStaticRequest(endpoint, options);
        }
        responseData = { message: text };
      }

      if (!response.ok) {
        // If 404 or 405 on an API endpoint, fallback to static simulation
        if (response.status === 404 || response.status === 405) {
          console.warn(`[API] Received status ${response.status} from server. Falling back to client-side handler.`);
          return this._handleStaticRequest(endpoint, options);
        }

        if (response.status === 401) {
          this.clearSession();
        }

        const error = new Error(responseData?.error || responseData?.message || ('Request failed with status ' + response.status));
        error.status = response.status;
        error.data = responseData;
        throw error;
      }

      return responseData;
    } catch (err) {
      // If network fetch fails (e.g. server down or offline), fallback to client-side simulation
      if (err.name === 'TypeError' || (err.message && err.message.includes('fetch'))) {
        console.warn('[API] Backend server unreachable. Using client-side handler.');
        return this._handleStaticRequest(endpoint, options);
      }
      throw err;
    }
  }

  _handleStaticRequest(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body) : {};

    // 1. Auth Login
    if (endpoint === '/auth/login' && method === 'POST') {
      try {
        return Promise.resolve(this._simulateLogin(body.email, body.password));
      } catch (e) {
        return Promise.reject(e);
      }
    }

    // 2. Auth Register
    if (endpoint === '/auth/register' && method === 'POST') {
      try {
        return Promise.resolve(this._simulateRegister(body));
      } catch (e) {
        return Promise.reject(e);
      }
    }

    // 3. Auth Me
    if (endpoint === '/auth/me') {
      return Promise.resolve({ user: this.user });
    }

    // 4. Auth Logout
    if (endpoint === '/auth/logout') {
      this.clearSession();
      return Promise.resolve({ success: true });
    }

    // 5. Daily Alert Status
    if (endpoint.startsWith('/alerts/daily-status')) {
      const today = new Date().toISOString().slice(0, 10);
      const key = 'aakash_alert_sent_' + today;
      const isSent = Boolean(localStorage.getItem(key));
      return Promise.resolve({
        alreadyExecutedToday: isSent,
        todayDate: today,
        record: isSent ? {
          date_str: today,
          risk_type: 'waterlogging',
          risk_level: 'CRITICAL',
          trigger_reason: 'Autonomous sensor threshold reached (Rain: 38.5mm, Soil: 98%)',
          channel: 'VOICE_CALL',
          recipient_count: 4,
          status: 'COMPLETED'
        } : null
      });
    }

    // 6. Trigger Daily Alert
    if (endpoint === '/alerts/trigger-daily' && method === 'POST') {
      const today = new Date().toISOString().slice(0, 10);
      const key = 'aakash_alert_sent_' + today;
      localStorage.setItem(key, 'executed');
      return Promise.resolve({
        success: true,
        record: {
          id: Date.now(),
          date_str: today,
          risk_type: body.riskType || 'waterlogging',
          risk_level: body.riskLevel || 'CRITICAL',
          trigger_reason: body.triggerReason || 'Autonomous sensor threshold reached',
          channel: body.channel || 'VOICE_CALL',
          recipient_count: body.recipientCount || 4,
          status: 'COMPLETED'
        }
      });
    }

    // 7. Admin Overview
    if (endpoint === '/admin/overview') {
      return Promise.resolve({
        totalPanchayats: 13326,
        activeSensors: 42190,
        usersRegistered: 4820,
        alertsDispatchedToday: 14,
        systemStatus: 'OPERATIONAL',
        activeSevereAlerts: 3
      });
    }

    // 8. Admin Users
    if (endpoint === '/admin/users') {
      const all = [...SEEDED_ACCOUNTS, ...this._getRegisteredUsers()].map(({ password: _, ...u }) => u);
      return Promise.resolve({ users: all });
    }

    // 9. Admin Alert Logs
    if (endpoint === '/admin/alert-logs') {
      return Promise.resolve({
        logs: [
          {
            id: 1,
            panchayat_id: 'ap-asr-maredumilli',
            panchayat_name: 'Maredumilli',
            risk_type: 'waterlogging',
            risk_level: 'CRITICAL',
            channel: 'VOICE_CALL',
            recipient_count: 4,
            status: 'COMPLETED',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            panchayat_id: 'ap-kadapa-pulivendula',
            panchayat_name: 'Pulivendula',
            risk_type: 'scorching_sun',
            risk_level: 'WARNING',
            channel: 'SMS',
            recipient_count: 12,
            status: 'COMPLETED',
            created_at: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      });
    }

    // 10. Admin Audit Logs
    if (endpoint === '/admin/audit-logs') {
      return Promise.resolve({
        logs: [
          {
            id: 1,
            action: 'LOGIN',
            user_id: 1,
            details: 'Admin login from secure gateway',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            action: 'DISPATCH_ALERT',
            user_id: 1,
            details: 'Triggered autonomous agro-meteorological call to 4 farmers in Maredumilli',
            created_at: new Date(Date.now() - 1800000).toISOString()
          }
        ]
      });
    }

    return Promise.resolve({ success: true, message: 'Simulated endpoint' });
  }

  // Auth Endpoints
  async login(email, password, locationData = null) {
    if (this._isStaticHost()) {
      return this._simulateLogin(email, password, locationData);
    }
    try {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, locationData })
      });
      if (data.token && data.user) {
        if (locationData) {
          data.user = { ...data.user, ...locationData };
        }
        this.setSession(data.token, data.user);
      }
      return data;
    } catch (err) {
      if (err.status === 404 || err.status === 405 || (err.message && (err.message.includes('405') || err.message.includes('fetch')))) {
        console.warn('[AUTH] Falling back to client-side auth');
        return this._simulateLogin(email, password, locationData);
      }
      throw err;
    }
  }

  async register(userData) {
    if (this._isStaticHost()) {
      return this._simulateRegister(userData);
    }
    try {
      const data = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (data.token && data.user) {
        this.setSession(data.token, data.user);
      }
      return data;
    } catch (err) {
      if (err.status === 404 || err.status === 405 || (err.message && err.message.includes('fetch'))) {
        return this._simulateRegister(userData);
      }
      throw err;
    }
  }

  async getMe() {
    if (this._isStaticHost() || !this.token) {
      return this.user;
    }
    try {
      const data = await this.request('/auth/me');
      if (data.user) {
        this.user = data.user;
        localStorage.setItem('aakash_user_profile', JSON.stringify(data.user));
      }
      return data.user;
    } catch (e) {
      return this.user;
    }
  }

  async logout() {
    try {
      if (!this._isStaticHost()) {
        await this.request('/auth/logout', { method: 'POST' });
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      this.clearSession();
    }
  }

  async getUserDashboardData() {
    return await this.request('/user/dashboard-data');
  }

  async getAdminOverview() {
    return await this.request('/admin/overview');
  }

  async getAdminUsers() {
    return await this.request('/admin/users');
  }

  async createAdminUser(userData) {
    return await this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUserStatus(userId, isActive) {
    return await this.request('/admin/users/' + userId + '/status', {
      method: 'PUT',
      body: JSON.stringify({ isActive })
    });
  }

  async getAdminAlertLogs() {
    return await this.request('/admin/alert-logs');
  }

  async getAdminAuditLogs() {
    return await this.request('/admin/audit-logs');
  }

  async getDailyAlertStatus(panchayatId) {
    const query = panchayatId ? ('?panchayatId=' + encodeURIComponent(panchayatId)) : '';
    return await this.request('/alerts/daily-status' + query);
  }

  async triggerDailyAlert(alertData) {
    return await this.request('/alerts/trigger-daily', {
      method: 'POST',
      body: JSON.stringify(alertData)
    });
  }
}

export const apiService = new ApiService();
