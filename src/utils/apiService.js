const API_BASE = '/api';

class ApiService {
  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('aakash_jwt_token') : null;
    this.user = typeof window !== 'undefined' ? this._loadSavedUser() : null;
  }

  _loadSavedUser() {
    try {
      const saved = localStorage.getItem('aakash_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
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

  async request(endpoint, options = {}) {
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
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = { message: await response.text() };
      }

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('[AUTH] Session token expired or invalid');
          this.clearSession();
        }

        const error = new Error(responseData?.error || responseData?.message || ('Request failed with status ' + response.status));
        error.status = response.status;
        error.data = responseData;
        throw error;
      }

      return responseData;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        console.warn('[API] Backend connection unavailable, checking fallback');
        const netError = new Error('Cannot connect to Aakash AI backend server. Please ensure the server is running on port 5000.');
        netError.status = 503;
        throw netError;
      }
      throw err;
    }
  }

  // Auth Endpoints
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token && data.user) {
      this.setSession(data.token, data.user);
    }
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.token && data.user) {
      this.setSession(data.token, data.user);
    }
    return data;
  }

  async getMe() {
    const data = await this.request('/auth/me');
    if (data.user) {
      this.user = data.user;
      localStorage.setItem('aakash_user_profile', JSON.stringify(data.user));
    }
    return data.user;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      this.clearSession();
    }
  }

  // User Dashboard
  async getUserDashboardData() {
    return await this.request('/user/dashboard-data');
  }

  // Admin Endpoints
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

  // Daily Alert Enforcement
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
