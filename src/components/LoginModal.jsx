import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Mail, ArrowRight, Sparkles, AlertCircle, CheckCircle2, Loader2, Wheat, UserCheck, ShieldAlert } from 'lucide-react';
import { apiService } from '../utils/apiService';

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  currentLang = 'en'
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [assignedPanchayatId, setAssignedPanchayatId] = useState('maredumilli');
  const [assignedPanchayatName, setAssignedPanchayatName] = useState('Maredumilli');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.login(email, password);
      setSuccessMsg(`Welcome, ${res.user.username}! Redirecting to ${res.user.role === 'admin' ? 'Admin Command Center' : 'Farmer Dashboard'}...`);
      setTimeout(() => {
        onLoginSuccess(res.user);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password || !username) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.register({
        email,
        password,
        username,
        role: selectedRole,
        assignedPanchayatId,
        assignedPanchayatName: assignedPanchayatId === 'araku' ? 'Araku Valley' : 'Maredumilli',
        assignedDistrict: 'Alluri Sitharama Raju',
        assignedMandal: assignedPanchayatId === 'araku' ? 'Araku Valley' : 'Maredumilli',
        phoneNumber: '+91 98480 •••••',
        preferredLanguage: 'te'
      });
      setSuccessMsg(`Account created! Welcome, ${res.user.username}!`);
      setTimeout(() => {
        onLoginSuccess(res.user);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setError(null);

    try {
      const res = await apiService.login(demoEmail, demoPassword);
      setSuccessMsg(`Authenticated as ${res.user.role.toUpperCase()}: ${res.user.username}`);
      setTimeout(() => {
        onLoginSuccess(res.user);
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-5 sm:p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Aakash AI Portal
          </h2>
          <p className="text-xs text-emerald-200 mt-1">
            Gram Panchayat Agro-Meteorological Sentinel & Role-Based Access
          </p>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
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
          <div className="bg-emerald-50/70 rounded-2xl p-3 sm:p-4 border border-emerald-200">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Evaluator Logins (One-Tap):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
    type="button"
    onClick={() => handleDemoLogin('msuchitra954@gmail.com', 'suchitra@9999')}
    disabled={loading}
    className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-sm text-left transition-all group"
  >
    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
      <Wheat className="w-4 h-4" />
    </div>
    <div>
      <div className="text-[11px] font-black text-slate-900 leading-tight">User: suchitra</div>
      <div className="text-[10px] text-slate-500 font-mono">msuchitra954@gmail.com</div>
    </div>
  </button>

  <button
    type="button"
    onClick={() => handleDemoLogin('kandulatejachowdary@gmail.com', 'teja@9999')}
    disabled={loading}
    className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:shadow-sm text-left transition-all group"
  >
    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 shrink-0 group-hover:scale-105 transition-transform">
      <ShieldAlert className="w-4 h-4" />
    </div>
    <div>
      <div className="text-[11px] font-black text-slate-900 leading-tight">Admin: tejakandula</div>
      <div className="text-[10px] text-slate-500 font-mono">kandulatejachowdary@gmail.com</div>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name / Farmer Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g., V. Ramana Murthy"
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
      value={email}
      onChange={(e) => setEmail(e.target.value)}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Panchayat</label>
                  <select
                    value={assignedPanchayatId}
                    onChange={(e) => setAssignedPanchayatId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="maredumilli">Maredumilli (Alluri S.R.)</option>
                    <option value="araku">Araku Valley (Alluri S.R.)</option>
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
                  <span>{isRegister ? 'Complete Registration & Sign In' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 p-3 sm:p-4 text-center border-t border-slate-100 text-[11px] text-slate-500">
          <span>Protected with cryptographic token verification & once-per-day emergency call sentinel</span>
        </div>

      </div>
    </div>
  );
}
