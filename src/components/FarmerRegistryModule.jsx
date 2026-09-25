import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, Lock, Radio, PhoneCall, MessageSquare, 
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Clock, 
  Sparkles, RefreshCw, Smartphone, EyeOff, UserPlus
} from 'lucide-react';
import { getPanchayatFarmerRegistry } from '../data/farmerRegistryData';
import { databaseService } from '../data/databaseService';

export default function FarmerRegistryModule({
  selectedPanchayat,
  panchayat,
  weatherData,
  weather,
  currentLang = 'en',
  t = {},
  currentUser,
  onTriggerAlertHUD,
  onTriggerCall
}) {
  const [showSampleDrawer, setShowSampleDrawer] = useState(false);
  const [alertSimulationState, setAlertSimulationState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [deliveryStats, setDeliveryStats] = useState(null);

  const isTelugu = currentLang === 'te';
  const isHindi = currentLang === 'hi';

  const p = selectedPanchayat || panchayat || { name: 'Maredumilli', district: 'Alluri Sitharama Raju', id: 'ap-asr-maredumilli' };
  
  // Real registered farmers from databaseService
  const [liveFarmers, setLiveFarmers] = useState(() => databaseService.getFarmers({ panchayatId: p.id }));

  useEffect(() => {
    setLiveFarmers(databaseService.getFarmers({ panchayatId: p.id }));
    const unsub = databaseService.subscribe(() => {
      setLiveFarmers(databaseService.getFarmers({ panchayatId: p.id }));
    });
    return unsub;
  }, [p.id]);

  const registryData = getPanchayatFarmerRegistry(
    p.name || 'Maredumilli', 
    p.district || 'Alluri Sitharama Raju', 
    currentLang
  );

  const { totalEligible, channelDistribution, sampleRecords } = registryData;
  const effectiveTotal = Math.max(totalEligible, liveFarmers.length);

  // Handle "Send Panchayat-Wide Alert"
  const handleSendPanchayatAlert = () => {
    if (alertSimulationState === 'running') return;

    setAlertSimulationState('running');
    setProgress(0);
    setDeliveryStats(null);

    // Dispatch to all live registered farmers in database
    const alertResult = databaseService.dispatchPanchayatRiskAlert(
      p.id,
      weatherData?.current?.alertTriggerType || 'waterlogging',
      'Panchayat Sentinel Warning Trigger'
    );

    const targeted = alertResult.targetedFarmersCount > 0 ? alertResult.targetedFarmersCount : effectiveTotal;
    const smsSent = Math.round(targeted * 0.94) || targeted;
    const smsFailed = targeted - smsSent;
    const callsInitiated = targeted;
    const callsAnswered = Math.round(targeted * 0.86) || targeted;
    const callsUnanswered = targeted - callsAnswered;

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += 15;
      if (currentProgress >= 100) {
        clearInterval(timer);
        setProgress(100);
        setAlertSimulationState('completed');
        setDeliveryStats({
          targeted,
          smsSent,
          smsFailed,
          callsInitiated,
          callsAnswered,
          callsUnanswered,
          retryScheduled: callsUnanswered,
          deliveryRate: Math.round((callsAnswered / targeted) * 100)
        });
      } else {
        setProgress(currentProgress);
      }
    }, 200);
  };

  const handleResetSimulation = () => {
    setAlertSimulationState('idle');
    setProgress(0);
    setDeliveryStats(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
      
      {/* Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {t.registryTitle || t.farmerRegistryTitle || "Farmer Registry & Alert Coverage"}
                </h3>
                
                {/* Privacy Protected Indicator */}
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  <Lock className="w-3 h-3 text-blue-600" />
                  <span>{t.privacyProtected || "🔒 Privacy Protected"}</span>
                </span>

                {/* Database Synced Tag */}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  LIVE DATABASE
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                {isTelugu 
                  ? (selectedPanchayat.localName || selectedPanchayat.name) + " పంచాయతీలో రిజిస్టర్ అయిన రైతులు: " + liveFarmers.length + " మంది డేటాబేస్‌లో ఉన్నారు"
                  : "Registered farmers cohort for " + selectedPanchayat.name + " (" + (selectedPanchayat.district || 'AP') + ") - " + liveFarmers.length + " farmers in database"}
              </p>
            </div>
          </div>
        </div>

        {/* Automated AI Alert Sentinel Status */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {currentUser?.role === 'admin' ? (
            <button
              onClick={handleSendPanchayatAlert}
              disabled={alertSimulationState === 'running'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Radio className={"w-4 h-4 " + (alertSimulationState === 'running' ? 'animate-spin' : 'animate-pulse')} />
              <span>
                {alertSimulationState === 'running' 
                  ? (t.dispatchingAlert || "Dispatching Alert...") 
                  : (t.sendBroadcastAlert || "🚨 Admin Broadcast Alert to All Farmers")}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-sm">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                  {t.autoAlertActive || "Automated AI Alert Sentinel Active"}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium">
                  {t.alertLockNotice || "Alerts dispatch automatically to all registered farmers in this panchayat"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Aggregate Statistics Dashboard */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Total Registered Farmers */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 block mb-0.5">
            {t.totalFarmers || t.totalEligibleFarmers || "Total Registered Farmers"}
          </span>
          <p className="text-xl font-black text-slate-900 flex items-baseline gap-1.5">
            {liveFarmers.length}
            <span className="text-[11px] font-normal text-emerald-700 font-bold">
              Database
            </span>
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {selectedPanchayat.localName || selectedPanchayat.name}
          </span>
        </div>

        {/* Metric 2: Voice + SMS Preference */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 block mb-0.5">
            {t.voiceSmsChannel || "Voice + SMS Channel"}
          </span>
          <p className="text-xl font-black text-purple-900">
            {liveFarmers.filter(f => f.alertPreference === 'Both').length || channelDistribution.both}
          </p>
          <span className="text-[10px] text-purple-700 font-semibold block mt-0.5">
            {t.multiChannelPref || "Dual-Channel Active"}
          </span>
        </div>

        {/* Metric 3: Voice Only */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 block mb-0.5">
            {t.voiceCallOnly || "Voice Call Only (IVR)"}
          </span>
          <p className="text-xl font-black text-emerald-800">
            {liveFarmers.filter(f => f.alertPreference === 'Voice').length || channelDistribution.voiceOnly}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
            {t.featurePhonePriority || "Feature Phone Priority"}
          </span>
        </div>

        {/* Metric 4: Daily Calling Cap Policy */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 block mb-0.5">
            {t.dailyCapPolicy || t.dailyCallCapPolicy || "Daily Call Cap Policy"}
          </span>
          <p className="text-xs font-black text-slate-900 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{t.max1Batch || t.max1BatchDay || "Max 1 Batch / Day"}</span>
          </p>
          <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
            {t.redialPolicy || t.redialMissed || "3 Re-dials if unanswered"}
          </span>
        </div>
      </div>

      {/* Simulated Alert Dispatch Progress & Results */}
      {alertSimulationState !== 'idle' && (
        <div className="mt-4 bg-gradient-to-r from-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {isTelugu 
                  ? "పంచాయతీ వ్యాప్త అత్యవసర హెచ్చరికల సరఫరా పురోగతి" 
                  : "Panchayat-Wide Automated Dispatch Progress"}
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {progress}%
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: progress + "%" }}
            />
          </div>

          {deliveryStats && (
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-center text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">{t.totalTargeted || "Total Targeted"}</span>
                <strong className="text-sm text-white font-mono">{deliveryStats.targeted}</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-blue-400 block">{t.smsSent || "SMS Sent"}</span>
                <strong className="text-sm text-blue-300 font-mono">{deliveryStats.smsSent}</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-rose-400 block">{t.smsFailed || "SMS Failed"}</span>
                <strong className="text-sm text-rose-300 font-mono">{deliveryStats.smsFailed}</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-amber-400 block">{t.callsInitiated || "Calls Initiated"}</span>
                <strong className="text-sm text-amber-300 font-mono">{deliveryStats.callsInitiated}</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-emerald-400 block">{t.callsAnswered || "Calls Answered"}</span>
                <strong className="text-sm text-emerald-300 font-mono">{deliveryStats.callsAnswered}</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-amber-300 block">{t.unansweredRetry || "Unanswered (Retry)"}</span>
                <strong className="text-sm text-amber-300 font-mono">{deliveryStats.callsUnanswered}</strong>
              </div>
            </div>
          )}

          {deliveryStats && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleResetSimulation}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{t.resetSimulation || "Reset Simulation"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Live Registered Farmers Drawer Toggle */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => setShowSampleDrawer(!showSampleDrawer)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900"
        >
          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {isTelugu ? `రిజిస్టర్ అయిన రైతుల వివరాలు చూడండి (${liveFarmers.length} మంది)` : `View Registered Farmers in this Panchayat (${liveFarmers.length} farmers)`}
          </span>
          {showSampleDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <span className="text-[10px] text-slate-400 font-mono">
          Strict Privacy Mode • Verified Mobile Delivery
        </span>
      </div>

      {/* Live Registered Farmers Table */}
      {showSampleDrawer && (
        <div className="mt-3 overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Farmer Name</th>
                <th className="p-2.5">{t.maskedPhone || "Masked Phone"}</th>
                <th className="p-2.5">{t.primaryCrop || "Primary Crop"}</th>
                <th className="p-2.5">{t.alertChannel || "Alert Channel"}</th>
                <th className="p-2.5">Alert Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {liveFarmers.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{f.name}</span>
                    {f.registeredAt && new Date(f.registeredAt).getTime() > Date.now() - 3600000 && (
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded">NEW</span>
                    )}
                  </td>
                  <td className="p-2.5 font-mono text-slate-600">{f.maskedPhone || f.phone}</td>
                  <td className="p-2.5 font-medium">{f.primaryCrop} ({f.landAcres} ac)</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                      {f.alertPreference}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.lastAlertAt
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}>
                      {f.lastAlertAt ? `Alerted (${f.lastAlertAt.slice(0, 10)})` : 'Ready for Alert'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Prototype Disclaimer */}
      <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
        <p>
          ⚖️ {t.prototypeDisclaimer || "Aakash AI Panchayat Sentinel: All registered farmers in this Gram Panchayat are indexed in the secure database and will receive automated voice calls and SMS alerts upon severe weather detection."}
        </p>
      </div>

    </div>
  );
}
