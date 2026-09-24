import React from 'react';
import { PhoneCall, CheckCircle, AlertTriangle, ShieldCheck, Clock, Volume2 } from 'lucide-react';

export default function UserDailyAlertCard({
  panchayatName,
  todayDate,
  dailyAlertStatus,
  onOpenCallHUD,
  currentLang = 'en',
  t
}) {
  const isCompleted = dailyAlertStatus?.alreadyExecutedToday;
  const record = dailyAlertStatus?.record;
  const isTelugu = currentLang === 'te';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-6">
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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {isTelugu ? 'రోజువారీ అత్యవసర హెచ్చరిక రక్షణ' : 'Daily Emergency Alert Sentinel'}
              </span>
              <span className="text-[10px] font-bold text-slate-500 font-mono">
                {todayDate} (IST)
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {isCompleted
                ? (isTelugu ? 'ఈ రోజు అత్యవసర హెచ్చరిక కాల్ విజయవంతంగా పూర్తయింది' : "Today's Emergency Advisory Call Completed")
                : (isTelugu ? 'ఈ రోజు వాతావరణ హెచ్చరిక కాల్ ఇంకా జరగలేదు' : 'No Emergency Call Dispatched Today')}
            </h3>

            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              {isCompleted
                ? (isTelugu 
                    ? `${record?.panchayat_name || panchayatName} పంచాయతీకి ఈ రోజు కాల్ ${record?.created_at?.slice(11, 16) || 'ఉదయం'} గంటలకు రికార్డు అయింది. రోజుకు ఒకేసారి నిబంధన ప్రకారం మళ్లీ కాల్ రాదు.`
                    : `Dispatched at ${record?.created_at || 'earlier today'}. Strictly capped at once per day to prevent duplicate calling.`)
                : (isTelugu
                    ? 'మీ పంచాయతీలో తీవ్రమైన వరద లేదా వడగాల్పులు ఏర్పడితే ఆటోమేటిక్ కాల్ వెంటనే వస్తుంది.'
                    : 'If localized weather triggers a hazard threshold (>35mm rain, >85% soil saturation), an autonomous alert call will be dispatched.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={onOpenCallHUD}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition-all active:scale-95"
            title="Preview phone call audio and transcript"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isTelugu ? 'కాల్ ఆడియో వినండి' : 'Preview Call Audio'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
