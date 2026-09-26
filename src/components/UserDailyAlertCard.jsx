import React from 'react';
import { PhoneCall, CheckCircle, AlertTriangle, ShieldCheck, Clock, Volume2 } from 'lucide-react';

export default function UserDailyAlertCard({
  panchayatName,
  todayDate,
  dailyAlertStatus,
  onOpenCallHUD,
  onTestAutomatedAlert,
  registeredPhone,
  currentLang = 'en',
  t = {}
}) {
  const isCompleted = dailyAlertStatus?.alreadyExecutedToday;
  const record = dailyAlertStatus?.record;

  return (
    <div className="agro-glass rounded-3xl p-5 sm:p-6 border border-emerald-100/90 shadow-md mb-6 relative overflow-hidden">
      <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            isCompleted 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {isCompleted ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <PhoneCall className="w-6 h-6 text-amber-600" />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {t.dailyAlertSentinel || 'Daily Emergency Alert Sentinel'}
              </span>
              <span className="text-[10px] font-bold text-slate-500 font-mono">
                {todayDate} (IST)
              </span>
              {registeredPhone && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  📱 {registeredPhone}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {isCompleted
                ? (t.dailyAlertCompleted || "Today's Emergency Advisory Call Completed")
                : (t.noDailyAlertYet || 'No Emergency Call Dispatched Today')}
            </h3>

            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              {isCompleted
                ? `${record?.panchayat_name || panchayatName} - ${t.callDispatchedDesc || 'Dispatched earlier today. Capped at once per day.'}`
                : (t.callPendingDesc || 'If localized weather triggers a hazard threshold (>35mm rain, >85% soil saturation), an autonomous alert call will be dispatched.')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
          {onTestAutomatedAlert && (
            <button
              onClick={onTestAutomatedAlert}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/30 transition-all active:scale-95 animate-pulse"
              title="Test real automated emergency alert (Phone Call, SMS & Device Notification)"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{currentLang === 'te' ? '⚡ కాల్ & SMS టెస్ట్ చేయండి' : '⚡ Test Alert (Call & SMS)'}</span>
            </button>
          )}

          <button
            onClick={onOpenCallHUD}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition-all active:scale-95"
            title="Preview phone call audio and transcript"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t.previewCallAudio || 'Preview Call Audio'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
