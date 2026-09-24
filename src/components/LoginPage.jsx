import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Mail, ArrowRight, Sparkles, AlertCircle, CheckCircle2, Loader2, Wheat, ShieldAlert, Globe } from 'lucide-react';
import { apiService } from '../utils/apiService';
import { LANGUAGES } from '../data/translations';

export default function LoginPage({
  onLoginSuccess,
  currentLang = 'en',
  onLanguageChange
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [assignedPanchayatId, setAssignedPanchayatId] = useState('maredumilli');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your email or username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.login(identifier, password);
      setSuccessMsg(`Welcome, ${res.user.username}! Redirecting to ${res.user.role === 'admin' ? 'Admin Command Center' : 'Farmer Dashboard'}...`);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 600);
    } catch (err) {
      // Clean readable error without any raw HTML tags
      const msg = (err.message || '').replace(/<[^>]*>?/gm, '');
      setError(msg || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!identifier || !password || !username) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.register({
        email: identifier,
        password,
        username,
        role: selectedRole,
        assignedPanchayatId: assignedPanchayatId === 'maredumilli' ? 'ap-asr-maredumilli' : 'ap-asr-araku',
        assignedPanchayatName: assignedPanchayatId === 'maredumilli' ? 'Maredumilli' : 'Araku Valley',
        assignedDistrict: 'Alluri Sitharama Raju',
        assignedMandal: assignedPanchayatId === 'maredumilli' ? 'Maredumilli' : 'Araku Valley',
        phoneNumber: '+91 98480 •••••',
        preferredLanguage: currentLang
      });
      setSuccessMsg(`Account created! Welcome, ${res.user.username}!`);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 600);
    } catch (err) {
      const msg = (err.message || '').replace(/<[^>]*>?/gm, '');
      setError(msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (emailOrUser, pwd) => {
    setIdentifier(emailOrUser);
    setPassword(pwd);
    setLoading(true);
    setError(null);

    try {
      const res = await apiService.login(emailOrUser, pwd);
      setSuccessMsg(`Logged in as ${res.user.role.toUpperCase()}: ${res.user.username}`);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err) {
      const msg = (err.message || '').replace(/<[^>]*>?/gm, '');
      setError(msg || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-between p-4 sm:p-6 text-slate-100 font-sans">
      
      {/* Top Bar with Language Selector */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">Aakash AI</h1>
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Gram Panchayat Agro-Meteorology</p>
          </div>
        </div>

        {/* Language dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-700/60 shadow-sm text-xs">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <select
            value={currentLang}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        
        {/* Card Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Aakash AI Portal
          </h2>
          <p className="text-xs text-emerald-200 mt-1 font-medium">
            Gram Panchayat Agro-Meteorological Sentinel & Role-Based Access
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          
          {/* Tabs: Sign In vs Register */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                !isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register Farmer / Officer
            </button>
          </div>

          {/* Quick 1-Tap Demo Logins */}
          <div className="bg-emerald-50/80 rounded-2xl p-3.5 border border-emerald-200">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Evaluator Logins (One-Tap):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('msuchitra954@gmail.com', 'suchitra@9999')}
                disabled={loading}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-sm text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                  <Wheat className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-black text-slate-900 leading-tight">User: suchitra</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">msuchitra954@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('kandulatejachowdary@gmail.com', 'teja@9999')}
                disabled={loading}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:shadow-sm text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-black text-slate-900 leading-tight">Admin: tejakandula</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">kandulatejachowdary@gmail.com</div>
                </div>
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. V. Ramana Murthy"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address or Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="kandulatejachowdary@gmail.com or tejakandula"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {isRegister && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="user">Farmer (User)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned GP</label>
                  <select
                    value={assignedPanchayatId}
                    onChange={(e) => setAssignedPanchayatId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="maredumilli">Maredumilli</option>
                    <option value="araku">Araku Valley</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Register & Sign In' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          Protected with cryptographic token verification & once-per-day emergency call sentinel
        </div>

      </div>

      {/* Page Footer */}
      <div className="max-w-5xl w-full mx-auto text-center py-2 text-xs text-slate-400">
        Smart India Hackathon 2024 • Aakash AI Micro-Downscaling Prototype
      </div>

    </div>
  );
}
