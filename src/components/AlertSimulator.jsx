import React, { useState, useEffect, useRef } from 'react';
import { PhoneCall, PhoneOff, MessageSquare, AlertTriangle, Droplets, Sun, Wind, BellRing, CheckCircle, ShieldAlert, Volume2, RotateCcw, X } from 'lucide-react';
import { ALERT_PRESETS, getLocalizedAlert } from '../data/alertPresets';
import { speechService } from '../utils/speechService';
import { ringtoneService } from '../utils/ringtoneService';
import { LANGUAGES } from '../data/translations';

export default function AlertSimulator({
  isOpen,
  onClose,
  selectedPanchayat,
  currentLang = 'en',
  initialAlertId = 'waterlogging',
  autoRinging = false,
  t
}) {
  const [selectedAlertId, setSelectedAlertId] = useState(initialAlertId);
  const [callState, setCallState] = useState(autoRinging ? 'ringing' : 'idle'); // 'idle' | 'ringing' | 'connected'
  const [callSeconds, setCallSeconds] = useState(0);
  const [showSms, setShowSms] = useState(true);
  const [autoAnswerCount, setAutoAnswerCount] = useState(4);
  const autoAnswerTimerRef = useRef(null);

  const activeAlert = ALERT_PRESETS.find(a => a.id === selectedAlertId) || ALERT_PRESETS[0];
  const langObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  const localizedActiveAlert = getLocalizedAlert(activeAlert, currentLang);

  const smsText = localizedActiveAlert.smsText;
  const callScript = localizedActiveAlert.callScript;

  // React to initialAlertId or autoRinging changes
  useEffect(() => {
    if (initialAlertId) {
      setSelectedAlertId(initialAlertId);
    }
    if (isOpen && autoRinging) {
      setCallState('ringing');
      ringtoneService.startRing();
      setAutoAnswerCount(4);
    }
  }, [isOpen, initialAlertId, autoRinging]);

  // Handle ringing state and auto-answer countdown
  useEffect(() => {
    if (callState === 'ringing') {
      ringtoneService.startRing();
      setAutoAnswerCount(4);

      autoAnswerTimerRef.current = setInterval(() => {
        setAutoAnswerCount((prev) => {
          if (prev <= 1) {
            clearInterval(autoAnswerTimerRef.current);
            answerCall();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (autoAnswerTimerRef.current) {
        clearInterval(autoAnswerTimerRef.current);
        autoAnswerTimerRef.current = null;
      }
      ringtoneService.stopRing();
    }

    return () => {
      if (autoAnswerTimerRef.current) {
        clearInterval(autoAnswerTimerRef.current);
      }
      ringtoneService.stopRing();
    };
  }, [callState]);

  // Call duration timer
  useEffect(() => {
    let interval = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallSeconds(s => s + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Clean up speech & ringtone on unmount/close
  useEffect(() => {
    return () => {
      ringtoneService.stopRing();
      speechService.stop();
    };
  }, []);

  if (!isOpen) return null;

  const triggerCall = () => {
    speechService.stop();
    setCallState('ringing');
  };

  const answerCall = () => {
    ringtoneService.stopRing();
    setCallState('connected');
    // Speak the emergency automated call script in the farmer's selected language
    speechService.speak(
      callScript,
      langObj.speechLang,
      null,
      () => {
        // Voice alert finished
      }
    );
  };

  const endCall = () => {
    ringtoneService.stopRing();
    speechService.stop();
    setCallState('idle');
  };

  const replayAudio = () => {
    speechService.stop();
    speechService.speak(
      callScript,
      langObj.speechLang,
      null,
      () => {}
    );
  };

  const formatCallTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-800 via-amber-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20">
              <BellRing className="w-5 h-5 text-amber-300 animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                {t.simulatorTitle || "Automated Agro-Disaster Alert Simulator"}
              </h3>
              <p className="text-xs text-amber-200">
                {t.simulatingFor || "Simulating Voice Calls (IVR) & Actionable SMS for"} <strong>{selectedPanchayat.localName || selectedPanchayat.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              endCall();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Step 1: Select Disaster Hazard Trigger */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              {t.selectTrigger || "1. Select Micro-Climate Hazard Trigger:"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ALERT_PRESETS.map((rawPreset) => {
                const preset = getLocalizedAlert(rawPreset, currentLang);
                const isSelected = preset.id === activeAlert.id;

                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      endCall();
                      setSelectedAlertId(preset.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-red-50 border-red-500 ring-2 ring-red-400 text-red-950 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{preset.icon}</span>
                      <h4 className="font-black text-xs sm:text-sm leading-snug">
                        {preset.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {preset.triggerCondition}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Interactive Simulation Grid (Phone Call vs SMS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Phone Call Simulator Box */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[380px]">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" /> {t.ivrCallTitle || "Automated IVR Voice Call"}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  {langObj.nativeName || langObj.name}
                </span>
              </div>

              {/* State: IDLE */}
              {callState === 'idle' && (
                <div className="my-auto text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 mx-auto flex items-center justify-center text-slate-400 shadow-inner">
                    <PhoneCall className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">
                      {{
                        te: 'రైతు ఫోన్‌కు వచ్చే అత్యవసర కాల్ పరీక్షించండి',
                        hi: 'किसान के फोन पर आने वाली आपातकालीन कॉल का परीक्षण करें',
                        ta: 'விவசாயியின் தொலைபேசிக்கு வரும் அவசர அழைப்பை சோதிக்கவும்',
                        kn: 'ರೈತರ ಫೋನ್‌ಗೆ ಬರುವ ತುರ್ತು ಕರೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ',
                        mr: 'शेतकऱ्यांच्या फोनवर येणाऱ्या आपत्कालीन कॉलची चाचणी घ्या',
                        pa: "ਕਿਸਾਨ ਦੇ ਫ਼ੋਨ 'ਤੇ ਆਉਣ ਵਾਲੀ ਐਮਰਜੈਂਸੀ ਕਾਲ ਦੀ ਜਾਂਚ ਕਰੋ",
                        bn: 'কৃষকের ফোনে আগত জরুরি কলটি পরীক্ষা করুন',
                        en: "Simulate Incoming Call on Farmer's Phone"
                      }[currentLang] || "Simulate Incoming Call on Farmer's Phone"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      {{
                        te: 'ఆకాశ్ AI ద్వారా సూక్ష్మ వాతావరణ ముప్పు ఏర్పడినప్పుడు రైతుకు వెంటనే వచ్చే స్వయంచాలక ఫోన్ కాల్ ఎలా ఉంటుందో పరీక్షించండి.',
                        hi: 'देखें कि मौसम का खतरा होने पर आकाश AI स्वचालित रूप से किसान को कैसे कॉल करता है।',
                        ta: 'ஆகாஷ் AI மூலம் அவசர வானிலை எச்சரிக்கை விவசாயிகளுக்கு எவ்வாறு தானியங்கி அழைப்பாக வருகிறது என்பதை சோதிக்கவும்.',
                        kn: 'ಹವಾಮಾನ ಅಪಾಯದ ಸಮಯದಲ್ಲಿ ಆಕಾಶ್ AI ರೈತರಿಗೆ ಹೇಗೆ ಸ್ವಯಂಚಾಲಿತ ಕರೆ ಮಾಡುತ್ತದೆ ಎಂಬುದನ್ನು ಪರೀಕ್ಷಿಸಿ.',
                        mr: 'हवामानाचा धोका निर्माण झाल्यावर आकाश AI शेतकऱ्यांना कसा स्वयंचलित कॉल करते ते पहा.',
                        pa: "ਵੇਖੋ ਕਿ ਮੌਸਮ ਦਾ ਖ਼ਤਰਾ ਹੋਣ 'ਤੇ ਆਕਾਸ਼ AI ਕਿਸ ਤਰ੍ਹਾਂ ਕਿਸਾਨ ਨੂੰ ਆਟੋਮੈਟਿਕ ਕਾਲ ਕਰਦਾ ਹੈ।",
                        bn: 'আবহাওয়ার ঝুঁকি দেখা দিলে আকাশ AI কীভাবে স্বয়ংক্রিয়ভাবে কৃষককে কল করে তা পরীক্ষা করুন।',
                        en: 'Click below to simulate how Aakash AI automatically calls the farmer when a downscaled flash threat is detected.'
                      }[currentLang] || 'Click below to simulate how Aakash AI automatically calls the farmer when a downscaled flash threat is detected.'}
                    </p>
                  </div>
                  <button
                    onClick={triggerCall}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                  >
                    {t.triggerCallNow || "📞 Trigger Automated Call Now"}
                  </button>
                </div>
              )}

              {/* State: RINGING */}
              {callState === 'ringing' && (
                <div className="my-auto text-center py-6 space-y-4 animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-red-950 border-4 border-red-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-red-500/40">
                    <BellRing className="w-10 h-10 text-red-400 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
                      {t.incomingCall || "Incoming Emergency Weather Call..."}
                    </span>
                    <h4 className="font-black text-lg text-white mt-1">
                      {t.callFrom || "Aakash AI Weather Cell"}
                    </h4>
                    <p className="text-xs text-slate-300">
                      {selectedPanchayat.localName || selectedPanchayat.name}
                    </p>
                  </div>

                  <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center justify-center gap-2 max-w-sm mx-auto">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                    <span>
                      {{
                        te: `ఆటో-కనెక్ట్ అవుతోంది: ${autoAnswerCount} సెకన్లలో (లేదా ఆన్సర్ నొక్కండి)`,
                        hi: `ऑटो-कनेक्ट हो रहा है: ${autoAnswerCount} सेकंड में (या उत्तर दें)`,
                        ta: `தானாக இணைகிறது: ${autoAnswerCount} விநாடிகளில் (அல்லது பதிலளிக்கவும்)`,
                        kn: `ಸ್ವಯಂ ಸಂಪರ್ಕಗೊಳ್ಳುತ್ತಿದೆ: ${autoAnswerCount} ಸೆಕೆಂಡುಗಳಲ್ಲಿ (ಅಥವಾ ಉತ್ತರಿಸಿ)`,
                        mr: `ऑटो-कनेक्ट होत आहे: ${autoAnswerCount} सेकंदात (किंवा उत्तर द्या)`,
                        pa: `ਆਟੋ-ਕਨੈਕਟ ਹੋ ਰਿਹਾ ਹੈ: ${autoAnswerCount} ਸਕਿੰਟਾਂ ਵਿੱਚ (ਜਾਂ ਜਵਾਬ ਦਿਓ)`,
                        bn: `স্বয়ংক্রিয় সংযোগ হচ্ছে: ${autoAnswerCount} সেকেন্ডে (বা উত্তর দিন)`,
                        en: `Auto-connecting in ${autoAnswerCount}s (Autonomous Hands-Free IVR)`
                      }[currentLang] || `Auto-connecting in ${autoAnswerCount}s`}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-8 pt-4">
                    <button
                      onClick={endCall}
                      className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-all"
                      title={t.declineCall || "Decline"}
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>
                    <button
                      onClick={answerCall}
                      className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-400 animate-bounce transition-all"
                      title={t.answerCall || "Answer Call"}
                    >
                      <PhoneCall className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}

              {/* State: CONNECTED */}
              {callState === 'connected' && (
                <div className="my-auto space-y-4 py-3">
                  <div className="text-center">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                      {t.callConnected || "Call Connected"} • {formatCallTime(callSeconds)}
                    </span>
                    <h4 className="font-bold text-sm text-slate-200 mt-2">
                      {t.speakingVoiceAlert || "Speaking Voice Alert in"} {langObj.nativeName || langObj.name}
                    </h4>
                  </div>

                  {/* Audio Wave */}
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center justify-center gap-1.5 h-10">
                    <span className="w-1 bg-emerald-400 animate-pulse h-4"></span>
                    <span className="w-1 bg-emerald-400 animate-pulse h-7 delay-75"></span>
                    <span className="w-1 bg-emerald-400 animate-pulse h-5 delay-150"></span>
                    <span className="w-1 bg-emerald-400 animate-pulse h-8 delay-100"></span>
                    <span className="w-1 bg-emerald-400 animate-pulse h-6 delay-200"></span>
                    <span className="w-1 bg-emerald-400 animate-pulse h-3 delay-300"></span>
                    <span className="w-1 bg-emerald-400 animate-pulse h-8 delay-75"></span>
                  </div>

                  {/* Call Transcript */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 max-h-36 overflow-y-auto text-xs text-emerald-200 leading-relaxed">
                    <strong className="text-white block text-[10px] uppercase tracking-wide mb-1">
                      {t.liveTranscript || "Live Voice Audio Transcript:"}
                    </strong>
                    "{callScript}"
                  </div>

                  <div className="flex justify-center items-center gap-3 pt-2">
                    <button
                      onClick={replayAudio}
                      className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {{
                        te: 'మళ్లీ వినండి',
                        hi: 'पुनः सुनें',
                        ta: 'மீண்டும் கேட்க',
                        kn: 'ಮತ್ತೆ ಕೇಳಿ',
                        mr: 'पुन्हा ऐका',
                        pa: 'ਦੁਬਾਰਾ ਸੁਣੋ',
                        bn: 'আবার শুনুন',
                        en: 'Replay Voice'
                      }[currentLang] || 'Replay Voice'}
                    </button>
                    <button
                      onClick={endCall}
                      className="px-6 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                      <PhoneOff className="w-4 h-4" /> {t.endCall || "End Call"}
                    </button>
                  </div>
                </div>
              )}

              <div className="text-[10px] text-slate-500 text-center border-t border-slate-800/80 pt-2 mt-2">
                {{
                  te: 'ఆకాశ్ AI హై-ఫిడెలిటీ స్ట్రీమింగ్ ధ్వని ఇంజిన్ ద్వారా స్వచ్ఛమైన తెలుగులో ప్రసారం',
                  hi: 'आकाश AI हाई-फिडेलिटी स्ट्रीमिंग इंजन द्वारा शुद्ध क्षेत्रीय भाषा में प्रसारण',
                  ta: 'ஆகாஷ் AI உயர்தர ஸ்ட்ரீமிங் என்ஜின் மூலம் தாய்மொழி ஒலிபரப்பு',
                  kn: 'ಆಕಾಶ್ AI ಹೈ-ಫಿಡೆಲಿಟಿ ಸ್ಟ್ರೀಮಿಂಗ್ ಎಂಜಿನ್ ಮೂಲಕ ಮಾತೃಭಾಷಾ ಧ್ವನಿ ಪ್ರಸಾರ',
                  mr: 'आकाश AI हाय-फिडेलिटी स्ट्रीमिंग इंजिनद्वारे प्रादेशिक भाषेत प्रसारण',
                  pa: 'ਆਕਾਸ਼ AI ਹਾਈ-ਫਿਡੈਲਿਟੀ ਸਟ੍ਰੀਮਿੰਗ ਇੰਜਣ ਦੁਆਰਾ ਮਾਤ-ਭਾਸ਼ਾ ਪ੍ਰਸਾਰਣ',
                  bn: 'আকাশ AI হাই-ফিডেলিটি স্ট্রিমিং ইঞ্জিনের মাধ্যমে আঞ্চলিক ভাষায় সম্প্রচার',
                  en: 'Powered by Aakash AI High-Fidelity Streaming Vernacular Speech Engine'
                }[currentLang] || 'Powered by Aakash AI High-Fidelity Streaming Vernacular Speech Engine'}
              </div>
            </div>

            {/* Mobile SMS Simulator Box */}
            <div className="bg-slate-100 rounded-3xl p-5 border border-slate-300 shadow-sm flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> {t.smsPushTitle || "Automated Push SMS"}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    DLT: VK-AKSHAI
                  </span>
                </div>

                {/* Simulated Smartphone Message Bubble */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-800">VK-AKSHAI</span>
                    <span>{currentLang === 'te' ? 'ఇప్పుడే' : 'Just now'}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {smsText}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                    <span>{currentLang === 'te' ? 'భారత ప్రభుత్వ గుర్తింపు పొందిన ఎమర్జెన్సీ గేట్‌వే' : 'Govt Approved Agro-Emergency Gateway'}</span>
                    <span className="text-emerald-700 font-semibold">{t.freeSms || "Free SMS Service"}</span>
                  </div>
                </div>

                {/* Farmer Action Checklist */}
                <div className="mt-4 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                  <span className="font-bold block text-[11px] uppercase text-emerald-800">
                    {t.checklistFor || "Recommended Action Checklist for"} {activeAlert.id}:
                  </span>
                  {localizedActiveAlert.actionChecklist.map((act, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-center border-t border-slate-200 pt-2 mt-4">
                {{
                  te: 'వాతావరణ ముప్పు గుర్తించిన 3 నిమిషాల్లో ఈ హెచ్చరికలు రైతుల ఫోన్లకు చేరుతాయి',
                  hi: 'मौसम का खतरा पहचाने जाने के 3 मिनट के भीतर किसानों के फोन पर अलर्ट पहुंच जाता है',
                  ta: 'வானிலை அபாயம் கண்டறியப்பட்ட 3 நிமிடங்களுக்குள் இந்த எச்சரிக்கைகள் விவசாயிகளை சென்றடையும்',
                  kn: 'ಹವಾಮಾನ ಅಪಾಯ ಪತ್ತೆಯಾದ 3 ನಿಮಿಷಗಳಲ್ಲಿ ರೈತರ ಮೊಬೈಲ್‌ಗೆ ಈ ಎಚ್ಚರಿಕೆ ತಲುಪುತ್ತದೆ',
                  mr: 'हवामानाचा धोका ओळखल्यानंतर ३ मिनिटांच्या आत हे इशारे शेतकऱ्यांच्या फोनवर पोहोचतात',
                  pa: "ਮੌਸਮ ਦੇ ਖ਼ਤਰੇ ਦੀ ਪਛਾਣ ਹੋਣ ਦੇ 3 ਮਿੰਟਾਂ ਦੇ ਅੰਦਰ ਇਹ ਚਿਤਾਵਨੀ ਕਿਸਾਨਾਂ ਦੇ ਫ਼ੋਨਾਂ 'ਤੇ ਪਹੁੰਚ ਜਾਂਦੀ ਹੈ",
                  bn: 'আবহাওয়ার ঝুঁকি শনাক্ত হওয়ার ৩ মিনিটের মধ্যে কৃষকদের ফোনে এই সতর্কতা পৌঁছে যায়',
                  en: 'Automated triggers dispatch within 3 minutes of downscaled threshold breach'
                }[currentLang] || 'Automated triggers dispatch within 3 minutes of downscaled threshold breach'}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
