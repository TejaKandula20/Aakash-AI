import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneCall, PhoneOff, AlertTriangle, Volume2, RotateCcw, ShieldAlert, Sparkles, X, MessageSquare, CheckCircle } from 'lucide-react';
import { ALERT_PRESETS, getLocalizedAlert } from '../data/alertPresets';
import { ringtoneService } from '../utils/ringtoneService';
import { speechService } from '../utils/speechService';
import { LANGUAGES } from '../data/translations';

export default function IncomingCallHUD({
  isOpen,
  onClose,
  selectedPanchayat,
  currentLang = 'en',
  alertId = 'waterlogging',
  onOpenAlertSimulator
}) {
  const [callState, setCallState] = useState('ringing'); // 'ringing' | 'connected'
  const [seconds, setSeconds] = useState(0);
  const [autoAnswerCount, setAutoAnswerCount] = useState(6);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const autoTimerRef = useRef(null);

  const activeAlert = ALERT_PRESETS.find(a => a.id === alertId) || ALERT_PRESETS[0];
  const langObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  const localized = getLocalizedAlert(activeAlert, currentLang);
  const callScript = localized.callScript;
  const isTelugu = currentLang === 'te';

  // Manage Ringtone and Auto-countdown on mount / open
  useEffect(() => {
    if (!isOpen) {
      ringtoneService.stopRing();
      speechService.stop();
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      return;
    }

    setCallState('ringing');
    setSeconds(0);
    setAutoAnswerCount(6);
    ringtoneService.startRing();

    // Auto-countdown timer
    autoTimerRef.current = setInterval(() => {
      setAutoAnswerCount(prev => {
        if (prev <= 1) {
          clearInterval(autoTimerRef.current);
          handleAnswerCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      ringtoneService.stopRing();
      speechService.stop();
    };
  }, [isOpen, alertId]);

  // Connected call duration timer
  useEffect(() => {
    let interval = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  if (!isOpen) return null;

  const handleAnswerCall = () => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    ringtoneService.stopRing();
    setCallState('connected');
    setIsSpeaking(true);

    speechService.speak(
      callScript,
      langObj.speechLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const handleDeclineCall = () => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    ringtoneService.stopRing();
    speechService.stop();
    setIsSpeaking(false);
    onClose();
  };

  const handleReplayVoice = () => {
    speechService.stop();
    setIsSpeaking(true);
    speechService.speak(
      callScript,
      langObj.speechLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-2xl border border-slate-700/80 w-full max-w-lg overflow-hidden relative">
        
        {/* Top Hazard Alert Badge */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-4 py-2.5 flex items-center justify-between text-white text-xs font-black uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <ShieldAlert className="w-4 h-4" />
            <span>
              {isTelugu ? "అత్యవసర వాతావరణ హెచ్చరిక కాల్" : "CRITICAL AGRO-WEATHER EMERGENCY CALL"}
            </span>
          </div>
          <button 
            onClick={handleDeclineCall}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Incoming Call Header */}
        <div className="p-6 text-center">
          
          {/* Avatar / Phone Icon Animation */}
          <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
            {callState === 'ringing' ? (
              <>
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                <div className="absolute -inset-2 rounded-full bg-red-500/20 animate-pulse"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 border-2 border-white/20 animate-bounce">
                  <PhoneCall className="w-10 h-10 text-white animate-pulse" />
                </div>
              </>
            ) : (
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/30 border-2 border-emerald-300">
                <Volume2 className={`w-10 h-10 text-white ${isSpeaking ? 'animate-pulse' : ''}`} />
              </div>
            )}
          </div>

          {/* Caller Identity */}
          <div className="space-y-1 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>
                {isTelugu ? "ఆకాశ్ AI స్వయంచాలక వ్యవస్థ" : "Aakash AI Autonomous IVR Sentinel"}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isTelugu ? "ఆకాశ్ AI గ్రామ అత్యవసర విభాగం" : "Aakash AI Gram Emergency Weather Cell"}
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {selectedPanchayat.localName ? selectedPanchayat.localName : selectedPanchayat.name} ({selectedPanchayat.district})
            </p>
            <p className="text-[11px] text-emerald-400 font-mono">
              IMD Automated Vernacular Broadcast • Toll-Free 1800-AAKASH
            </p>
          </div>

          {/* Hazard Description Banner */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-left mb-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{localized.title}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {localized.triggerCondition}
            </p>
          </div>

          {/* Call Status & Countdown */}
          {callState === 'ringing' ? (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>
                  {isTelugu ? "ఇన్‌కమింగ్ కాల్ రింగ్ అవుతోంది..." : "Incoming Emergency Call Ringing..."}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isTelugu 
                  ? `స్వయంచాలకంగా ${autoAnswerCount} సెకన్లలో ఎత్తబడుతుంది (లేదా క్రింద బటన్ నొక్కండి)` 
                  : `Auto-connecting in ${autoAnswerCount}s (or tap Answer Call now)`}
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-mono text-sm font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{formatTimer(seconds)}</span>
                <span className="text-slate-400 font-sans text-xs">• {langObj.nativeName} Speech Active</span>
              </div>

              {/* Audio Waveform visualization */}
              <div className="flex items-center justify-center gap-1 my-3 h-6">
                {[12, 24, 16, 28, 20, 10, 26, 18, 32, 14, 22].map((height, i) => (
                  <span
                    key={i}
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-300"
                    style={{
                      height: isSpeaking ? `${height}px` : '4px',
                      opacity: isSpeaking ? 0.9 : 0.4
                    }}
                  ></span>
                ))}
              </div>

              {/* Live Voice Speech Transcript for farmers */}
              <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-3 text-left max-h-36 overflow-y-auto">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase mb-1">
                  <Volume2 className="w-3 h-3" />
                  <span>{isTelugu ? "కాల్ లో చదువుతున్న సమాచారం (స్పీచ్)" : "Live Audio Advisory Script"}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {callScript}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {callState === 'ringing' ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Red Decline Button */}
                <button
                  onClick={handleDeclineCall}
                  className="w-full py-4 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>{isTelugu ? "కట్ చేయండి (Decline)" : "Decline Call"}</span>
                </button>

                {/* Green Answer Call Button */}
                <button
                  onClick={handleAnswerCall}
                  className="w-full py-4 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-400/40 animate-pulse transition-all active:scale-95"
                >
                  <Phone className="w-5 h-5" />
                  <span>{isTelugu ? "కాల్ ఎత్తండి (Answer)" : "Answer Call"}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-3">
                  {/* Replay Voice */}
                  <button
                    onClick={handleReplayVoice}
                    className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    <span>{isTelugu ? "మళ్ళీ వినండి" : "Replay Voice"}</span>
                  </button>

                  {/* Open SMS & Action Plan */}
                  {onOpenAlertSimulator && (
                    <button
                      onClick={() => {
                        handleDeclineCall();
                        onOpenAlertSimulator();
                      }}
                      className="py-3 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-500/30 transition-all active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{isTelugu ? "SMS & ప్రణాళిక" : "View SMS / Plan"}</span>
                    </button>
                  )}
                </div>

                {/* End Call Button */}
                <button
                  onClick={handleDeclineCall}
                  className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>{isTelugu ? "కాల్ ముగించండి (End Call)" : "End Call"}</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
