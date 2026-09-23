import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import PanchayatPicker from './components/PanchayatPicker';
import WeatherHero from './components/WeatherHero';
import ForecastTabs from './components/ForecastTabs';
import CropAdviser from './components/CropAdviser';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import AlertSimulator from './components/AlertSimulator';
import IncomingCallHUD from './components/IncomingCallHUD';
import MlDownscalingTab from './components/MlDownscalingTab';
import LanguageModal from './components/LanguageModal';
import PanchayatMap from './components/PanchayatMap';
import AlertDeliverySection from './components/AlertDeliverySection';
import FarmerRegistryModule from './components/FarmerRegistryModule';

import { PANCHAYATS_DATA } from './data/panchayats';
import { getWeatherDataForPanchayat } from './data/weatherData';
import { streamingWeatherService } from './utils/streamingWeatherService';
import { ringtoneService } from './utils/ringtoneService';
import { speechService } from './utils/speechService';
import { TRANSLATIONS, LANGUAGES } from './data/translations';
import { Mic, PhoneCall, Sparkles, ShieldCheck, Globe, Check, ShieldAlert, BellRing } from 'lucide-react';

export default function App() {
  // Default to English as requested, with instant switching to Telugu, Hindi, etc.
  const [currentLang, setCurrentLang] = useState('en');
  
  // Default to Maredumilli (AP) showing dramatic orographic downscaling delta
  const [selectedPanchayat, setSelectedPanchayat] = useState(PANCHAYATS_DATA[0]);

  // Modals & views
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isIncomingCallOpen, setIsIncomingCallOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [activeAlertTrigger, setActiveAlertTrigger] = useState('waterlogging');
  const [judgeMode, setJudgeMode] = useState(false);

  // Automated emergency risk call dispatcher state
  const [hasAutoDispatched, setHasAutoDispatched] = useState({});
  const [autoRinging, setAutoRinging] = useState(false);
  const [autoRiskBanner, setAutoRiskBanner] = useState(null);

  // Global Audio Unlock Listener (resumes AudioContext & Speech on first interaction anywhere)
  useEffect(() => {
    const unlockAudio = () => {
      ringtoneService.unlock();
      speechService.unlock();
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Live telemetry stream state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [streamTick, setStreamTick] = useState(0);

  // Compute hyper-local downscaled data fused with live telemetry
  const weatherData = useMemo(() => {
    const base = getWeatherDataForPanchayat(selectedPanchayat);
    const liveTelemetry = streamingWeatherService.computeDownscaledTelemetry(selectedPanchayat);
    
    // Merge live telemetry with base forecast structure
    return {
      ...base,
      telemetryMeta: liveTelemetry.telemetryMeta,
      current: {
        ...base.current,
        ...liveTelemetry.current
      }
    };
  }, [selectedPanchayat, streamTick]);

  // Auto-sync stream every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamTick(t => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Autonomous hazard detection & automated farmer call trigger
  useEffect(() => {
    const currentRisk = weatherData?.current?.alertTriggerType;
    const rain = weatherData?.current?.rainMm || 0;
    const soil = weatherData?.current?.soilMoisture || 0;
    const temp = weatherData?.current?.temp || 0;

    const isHazard = Boolean(currentRisk || rain >= 30 || soil >= 85 || temp >= 38.5);

    if (isHazard) {
      const riskType = currentRisk || (temp >= 38.5 ? 'scorching_sun' : 'waterlogging');
      const dispatchKey = `${selectedPanchayat.id}-${riskType}`;

      // Notify and autonomously trigger call if not dispatched yet for this session/panchayat
      if (!hasAutoDispatched[dispatchKey]) {
        setAutoRiskBanner({
          panchayatName: selectedPanchayat.localName || selectedPanchayat.name,
          riskType,
          rainMm: rain,
          soilMoisture: soil,
          temp: temp
        });

        // Auto-dispatch realistic smartphone call HUD to the farmer after short detection delay (1.2s)
        const autoCallTimer = setTimeout(() => {
          setActiveAlertTrigger(riskType);
          setIsIncomingCallOpen(true);
          setHasAutoDispatched(prev => ({ ...prev, [dispatchKey]: true }));
        }, 1200);

        return () => clearTimeout(autoCallTimer);
      }
    } else {
      setAutoRiskBanner(null);
    }
  }, [selectedPanchayat.id, weatherData?.current?.alertTriggerType, weatherData?.current?.rainMm, weatherData?.current?.soilMoisture, weatherData?.current?.temp]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStreamTick(t => t + 1);
      setIsRefreshing(false);
    }, 500);
  };

  // Current translation dictionary
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const handleTriggerAlert = (alertType = 'waterlogging') => {
    setActiveAlertTrigger(alertType);
    setIsIncomingCallOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Navigation */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenLanguageModal={() => setIsLangModalOpen(true)}
        t={t}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenAlerts={() => handleTriggerAlert(weatherData.current.alertTriggerType || 'waterlogging')}
        judgeMode={judgeMode}
        onToggleJudgeMode={() => setJudgeMode(!judgeMode)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Preferred Display Language Selector Bar (English, Telugu, Hindi, etc.) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3.5 sm:p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                {t.chooseDisplayLang || 'Choose Display Language:'}
              </span>
              <span className="text-[11px] text-slate-500">
                {t.currentLangLabel || 'Current: '}
                <strong className="text-emerald-700">
                  {LANGUAGES.find(l => l.code === currentLang)?.nativeName || 'English'}
                </strong> 
                {' • ' + (t.currentLangDesc || 'Weather forecasts & AI voice adapt instantly')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              );
            })}
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              title="All 8 Indian languages"
            >
              {t.more || 'More...'}
            </button>
          </div>
        </div>

        {/* 24x7 Autonomous Agro-Hazard Monitor & Dispatch Sentinel Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 mb-6 shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center shrink-0">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 relative"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  {{
                    te: '24x7 స్వయంచాలక వాతావరణ ముప్పు నిఘా & ఆటోమేటిక్ కాల్ వ్యవస్థ',
                    hi: '24x7 स्वचालित मौसम खतरा निगरानी व ऑटो-कॉल प्रणाली',
                    ta: '24x7 தானியங்கி வானிலை அபாய கண்காணிப்பு & தானியங்கி அழைப்பு அமைப்பு',
                    kn: '24x7 ಸ್ವಯಂಚಾಲಿತ ಹವಾಮಾನ ಅಪಾಯ ಮಾನಿಟರ್ ಮತ್ತು ಸ್ವಯಂ-ಕರೆ ವ್ಯವಸ್ಥೆ',
                    mr: '२४x७ स्वयंचलित हवामान धोका मॉनिटर आणि ऑटो-कॉल प्रणाली',
                    pa: '24x7 ਆਟੋਮੈਟਿਕ ਮੌਸਮ ਖ਼ਤਰਾ ਮਾਨੀਟਰ ਅਤੇ ਆਟੋ-ਕਾਲ ਪ੍ਰਣਾਲੀ',
                    bn: '24x7 স্বয়ংক্রিয় আবহাওয়া ঝুঁকি মনিটর ও অটো-কল সিস্টেম',
                    en: '24x7 Autonomous Hazard Sentinel & Automated Farmer Call System'
                  }[currentLang] || '24x7 Autonomous Hazard Sentinel & Automated Farmer Call System'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {{
                    te: 'క్రియాశీలం',
                    hi: 'सक्रिय',
                    ta: 'செயலில்',
                    kn: 'ಸಕ್ರಿಯ',
                    mr: 'सक्रिय',
                    pa: 'ਸਰਗਰਮ',
                    bn: 'সক্রিয়',
                    en: 'ACTIVE'
                  }[currentLang] || 'ACTIVE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {{
                  te: 'వర్షం > 35mm, నేల తేమ > 85%, లేదా అధిక ఎండ ముప్పు రాగానే వ్యవస్థ స్వయంచాలకంగా రైతు ఫోన్‌కు కాల్ చేస్తుంది.',
                  hi: 'बारिश > 35mm, मिट्टी की नमी > 85% या भीषण गर्मी होने पर प्रणाली स्वचालित रूप से किसान को कॉल करती है।',
                  ta: 'மழை > 35mm அல்லது தீவிர வெப்பம் ஏற்படும் போது அமைப்பு தானாகவே விவசாயிக்கு போன் கால் செய்கிறது.',
                  kn: 'ಮಳೆ > 35mm ಅಥವಾ ತೀವ್ರ ಶಾಖ ಉಂಟಾದಾಗ ವ್ಯವಸ್ಥೆಯು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ರೈತರ ಮೊಬೈಲ್‌ಗೆ ಕರೆ ಮಾಡುತ್ತದೆ.',
                  mr: 'पाऊस > 35mm किंवा उष्णतेची लाट आल्यास प्रणाली थेट शेतकऱ्यांच्या फोनवर स्वयंचलित कॉल करते.',
                  pa: 'ਮੀਂਹ > 35mm ਜਾਂ ਤੇਜ਼ ਗਰਮੀ ਹੋਣ ਤੇ ਸਿਸਟਮ ਆਪਣੇ ਆਪ ਕਿਸਾਨ ਦੇ ਮੋਬਾਈਲ ਤੇ ਕਾਲ ਕਰਦਾ ਹੈ।',
                  bn: 'বৃষ্টি > 35mm বা তীব্র তাপপ্রবাহ দেখা দিলে সিস্টেম স্বয়ংক্রিয়ভাবে কৃষকের মোবাইলে কল করে।',
                  en: 'Autonomously detects flash rain (>35mm), waterlogging, or heatwaves and dispatches voice calls directly to farmers.'
                }[currentLang] || 'Autonomously detects flash rain (>35mm), waterlogging, or heatwaves and dispatches voice calls directly to farmers.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleTriggerAlert(weatherData.current.alertTriggerType || 'waterlogging')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              {{
                te: '⚡ అత్యవసర కాల్ పరీక్షించండి',
                hi: '⚡ आपातकालीन कॉल टेस्ट करें',
                ta: '⚡ அவசர அழைப்பை சோதிக்கவும்',
                kn: '⚡ ತುರ್ತು ಕರೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ',
                mr: '⚡ आपत्कालीन कॉल तपासा',
                pa: '⚡ ਐਮਰਜੈਂਸੀ ਕਾਲ ਟੈਸਟ ਕਰੋ',
                bn: '⚡ জরুরি কল টেস্ট করুন',
                en: '⚡ Test Autonomous Call Now'
              }[currentLang] || '⚡ Test Autonomous Call Now'}
            </button>
          </div>
        </div>

        {/* Panchayat Selector & Elevation Strip */}
        <PanchayatPicker
          selectedPanchayat={selectedPanchayat}
          onSelectPanchayat={setSelectedPanchayat}
          currentLang={currentLang}
          t={t}
        />

        {/* SIH Judge / ML Pipeline Mode View (If toggled) */}
        {judgeMode ? (
          <MlDownscalingTab
            selectedPanchayat={selectedPanchayat}
            weatherData={weatherData}
          />
        ) : (
          <>
            {/* Current Downscaled Weather & Atmospheric Explainability Card */}
            <WeatherHero
              weatherData={weatherData}
              selectedPanchayat={selectedPanchayat}
              currentLang={currentLang}
              t={t}
              onOpenVoice={() => setIsVoiceOpen(true)}
              onTriggerAlert={handleTriggerAlert}
              onRefreshTelemetry={handleManualRefresh}
              isRefreshing={isRefreshing}
            />

            {/* Interactive Panchayat Boundary & Weather Risk Map */}
            <PanchayatMap
              selectedPanchayat={selectedPanchayat}
              weatherData={weatherData}
              currentLang={currentLang}
              t={t}
              onTriggerAlert={handleTriggerAlert}
            />

            {/* Forecast Horizons: 3-Day Hourly, 1-Week Trends, 1-Month Seasonal */}
            <ForecastTabs
              weatherData={weatherData}
              currentLang={currentLang}
              t={t}
            />

                        {/* Privacy-Preserving Farmer Coverage & Panchayat-Wide Alert Module */}
            <FarmerRegistryModule
              selectedPanchayat={selectedPanchayat}
              currentLang={currentLang}
              t={t}
              onTriggerCall={() => handleTriggerAlert(weatherData.current.alertTriggerType || 'waterlogging')}
            />

            {/* Alert Delivery Architecture & Multi-Channel Dispatch */}
            <AlertDeliverySection
              selectedPanchayat={selectedPanchayat}
              currentLang={currentLang}
              onTriggerCall={() => handleTriggerAlert(weatherData.current.alertTriggerType || 'waterlogging')}
              onOpenAlertSimulator={() => setIsAlertsOpen(true)}
              t={t}
            />

            {/* AI Crop Advisory (Standing Crop vs New Cultivation Planning) */}
            <CropAdviser
              selectedPanchayat={selectedPanchayat}
              weatherData={weatherData}
              currentLang={currentLang}
              t={t}
            />
          </>
        )}

      </main>

      {/* Floating Action Buttons for Farmers */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-3">
        {/* Test Alert Button */}
        <button
          onClick={() => handleTriggerAlert(weatherData.current.alertTriggerType || 'waterlogging')}
          className="p-3.5 sm:px-4 sm:py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 flex items-center gap-2 border-2 border-white transition-all active:scale-95 group"
          title="Simulate Automated Call/SMS"
        >
          <PhoneCall className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
            {t.simulateCallSmsBtn || 'Simulate Call/SMS'}
          </span>
        </button>

        {/* Floating Voice Assistant Mic */}
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="p-4 sm:px-5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black shadow-xl shadow-emerald-600/30 flex items-center gap-2.5 border-2 border-white transition-all active:scale-95 group"
          title="Open Aakash Vani Voice Assistant"
        >
          <Mic className="w-6 h-6 animate-pulse" />
          <span className="hidden sm:inline text-sm font-extrabold tracking-tight">
            {t.voiceAssistantBtn}
          </span>
        </button>
      </div>

      {/* Multilingual Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        selectedPanchayat={selectedPanchayat}
        weatherData={weatherData}
        t={t}
      />

      {/* Realistic Smartphone Incoming Emergency Call HUD */}
      <IncomingCallHUD
        isOpen={isIncomingCallOpen}
        onClose={() => setIsIncomingCallOpen(false)}
        selectedPanchayat={selectedPanchayat}
        currentLang={currentLang}
        alertId={activeAlertTrigger}
        onOpenAlertSimulator={() => {
          setIsIncomingCallOpen(false);
          setIsAlertsOpen(true);
        }}
      />

      {/* Automated Early Warning Call & SMS Simulator Modal */}
      <AlertSimulator
        isOpen={isAlertsOpen}
        onClose={() => {
          setIsAlertsOpen(false);
          setAutoRinging(false);
        }}
        selectedPanchayat={selectedPanchayat}
        currentLang={currentLang}
        initialAlertId={activeAlertTrigger}
        autoRinging={autoRinging}
        t={t}
      />

      {/* Preferred Display Language Modal */}
      <LanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        currentLang={currentLang}
        onSelectLanguage={setCurrentLang}
      />

      {/* Footer with SIH Attribution & IMD Acknowledgement */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-800 text-sm">
              {{
                te: 'టీమ్ ఆకాశ్ AI • స్మార్ట్ ఇండియా హ్యాకథాన్',
                hi: 'टीम आकाश AI • स्मार्ट इंडिया हैकथॉन',
                ta: 'குழு ஆகாஷ் AI • ஸ்மார்ட் இந்தியா ஹேக்கத்தான்',
                kn: 'ತಂಡ ಆಕಾಶ್ AI • ಸ್ಮಾರ್ಟ್ ಇಂಡಿಯಾ ಹ್ಯಾಕಥಾನ್',
                mr: 'टीम आकाश AI • स्मार्ट इंडिया हॅकाथॉन',
                pa: 'ਟੀਮ ਆਕਾਸ਼ AI • ਸਮਾਰਟ ਇੰਡੀਆ ਹੈਕਾਥੌਨ',
                bn: 'টিম আকাশ AI • স্মার্ট ইন্ডিয়া হ্যাকাথন',
                en: 'Team Aakash AI • Smart India Hackathon'
              }[currentLang] || 'Team Aakash AI • Smart India Hackathon'}
            </p>
            <p className="mt-0.5">
              {{
                te: 'సమస్య: AI/ML డౌన్‌స్కేలింగ్ & మాతృభాష రైతు సలహాలతో గ్రామ పంచాయతీ స్థాయి వాతావరణ అంచనా',
                hi: 'समस्या: AI/ML डाउनस्केलिंग और क्षेत्रीय भाषा किसान परामर्श के साथ ग्राम पंचायत स्तर मौसम पूर्वानुमान',
                ta: 'AI/ML நுட்பம் மற்றும் தாய்மொழி விவசாய ஆலோசனைகளுடன் கூடிய கிராம பஞ்சாயத்து வானிலை முன்னறிவிப்பு',
                kn: 'AI/ML ಡೌನ್‌ಸ್ಕೇಲಿಂಗ್ ಮತ್ತು ಮಾತೃಭಾಷಾ ರೈತ ಸಲಹೆಯೊಂದಿಗೆ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಮಟ್ಟದ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
                mr: 'AI/ML डाऊनस्केलिंग आणि स्थानिक भाषा शेतकरी सल्ल्यासह ग्रामपंचायत पातळीवरील हवामान अंदाज',
                pa: 'AI/ML ਡਾਊਨਸਕੇਲਿੰਗ ਅਤੇ ਮਾਤ-ਭਾਸ਼ਾ ਕਿਸਾਨ ਸਲਾਹ ਨਾਲ ਗ੍ਰਾਮ ਪੰਚਾਇਤ ਪੱਧਰ ਦਾ ਮੌਸਮ ਪੂਰਵ-ਅਨੁਮਾਨ',
                bn: 'AI/ML ডাউনস্কেলিং এবং স্থানীয় ভাষায় কৃষক পরামর্শ সহ গ্রাম পঞ্চায়েত স্তরের আবহাওয়ার পূর্বাভাস',
                en: 'Panchayat-Level Weather Forecasting through AI/ML Downscaling & Vernacular Farmer Advisory'
              }[currentLang] || 'Panchayat-Level Weather Forecasting through AI/ML Downscaling & Vernacular Farmer Advisory'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
            <span>{{
              te: 'వాతావరణ సమాచారం:',
              hi: 'मौसम डेटा:',
              ta: 'வானிலை தரவு:',
              kn: 'ಹವಾಮಾನ ಮಾಹಿತಿ:',
              mr: 'हवामान माहिती:',
              pa: 'ਮੌਸਮ ਡੇਟਾ:',
              bn: 'আবহাওয়া তথ্য:',
              en: 'Data Ingestion:'
            }[currentLang] || 'Data Ingestion:'} <strong>IMD (India Meteorological Department)</strong></span>
            <span>{{
              te: 'ఎత్తు మెష్:',
              hi: 'ऊंचाई मॉडल:',
              ta: 'உயர மாதிரி:',
              kn: 'ಎತ್ತರ ಮಾದರಿ:',
              mr: 'उंची मॉडेल:',
              pa: 'ਉਚਾਈ ਮਾਡਲ:',
              bn: 'উচ্চতা মডেল:',
              en: 'Elevation Mesh:'
            }[currentLang] || 'Elevation Mesh:'} <strong>ISRO Bhuvan / SRTM DEM 30m</strong></span>
            <span className="text-emerald-700 font-semibold">{{
              te: 'ఆఫ్‌లైన్ PWA సిద్ధం',
              hi: 'ऑफलाइन PWA सक्षम',
              ta: 'ஆஃப்லைன் PWA தயார்',
              kn: 'ಆಫ್‌ಲೈನ್ PWA ಸಿದ್ಧ',
              mr: 'ऑफलाइन PWA तयार',
              pa: 'ਆਫ਼ਲਾਈਨ PWA ਤਿਆਰ',
              bn: 'অফলাইন PWA সক্ষম',
              en: 'Offline PWA Capable'
            }[currentLang] || 'Offline PWA Capable'}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
