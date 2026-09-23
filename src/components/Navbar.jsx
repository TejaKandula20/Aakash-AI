import React from 'react';
import { CloudRain, Mic, Bell, Cpu, Globe, PhoneCall } from 'lucide-react';
import { LANGUAGES } from '../data/translations';

export default function Navbar({
  currentLang,
  onLanguageChange,
  onOpenLanguageModal,
  t,
  onOpenVoice,
  onOpenAlerts,
  judgeMode,
  onToggleJudgeMode
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <CloudRain className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {t.appTitle}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                {t.slogan}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Selector Button & Dropdown */}
            <button
              onClick={onOpenLanguageModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 transition-all shadow-sm"
              title="Click to change display language"
            >
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">{t.languageLabel || 'Language:'}</span>
              <span className="font-extrabold text-emerald-700">
                {LANGUAGES.find(l => l.code === currentLang)?.nativeName || 'English'}
              </span>
            </button>

            {/* Simulated Alerts Button */}
            <button
              onClick={onOpenAlerts}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-sm transition-all"
              title="Test Automated Calls & SMS"
            >
              <PhoneCall className="w-4 h-4 text-amber-600 animate-bounce-subtle" />
              <span className="hidden sm:inline">{t.emergencyAlerts || 'Auto Alerts (Call/SMS)'}</span>
              <span className="sm:hidden">{t.emergencyAlerts?.split(' ')?.[0] || 'Alerts'}</span>
            </button>

            {/* Multilingual Voice Assistant Button */}
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/25 transition-all active:scale-95"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>{t.voiceAssistantBtn}</span>
            </button>

            {/* SIH Judge Mode Toggle */}
            <button
              onClick={onToggleJudgeMode}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                judgeMode
                  ? 'bg-purple-900 text-purple-100 border-purple-700 shadow-inner'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
              }`}
              title="Toggle SIH Judge Technical View"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="hidden lg:inline">{judgeMode ? (t.dashboardMode || 'Dashboard View') : (t.judgeModeToggle || 'Judge Mode (ML Architecture)')}</span>
              <span className="lg:hidden">{judgeMode ? 'App' : 'ML'}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
