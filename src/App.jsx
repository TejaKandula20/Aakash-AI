import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import LoginModal from './components/LoginModal';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import UserDailyAlertCard from './components/UserDailyAlertCard';

import { PANCHAYATS_DATA, resolvePanchayat } from './data/panchayats';
import { getWeatherDataForPanchayat } from './data/weatherData';
import { streamingWeatherService } from './utils/streamingWeatherService';
import { ringtoneService } from './utils/ringtoneService';
import { speechService } from './utils/speechService';
import { apiService } from './utils/apiService';
import { TRANSLATIONS, LANGUAGES } from './data/translations';
import { Mic, PhoneCall, Sparkles, ShieldCheck, Globe, Check, ShieldAlert, BellRing, LogIn, UserCheck } from 'lucide-react';

export default function App() {
  // Current language: Default to English with instant switching to Telugu, Hindi, etc.
  const [currentLang, setCurrentLang] = useState('en');

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => apiService.user);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // Selected Panchayat state
  const [selectedPanchayat, setSelectedPanchayat] = useState(() => {
    return resolvePanchayat(apiService.user?.assignedPanchayatId);
  });

  // Daily alert status from server
  const [dailyAlertStatus, setDailyAlertStatus] = useState(null);
  const [isCheckingDailyAlert, setIsCheckingDailyAlert] = useState(false);

  // Modals & views
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isIncomingCallOpen, setIsIncomingCallOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [activeAlertTrigger, setActiveAlertTrigger] = useState('waterlogging');
  const [judgeMode, setJudgeMode] = useState(false);

  // Live telemetry stream state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [streamTick, setStreamTick] = useState(0);

  // Translation dictionary
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Global Audio Unlock Listener (resumes AudioContext & Speech on first user interaction)
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

  // Verify and sync authentication session on initial load
  useEffect(() => {
    const verifyAuth = async () => {
      if (apiService.token) {
        try {
          const freshUser = await apiService.getMe();
          setCurrentUser(freshUser);
          if (freshUser.role === 'admin') {
            setIsAdminView(true);
          } else {
            setIsAdminView(false);
            if (freshUser.assignedPanchayatId) {
              setSelectedPanchayat(resolvePanchayat(freshUser.assignedPanchayatId));
            }
          }
        } catch (e) {
          console.warn('[AUTH] Token verification failed:', e.message);
          setCurrentUser(null);
          setIsAdminView(false);
        }
      }
    };
    verifyAuth();
  }, []);

  // Fetch Daily Alert Sentinel Status for selected panchayat (Enforces Once-Per-Day rule)
  const fetchDailyAlertStatus = useCallback(async (panchayatId) => {
    if (!panchayatId) return;
    setIsCheckingDailyAlert(true);
    try {
      const res = await apiService.getDailyAlertStatus(panchayatId);
      setDailyAlertStatus(res);
    } catch (e) {
      console.warn('[ALERT] Could not fetch daily alert status:', e.message);
    } finally {
      setIsCheckingDailyAlert(false);
    }
  }, []);

  useEffect(() => {
    const registeredPanchayat = resolvePanchayat(currentUser?.assignedPanchayatId);
    fetchDailyAlertStatus(registeredPanchayat.id);
  }, [currentUser?.assignedPanchayatId, fetchDailyAlertStatus]);

  // Compute hyper-local downscaled data fused with live telemetry
  const weatherData = useMemo(() => {
    const panchayat = selectedPanchayat || PANCHAYATS_DATA[0];
    const base = getWeatherDataForPanchayat(panchayat);
    const liveTelemetry = streamingWeatherService.computeDownscaledTelemetry(panchayat);
    
    return {
      ...base,
      telemetryMeta: liveTelemetry?.telemetryMeta || {},
      current: {
        ...(base?.current || {}),
        ...(liveTelemetry?.current || {})
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

  // Strict Once-Per-Day Autonomous Emergency Alert Sentinel:
  // Checks if hazard conditions are reached AND verifies today's execution has NOT already occurred.
  // Does NOT re-trigger on page refresh, re-renders, or page navigation!
  useEffect(() => {
    // If daily alert has ALREADY completed for today, abort immediately
    if (dailyAlertStatus?.alreadyExecutedToday) {
      return;
    }

    const registeredPanchayat = resolvePanchayat(currentUser?.assignedPanchayatId);
    const regWeather = getWeatherDataForPanchayat(registeredPanchayat);
    const currentRisk = regWeather?.current?.alertTriggerType;
    const rain = regWeather?.current?.rainMm || 0;
    const soil = regWeather?.current?.soilMoisture || 0;
    const temp = regWeather?.current?.temp || 0;

    const isHazard = Boolean(currentRisk || rain >= 35 || soil >= 85 || temp >= 38.5);

    if (isHazard && currentUser) {
      const riskType = currentRisk || (temp >= 38.5 ? 'scorching_sun' : 'waterlogging');

      // Check synchronous localStorage safety shield to avoid re-render race conditions
      const localKey = `aakash_alert_sent_${registeredPanchayat.id}_${new Date().toISOString().slice(0, 10)}`;
      if (localStorage.getItem(localKey)) {
        return;
      }

      // Mark locally to block microsecond duplicate renders
      localStorage.setItem(localKey, 'pending');

      const triggerServerDaily = async () => {
        try {
          const res = await apiService.triggerDailyAlert({
            panchayatId: registeredPanchayat.id, panchayatName: registeredPanchayat.localName || registeredPanchayat.name,
            riskType,
            riskLevel: 'CRITICAL',
            triggerReason: `Autonomous sensor threshold reached (Rain: ${rain}mm, Soil: ${soil}%, Temp: ${temp}°C)`,
            channel: 'VOICE_CALL',
            recipientCount: 4
          });

          // Server approved first-time execution today!
          setDailyAlertStatus({
            alreadyExecutedToday: true,
            record: res.record,
            todayDate: res.record?.date_str
          });
          localStorage.setItem(localKey, 'executed');

          // Open incoming call HUD with ringing audio
          setActiveAlertTrigger(riskType);
          setIsIncomingCallOpen(true);
        } catch (err) {
          // If 409 Conflict: Server detected alert was already completed today
          if (err.status === 409 || err.data?.alreadyExecutedToday) {
            console.log('[ALERT SENTINEL] Duplicate alert blocked by server once-per-day policy');
            setDailyAlertStatus({
              alreadyExecutedToday: true,
              record: err.data?.record,
              todayDate: err.data?.record?.date_str
            });
            localStorage.setItem(localKey, 'executed');
          }
        }
      };

      const timer = setTimeout(triggerServerDaily, 1500);
      return () => clearTimeout(timer);
    }
  }, [weatherData?.current, selectedPanchayat.id, dailyAlertStatus?.alreadyExecutedToday, currentUser]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStreamTick(t => t + 1);
      setIsRefreshing(false);
    }, 500);
  };

  const handleTriggerAlert = (alertType = 'waterlogging') => {
    setActiveAlertTrigger(alertType);
    setIsIncomingCallOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setIsAdminView(true);
    } else {
      setIsAdminView(false);
      if (user.assignedPanchayatId) {
        setSelectedPanchayat(resolvePanchayat(user.assignedPanchayatId));
      }
    }
    fetchDailyAlertStatus(user.assignedPanchayatId || selectedPanchayat.id);
  };

  const handleLogout = async () => {
    await apiService.logout();
    setCurrentUser(null);
    setIsAdminView(false);
  };

  // If user is NOT logged in: Render ONLY the dedicated Login Page!
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />
    );
  }

  // Once authenticated: Render accordingly based on role (Admin vs Farmer User)
  const registeredPanchayat = resolvePanchayat(currentUser?.assignedPanchayatId);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Universal Top Navigation */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenLanguageModal={() => setIsLangModalOpen(true)}
        t={t}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        judgeMode={judgeMode}
        onToggleJudgeMode={() => setJudgeMode(!judgeMode)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        isAdminView={isAdminView}
        onToggleAdminView={() => setIsAdminView(!isAdminView)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* 1. ADMIN COMMAND CENTER INTERFACE */}
        {currentUser?.role === 'admin' && isAdminView ? (
          <AdminDashboard
            currentUser={currentUser}
            onSwitchToVillageView={() => setIsAdminView(false)}
            t={t}
            currentLang={currentLang}
          />
        ) : (
          /* 2. USER / VILLAGE DASHBOARD VIEW (With all locations browse capability) */
          <div className="space-y-6">

            {/* User Daily Alert Card (Strictly Locked to User's REGISTERED Location) */}
            <UserDailyAlertCard
              panchayatName={registeredPanchayat?.localName || registeredPanchayat?.name || 'Maredumilli'}
              todayDate={dailyAlertStatus?.todayDate || new Date().toISOString().slice(0, 10)}
              dailyAlertStatus={dailyAlertStatus}
              onOpenCallHUD={() => handleTriggerAlert(weatherData?.current?.alertTriggerType || 'waterlogging')}
              currentLang={currentLang}
              t={t}
            />

            {/* Browsing Banner when viewing a Panchayat other than Registered Alert Location */}
            {selectedPanchayat.id !== registeredPanchayat.id && (
              <div className="p-4 rounded-3xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-200/80 flex items-center justify-center font-bold text-amber-900 shrink-0">
                    📍
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block">
                      {currentLang === 'te' 
                        ? `మీరు ప్రస్తుతం ${selectedPanchayat.localName || selectedPanchayat.name} వాతావరణం పరిశీలిస్తున్నారు`
                        : `Viewing Weather Forecast for ${selectedPanchayat.name}`}
                    </span>
                    <span className="text-xs text-amber-800">
                      {currentLang === 'te'
                        ? `గమనిక: మీ ఆటోమేటిక్ అత్యవసర ఫోన్ కాల్ అలర్ట్లు మీ రిజిస్టర్డ్ పంచాయతీ (${registeredPanchayat.localName || registeredPanchayat.name}) కొరకే చురుకుగా ఉంటాయి.`
                        : `Note: Severe weather automated phone calls & SMS alerts remain strictly locked to your registered location (${registeredPanchayat.name}).`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPanchayat(registeredPanchayat)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 self-start sm:self-auto transition-all shadow-sm"
                >
                  {currentLang === 'te' ? '↩️ నా రిజిస్టర్డ్ పంచాయతీకి వెళ్ళండి' : '↩️ Return to My Alert Hub'}
                </button>
              </div>
            )}

            {/* District -> Mandal -> Panchayat Selector (Available to ALL users to browse any location) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    {currentLang === 'te' 
                      ? 'రాష్ట్రవ్యాప్త వాతావరణ అన్వేషణ (13,326 గ్రామ పంచాయతీలు):' 
                      : 'Explore Weather Forecast across all 13,326 Gram Panchayats:'}
                  </span>
                  {selectedPanchayat.id === registeredPanchayat.id && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                      {currentLang === 'te' ? '✓ రిజిస్టర్డ్ అలర్ట్ కేంద్రం' : '✓ Your Registered Alert Hub'}
                    </span>
                  )}
                </div>
              </div>

              <PanchayatPicker
                selectedPanchayat={selectedPanchayat}
                onSelectPanchayat={(p) => {
                  setSelectedPanchayat(p);
                }}
                currentLang={currentLang}
                t={t}
              />
            </div>

            {/* Weather Hero Card with Downscaled Physical Telemetry */}
            <WeatherHero
              panchayat={selectedPanchayat}
              selectedPanchayat={selectedPanchayat}
              weather={weatherData}
              weatherData={weatherData}
              t={t}
              currentLang={currentLang}
              onRefresh={handleManualRefresh}
              isRefreshing={isRefreshing}
            />

            {/* High-Visibility Panchayat Map (Clean Esri Tiles + 1km Micro-Mesh) */}
            <PanchayatMap
              selectedPanchayat={selectedPanchayat}
              panchayat={selectedPanchayat}
              weatherData={weatherData}
              weather={weatherData}
              currentLang={currentLang}
              t={t}
              onTriggerAlert={handleTriggerAlert}
            />

            {/* Standing Crop Protection Advisory & Spray Forecast */}
            <CropAdviser
              panchayat={selectedPanchayat}
              selectedPanchayat={selectedPanchayat}
              weather={weatherData}
              weatherData={weatherData}
              t={t}
              currentLang={currentLang}
              onVoiceAsk={(crop) => {
                setIsVoiceOpen(true);
              }}
            />

            {/* Horizon Forecasts: 3-Day Hourly, 7-Day Trend, 30-Day Outlook */}
            <ForecastTabs
              weather={weatherData}
              weatherData={weatherData}
              panchayat={selectedPanchayat}
              selectedPanchayat={selectedPanchayat}
              t={t}
              currentLang={currentLang}
            />

            {/* Privacy-Preserving Village Farmer Registry & Panchayat-Wide Alert Module */}
            <FarmerRegistryModule
              selectedPanchayat={selectedPanchayat}
              panchayat={selectedPanchayat}
              weatherData={weatherData}
              weather={weatherData}
              t={t}
              currentLang={currentLang}
              currentUser={currentUser}
              onTriggerAlertHUD={handleTriggerAlert}
            />

            {/* SIH Judge Mode: AI/ML Localization Engine & Downscaling Architecture */}
            {judgeMode && (
              <MlDownscalingTab
                panchayat={selectedPanchayat}
                selectedPanchayat={selectedPanchayat}
                weather={weatherData}
                weatherData={weatherData}
                t={t}
                currentLang={currentLang}
              />
            )}

          </div>
        )}

      </main>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        selectedPanchayat={selectedPanchayat}
        weatherData={weatherData}
        currentLang={currentLang}
        t={t}
      />

      {/* Manual Alert Trigger Simulator */}
      <AlertSimulator
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        selectedPanchayat={selectedPanchayat}
        weatherData={weatherData}
        onTriggerAlert={handleTriggerAlert}
        currentLang={currentLang}
        t={t}
      />

      {/* Emergency Call HUD */}
      <IncomingCallHUD
        isOpen={isIncomingCallOpen}
        onClose={() => setIsIncomingCallOpen(false)}
        panchayat={registeredPanchayat}
        weatherData={weatherData}
        alertType={activeAlertTrigger}
        currentLang={currentLang}
        t={t}
      />

      {/* Language Switcher Modal */}
      <LanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        currentLang={currentLang}
        onSelectLang={(code) => setCurrentLang(code)}
      />

    </div>
  );
}
