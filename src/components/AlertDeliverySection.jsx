import React from 'react';
import { BellRing, ShieldAlert, Cpu, MessageSquare, PhoneCall, Smartphone, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function AlertDeliverySection({
  selectedPanchayat,
  currentLang = 'en',
  onTriggerCall,
  onOpenAlertSimulator,
  t
}) {
  const isTelugu = currentLang === 'te';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-800 mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                {t.pipelineTitle || "Alert Delivery Architecture & Multi-Channel Dispatch"}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {t.autonomousBadge || "Autonomous"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.pipelineSubtitle || "When localized telemetry crosses hazard thresholds, the autonomous multi-channel delivery pipeline triggers automated voice calls (IVR), actionable SMS, and app push notifications:"}
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerCall}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{t.testDispatchCallBtn || "Test Dispatch Call"}</span>
        </button>
      </div>

      {/* 3-Stage Alert Delivery Flow */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Step 1: AI Risk Detection */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-2 relative">
          <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs border border-rose-500/30">
            1
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-rose-400" />
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {t.step1Title || "1. AI Risk Detection"}
            </h4>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            {t.step1Desc || "Continuous spatial telemetry sentinel detects flash precipitation (>35mm), root saturation (>85%), or heat stress (>38.5°C)."}
          </p>
          <div className="text-[10px] text-rose-300 font-mono bg-rose-950/60 p-1.5 rounded border border-rose-900/60">
            {t.alertThresholdBadge || "Threshold: Severe Waterlogging / Heatwave"}
          </div>
        </div>

        {/* Step 2: Vernacular Alert Generation */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-2 relative">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-500/30">
            2
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {t.step2Title || "2. Alert Generation"}
            </h4>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            {t.step2Desc || "Generates localized, actionable voice & SMS scripts in the farmer's registered language with micro-drainage instructions."}
          </p>
          <div className="text-[10px] text-amber-300 font-mono bg-amber-950/60 p-1.5 rounded border border-amber-900/60">
            {t.eightLangVoiceBadge || "8 Indian Languages • Native TTS Speech"}
          </div>
        </div>

        {/* Step 3: Multi-Channel Dispatch */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-emerald-500/40 space-y-2 relative shadow-lg shadow-emerald-950/40">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
            3
          </div>
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {t.step3Title || "3. Multi-Channel Dispatch"}
            </h4>
          </div>
          
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-700">
              <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                {t.step3Voice || "Automated Voice Call (IVR)"}
              </span>
              <span className="text-[10px] text-emerald-300 font-bold font-mono">{t.immediateBadge || "Immediate"}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-700">
              <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                {t.step3Sms || "Actionable Vernacular SMS"}
              </span>
              <span className="text-[10px] text-blue-300 font-bold font-mono">&lt; 15s</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-700">
              <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                {t.step3Push || "PWA App Push Notification"}
              </span>
              <span className="text-[10px] text-purple-300 font-bold font-mono">{t.realTimeBadge || "Real-Time"}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
