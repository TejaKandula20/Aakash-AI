import React, { useState } from 'react';
import { 
  Users, ShieldCheck, Lock, Radio, PhoneCall, MessageSquare, 
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Clock, 
  Sparkles, RefreshCw, Smartphone, EyeOff
} from 'lucide-react';
import { getPanchayatFarmerRegistry } from '../data/farmerRegistryData';

export default function FarmerRegistryModule({
  selectedPanchayat,
  currentLang = 'en',
  t,
  onTriggerCall
}) {
  const [showSampleDrawer, setShowSampleDrawer] = useState(false);
  const [alertSimulationState, setAlertSimulationState] = useState('idle'); // 'idle' | 'running' | 'completed'
  const [progress, setProgress] = useState(0);
  const [deliveryStats, setDeliveryStats] = useState(null);

  const isTelugu = currentLang === 'te';
  const isHindi = currentLang === 'hi';

  const registryData = getPanchayatFarmerRegistry(
    selectedPanchayat.name, 
    selectedPanchayat.district || 'Guntur', 
    currentLang
  );

  const { totalEligible, channelDistribution, dailyPolicy, sampleRecords } = registryData;

  // Handle "Send Panchayat-Wide Alert" simulation
  const handleSendPanchayatAlert = () => {
    if (alertSimulationState === 'running') return;

    setAlertSimulationState('running');
    setProgress(0);
    setDeliveryStats(null);

    // Realistic delivery simulation counters
    const targeted = totalEligible;
    const smsSent = Math.round(targeted * 0.94);
    const smsFailed = targeted - smsSent;
    const callsInitiated = targeted;
    const callsAnswered = Math.round(targeted * 0.86);
    const callsUnanswered = targeted - callsAnswered;

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += 12;
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
    }, 280);
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
                  {isTelugu ? "రైతు నమోదు & సమాచార పరిధి" : isHindi ? "किसान कवरेज व संपर्क रजिस्ट्री" : "Farmer Registry & Alert Coverage"}
                </h3>
                
                {/* Privacy Protected Indicator */}
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  <Lock className="w-3 h-3 text-blue-600" />
                  <span>{isTelugu ? "🔒 గోప్యత రక్షితం (Privacy Protected)" : "🔒 Privacy Protected"}</span>
                </span>

                {/* Demo Data Tag */}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                  DEMO DATA
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                {isTelugu 
                  ? (selectedPanchayat.localName || selectedPanchayat.name) + " పంచాయతీలో రిజిస్టర్ అయిన నమూనా రైతుల సంఖ్య మరియు ముందస్తు హెచ్చరిక చానెళ్లు"
                  : "Connected demo farmer cohort for " + selectedPanchayat.name + " (" + (selectedPanchayat.district || 'AP') + ")"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Send Panchayat-Wide Alert */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleSendPanchayatAlert}
            disabled={alertSimulationState === 'running'}
            className={"flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"}
          >
            <Radio className={"w-4 h-4 " + (alertSimulationState === 'running' ? 'animate-spin' : 'animate-pulse')} />
            <span>
              {alertSimulationState === 'running' 
                ? (isTelugu ? "హెచ్చరికలు పంపుతోంది..." : "Dispatching Alert...") 
                : (isTelugu ? "🚨 పంచాయతీ వ్యాప్తంగా ముందస్తు హెచ్చరిక పంపండి" : "🚨 Send Panchayat-Wide Alert")}
            </span>
          </button>
        </div>
      </div>

      {/* Aggregate Statistics Dashboard */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Total Registered Demo Farmers */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 block mb-0.5">
            {isTelugu ? "మొత్తం నమోదైన రైతులు" : "Total Eligible Farmers"}
          </span>
          <p className="text-xl font-black text-slate-900 flex items-baseline gap-1.5">
            {totalEligible}
            <span className="text-[11px] font-normal text-emerald-700 font-bold">
              {isTelugu ? "రైతులు" : "Demo"}
            </span>
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {selectedPanchayat.localName || selectedPanchayat.name}
          </span>
        </div>

        {/* Metric 2: Voice + SMS Preference */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 block mb-0.5">
            {isTelugu ? "వాయిస్ + SMS రెండూ" : "Voice + SMS Channel"}
          </span>
          <p className="text-xl font-black text-purple-900">
            {channelDistribution.both}
          </p>
          <span className="text-[10px] text-purple-700 font-semibold block mt-0.5">
            65% {isTelugu ? "రైతుల ఎంపిక" : "Multi-Channel"}
          </span>
        </div>

        {/* Metric 3: Voice Only */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 block mb-0.5">
            {isTelugu ? "స్వయంచాలక వాయిస్ కాల్" : "Voice Call Only (IVR)"}
          </span>
          <p className="text-xl font-black text-emerald-800">
            {channelDistribution.voiceOnly}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
            {isTelugu ? "ఫీచర్ ఫోన్ రైతులు" : "Feature Phone Priority"}
          </span>
        </div>

        {/* Metric 4: Daily Calling Cap Policy */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 block mb-0.5">
            {isTelugu ? "రోజువారీ కాల్ పరిమితి" : "Daily Call Cap Policy"}
          </span>
          <p className="text-xs font-black text-slate-900 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{isTelugu ? "రోజుకు 1 సారి మాత్రమే" : "Max 1 Batch / Day"}</span>
          </p>
          <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
            {isTelugu ? "మిస్ అయితే 3 సార్లు పునః ప్రయత్నం" : "3 Re-dials if unanswered"}
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
                  : "Panchayat-Wide Automated Dispatch Progress (Demo Simulation)"}
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {progress}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: progress + "%" }}
            />
          </div>

          {/* Workflow Ribbon */}
          <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-1.5 pt-1">
            <span className="font-bold text-slate-300">{isTelugu ? "సరఫరా మార్గం:" : "Workflow:"}</span>
            <span>AI Risk Detection</span> →
            <span className="text-emerald-300 font-bold">{selectedPanchayat.name}</span> →
            <span>Protected Registry</span> →
            <span>Multi-Channel Dispatch</span> →
            <span className="text-amber-300 font-bold">Delivery Stats</span>
          </div>

          {/* Delivery Statistics Cards (when completed) */}
          {deliveryStats && (
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-center text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">{isTelugu ? "లక్ష్యం" : "Total Targeted"}</span>
                <strong className="text-sm text-white font-mono">{deliveryStats.targeted}</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-blue-400 block">{isTelugu ? "SMS పంపబడింది" : "SMS Sent"}</span>
                <strong className="text-sm text-blue-300 font-mono">{deliveryStats.smsSent}</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-rose-400 block">{isTelugu ? "SMS విఫలం" : "SMS Failed"}</span>
                <strong className="text-sm text-rose-300 font-mono">{deliveryStats.smsFailed}</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-amber-400 block">{isTelugu ? "కాల్స్ ప్రారంభం" : "Calls Initiated"}</span>
                <strong className="text-sm text-amber-300 font-mono">{deliveryStats.callsInitiated}</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-emerald-400 block">{isTelugu ? "కాల్ మాట్లాడారు" : "Calls Answered"}</span>
                <strong className="text-sm text-emerald-300 font-mono">{deliveryStats.callsAnswered}</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-amber-300 block">{isTelugu ? "మిస్డ్ కాల్స్ (రీ-డయల్)" : "Unanswered (Retry)"}</span>
                <strong className="text-sm text-amber-300 font-mono">{deliveryStats.callsUnanswered}</strong>
              </div>
            </div>
          )}

          {/* Reset / Done Button */}
          {deliveryStats && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleResetSimulation}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isTelugu ? "రీసెట్ చేయండి" : "Reset Simulation"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Privacy-Preserved Sample Drawer Toggle */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => setShowSampleDrawer(!showSampleDrawer)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {isTelugu ? "నమూనా రైతుల రికార్డులు (మాస్క్ చేయబడిన డేటా)" : "View Masked Sample Records (Zero-PII)"}
          </span>
          {showSampleDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <span className="text-[10px] text-slate-400 font-mono">
          Strict Privacy Mode • No Aadhaar Storage
        </span>
      </div>

      {/* Privacy-Preserved Sample Drawer Table */}
      {showSampleDrawer && (
        <div className="mt-3 overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Farmer ID</th>
                <th className="p-2.5">{isTelugu ? "పేరు (రక్షితం)" : "Masked Name"}</th>
                <th className="p-2.5">{isTelugu ? "ఫోన్ నంబర్" : "Masked Phone"}</th>
                <th className="p-2.5">{isTelugu ? "పంట" : "Primary Crop"}</th>
                <th className="p-2.5">{isTelugu ? "నోటిఫికేషన్ మార్గం" : "Alert Channel"}</th>
                <th className="p-2.5">{isTelugu ? "రోజువారీ పరిమితి" : "Daily Policy Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {sampleRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-mono font-bold text-slate-800">{rec.id}</td>
                  <td className="p-2.5 font-semibold text-slate-900">{rec.maskedName}</td>
                  <td className="p-2.5 font-mono text-slate-600">{rec.maskedPhone}</td>
                  <td className="p-2.5">{rec.primaryCrop}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                      {rec.alertPreference}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      {rec.dailyCapStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mandatory Prototype Disclaimer */}
      <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
        <p>
          ⚖️ <strong>{isTelugu ? "ప్రోటోటైప్ నిబంధన:" : "Prototype Notice:"}</strong> {isTelugu 
            ? "ఇది ప్రోటోటైప్ ప్రదర్శన కోసం రూపొందించిన నమూనా సమాచారం మాత్రమే. ఎటువంటి ఆధార్ లేదా ప్రభుత్వ డేటాబేస్ అనుసంధానించబడలేదు. వాస్తవ వ్యవస్థలో అమలు చేయడానికి అధీకృత అనుమతులు మరియు సమాచార సమ్మతి అవసరం."
            : "Sample data for prototype demonstration only. Production deployment would require authorized data access, applicable permissions, consent and approved communication services."}
        </p>
      </div>

    </div>
  );
}
