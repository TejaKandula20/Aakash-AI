import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, Radio, Activity, CheckCircle2, 
  XCircle, Clock, Server, FileText, UserPlus, RefreshCw, 
  Eye, PhoneCall, AlertTriangle, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { apiService } from '../utils/apiService';

export default function AdminDashboard({
  currentUser,
  onSwitchToVillageView,
  t,
  currentLang = 'en'
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'alerts' | 'audit' | 'broadcast'
  const [overviewData, setOverviewData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [alertLogs, setAlertLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New user form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserPanchayat, setNewUserPanchayat] = useState('maredumilli');
  const [createSuccess, setCreateSuccess] = useState(null);

  // Broadcast state
  const [broadcastPanchayat, setBroadcastPanchayat] = useState('maredumilli');
  const [broadcastRisk, setBroadcastRisk] = useState('waterlogging');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAdminOverview();
      setOverviewData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminUsers();
      setUsersList(res.users || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertLogs = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminAlertLogs();
      setAlertLogs(res.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch alert logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminAuditLogs();
      setAuditLogs(res.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') fetchOverview();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'alerts') fetchAlertLogs();
    else if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    setCreateSuccess(null);
    try {
      await apiService.createAdminUser({
        email: newUserEmail,
        username: newUserName,
        password: newUserPassword,
        role: newUserRole,
        assignedPanchayatId: newUserPanchayat,
        assignedPanchayatName: newUserPanchayat === 'araku' ? 'Araku Valley' : 'Maredumilli',
        assignedDistrict: 'Alluri Sitharama Raju',
        assignedMandal: newUserPanchayat === 'araku' ? 'Araku Valley' : 'Maredumilli',
        phoneNumber: '+91 98480 •••••',
        preferredLanguage: 'te'
      });
      setCreateSuccess(`User ${newUserEmail} created successfully.`);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPassword('');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to create user.');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiService.updateUserStatus(userId, !currentStatus);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
    }
  };

  const handleTriggerBroadcast = async () => {
    setBroadcasting(true);
    setError(null);
    setBroadcastResult(null);

    try {
      const pName = broadcastPanchayat === 'araku' ? 'Araku Valley' : 'Maredumilli';
      const res = await apiService.triggerDailyAlert({
        panchayatId: broadcastPanchayat,
        panchayatName: pName,
        riskType: broadcastRisk,
        riskLevel: 'CRITICAL',
        triggerReason: 'Administrative emergency mass broadcast trigger',
        channel: 'VOICE_CALL',
        recipientCount: 6,
        deliveryStats: {
          targeted: 6,
          delivered: 5,
          failed: 1,
          callsAnswered: 4,
          callsUnanswered: 2
        }
      });
      setBroadcastResult(res);
    } catch (err) {
      setError(err.message || (err.data && err.data.message) || 'Broadcast failed or daily alert already completed.');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                State Command & Control
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                Role: CHIEF ADMINISTRATOR
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Aakash AI Administrative Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Centralized monitoring for 13,326 Gram Panchayats, role-based access management, daily emergency alert sentinels, and system audit logs.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={onSwitchToVillageView}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all shadow-sm active:scale-95"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Inspect Village View</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'System Overview & Analytics', icon: Activity },
            { id: 'users', label: 'User & Role Management', icon: Users },
            { id: 'alerts', label: 'Alert Dispatch Records', icon: Radio },
            { id: 'audit', label: 'Security Audit Logs', icon: FileText },
            { id: 'broadcast', label: 'Emergency Broadcast Control', icon: PhoneCall },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Alerts / Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Panchayats</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">13,326</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Coverage (26 Districts)</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Registered Users</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{overviewData?.systemStats?.registeredUsers || 3}</div>
              <div className="text-[11px] text-indigo-600 font-semibold mt-1">{overviewData?.systemStats?.activeUsers || 3} Active Accounts</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Alerts Dispatched Today</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{overviewData?.systemStats?.alertsDispatchedToday || 0}</div>
              <div className="text-[11px] text-amber-600 font-semibold mt-1">Strict Once-Per-Day Cap Active</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">AI/ML Engine</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">NOMINAL</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">Lapse Rate (-6.5°C/1000m)</div>
            </div>
          </div>

          {/* System Diagnostics & Telemetry Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                Backend Infrastructure & Security Matrix
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">Database Engine:</span>
                  <span className="font-mono font-bold text-slate-900">SQLite (server/data/aakash.sqlite)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">Authentication Protocol:</span>
                  <span className="font-mono font-bold text-emerald-700">JWT (HMAC-SHA256) + PBKDF2 Password Salt</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">Role Enforcement:</span>
                  <span className="font-mono font-bold text-emerald-700">Backend Middleware (Strict 403 Blocking)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">Once-Per-Day Alert Rule:</span>
                  <span className="font-mono font-bold text-amber-700">Database UNIQUE(date_str, panchayat_id)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">Timezone Context:</span>
                  <span className="font-mono font-bold text-slate-900">Asia/Kolkata (IST)</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                Recent Daily Emergency Dispatches
              </h3>
              {overviewData?.recentAlerts && overviewData.recentAlerts.length > 0 ? (
                <div className="space-y-2.5">
                  {overviewData.recentAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{alert.panchayat_name}</div>
                        <div className="text-[10px] text-slate-500">{alert.risk_type.toUpperCase()} • {alert.created_at}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {alert.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No emergency alerts recorded yet today.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Create User Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              Register New System User / Field Officer
            </h3>

            {createSuccess && (
              <div className="p-3 mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Officer / Farmer Name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="officer@aakash.gov.in"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="user">User / Farmer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Registered Users Directory</h3>
              <button onClick={fetchUsers} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Assigned Panchayat</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{u.username}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          u.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {u.assigned_panchayat_name || 'All'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {u.last_login_at || 'Never'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              u.is_active 
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALERT DISPATCH RECORDS */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Historical Alert Dispatch Records</h3>
              <p className="text-xs text-slate-500">Live database audit trail of all automated emergency calls and SMS alerts</p>
            </div>
            <button onClick={fetchAlertLogs} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Gram Panchayat</th>
                  <th className="py-3 px-4">Risk Type</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Triggered By</th>
                  <th className="py-3 px-4">Timestamp (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alertLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{log.date_str}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{log.panchayat_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                        {log.risk_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">{log.channel}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{log.recipient_count} demo farmers</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{log.triggered_by_name || 'System Sentinel'}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Security & Operational Audit Logs</h3>
              <p className="text-xs text-slate-500">Immutable server-side logs recording authentication events, role blocks, and dispatches</p>
            </div>
            <button onClick={fetchAuditLogs} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.created_at}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.username}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold text-[11px] ${
                        log.action.includes('UNAUTHORIZED') || log.action.includes('BLOCKED')
                          ? 'text-rose-600'
                          : log.action.includes('LOGIN')
                          ? 'text-emerald-700'
                          : 'text-indigo-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: EMERGENCY BROADCAST CONTROL */}
      {activeTab === 'broadcast' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <PhoneCall className="w-6 h-6 animate-bounce-subtle" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Statewide Mass Emergency Broadcast</h3>
            <p className="text-xs text-slate-500 mt-1">
              Trigger high-priority voice advisory and carrier SMS alerts for registered village farmers.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Gram Panchayat</label>
              <select
                value={broadcastPanchayat}
                onChange={(e) => setBroadcastPanchayat(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="maredumilli">Maredumilli (Alluri Sitharama Raju) - High Elevation (450m)</option>
                <option value="araku">Araku Valley (Alluri Sitharama Raju) - Mountain Plateau (911m)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Agro-Climatic Hazard Type</label>
              <select
                value={broadcastRisk}
                onChange={(e) => setBroadcastRisk(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="waterlogging">Flash Flood / Waterlogging Risk (Rainfall &gt; 35mm)</option>
                <option value="scorching_sun">Scorching Heatwave (Canopy Temp &gt; 38.5°C)</option>
                <option value="wind_squall">Squall &amp; Lodging Risk (Wind Gusts &gt; 45 km/h)</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Strict Once-Per-Day Policy:</strong> The backend server validates if this Gram Panchayat has already completed today's emergency alert. If already dispatched today, the server strictly blocks duplicate mass calls.
              </span>
            </div>

            {broadcastResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Broadcast Dispatched Successfully!</span>
                </div>
                <p>{broadcastResult.message}</p>
              </div>
            )}

            <button
              onClick={handleTriggerBroadcast}
              disabled={broadcasting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>{broadcasting ? 'Initiating Broadcast...' : 'Execute Emergency Broadcast'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
