import React from 'react';
import { CloudRain, Mic, Bell, Cpu, Globe, PhoneCall, LogIn, LogOut, User, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { LANGUAGES } from '../data/translations';
import { getAssetUrl } from '../utils/assetHelper';

export default function Navbar({
  currentLang,
  onLanguageChange,
  onOpenLanguageModal,
  t,
  onOpenVoice,
  onOpenAlerts,
  judgeMode,
  onToggleJudgeMode,
  currentUser,
  onOpenLogin,
  onLogout,
  isAdminView,
  onToggleAdminView
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-emerald-100 shadow-xs">
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 w-full" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img 
              src={getAssetUrl('/assets/images/aakash-crest.svg')} 
              alt="Aakash AI" 
              className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md hover:scale-105 transition-transform cursor-pointer" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                  <span className="text-gradient-emerald">Aakash AI</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-400">ఆకాశ్ AI</span>
                </span>
                {currentUser?.role === 'admin' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold border border-purple-200">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                {t.slogan}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* If Admin: Toggle between Admin Dashboard & Village View */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onToggleAdminView}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  isAdminView
                    ? 'bg-purple-900 text-purple-100 border-purple-700 shadow-inner'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                }`}
                title="Toggle Admin Command Center vs Village View"
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">{isAdminView ? 'Village View' : 'Command Center'}</span>
                <span className="sm:hidden">{isAdminView ? 'Village' : 'Admin'}</span>
              </button>
            )}

            {/* Quick 1-Click Vernacular Language Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-800 border border-slate-200 hover:border-emerald-300 rounded-xl px-2.5 py-1.5 transition-all shadow-sm">
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-black text-slate-800 hover:text-emerald-800 focus:outline-none cursor-pointer pr-1"
                aria-label="Select Display Language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white text-slate-900 font-bold py-1">
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Modal Trigger Button */}
            <button
              onClick={onOpenLanguageModal}
              className="hidden lg:flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all"
              title="Open full audio language dialog"
            >
              <span>{t.more || 'More...'}</span>
            </button>

            {/* Voice Assistant Button */}
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/25 transition-all active:scale-95"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">{t.voiceAssistantBtn}</span>
              <span className="sm:hidden">Voice</span>
            </button>

            {/* User Profile / Login & Logout */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-slate-200">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                    {currentUser.username}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {currentUser.role === 'admin' ? 'Chief Meteorologist' : (currentUser.assignedPanchayatName || 'Farmer')}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all"
                  title="Sign out of your session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20 transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
