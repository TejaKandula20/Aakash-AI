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
    fetchDailyAlertStatus(selectedPanchayat.id);
  }, [selectedPanchayat.id, fetchDailyAlertStatus]);

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

    const currentRisk = weatherData?.current?.alertTriggerType;
    const rain = weatherData?.current?.rainMm || 0;
    const soil = weatherData?.current?.soilMoisture || 0;
    const temp = weatherData?.current?.temp || 0;

    const isHazard = Boolean(currentRisk || rain >= 35 || soil >= 85 || temp >= 38.5);

    if (isHazard && currentUser) {
      const riskType = currentRisk || (temp >= 38.5 ? 'scorching_sun' : 'waterlogging');

      // Check synchronous localStorage safety shield to avoid re-render race conditions
      const localKey = `aakash_alert_sent_${selectedPanchayat.id}_${new Date().toISOString().slice(0, 10)}`;
      if (localStorage.getItem(localKey)) {
        return;
      }

      // Mark locally to block microsecond duplicate renders
      localStorage.setItem(localKey, 'pending');

      const triggerServerDaily = async () => {
        try {
          const res = await apiService.triggerDailyAlert({
            panchayatId: selectedPanchayat.id,
            panchayatName: selectedPanchayat.localName || selectedPanchayat.name,
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

        {/* If user is NOT logged in: Show Authentication Gateway Banner */}
        {!currentUser && (
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-xl border border-emerald-700/40 relative overflow-hidden">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Production Agro-Meteorological Portal</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight">
                Secure Gram Panchayat Weather & Emergency Sentinel
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-2 leading-relaxed">
                Log in to access your assigned Gram Panchayat's hyper-local 1km forecasts, standing crop protection advisories, daily emergency call sentinel, and multilingual voice assistant.
              </p>
              
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-400/20 active:scale-95 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Demo Roles</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. ADMIN COMMAND CENTER VIEW */}
        {currentUser?.role === 'admin' && isAdminView ? (
          <AdminDashboard
            currentUser={currentUser}
            onSwitchToVillageView={() => setIsAdminView(false)}
            t={t}
            currentLang={currentLang}
          />
        ) : (
          /* 2. USER / VILLAGE DASHBOARD VIEW */
          <div className="space-y-6">

            {/* User Daily Alert Card (Once-Per-Day Status) */}
            {currentUser && (
              <UserDailyAlertCard
                panchayatName={selectedPanchayat?.localName || selectedPanchayat?.name || 'Maredumilli'}
                todayDate={dailyAlertStatus?.todayDate || new Date().toISOString().slice(0, 10)}
                dailyAlertStatus={dailyAlertStatus}
                onOpenCallHUD={() => handleTriggerAlert(weatherData?.current?.alertTriggerType || 'waterlogging')}
                currentLang={currentLang}
                t={t}
              />
            )}

            {/* District -> Mandal -> Panchayat Selector */}
            {/* If Admin: can inspect any of the 13,326 Panchayats. If User: displays their assigned village */}
            {currentUser?.role === 'admin' ? (
              <PanchayatPicker
                selectedPanchayat={selectedPanchayat}
                onSelectPanchayat={(p) => {
                  setSelectedPanchayat(p);
                  fetchDailyAlertStatus(p.id);
                }}
                currentLang={currentLang}
                t={t}
              />
            ) : (
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                    GP
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {currentLang === 'te' ? 'మీ కేటాయించబడిన గ్రామ పంచాయతీ' : 'Your Assigned Gram Panchayat'}
                    </div>
                    <div className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>{selectedPanchayat?.localName || selectedPanchayat?.name || 'Maredumilli'}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {selectedPanchayat?.mandal || selectedPanchayat?.taluk || 'Maredumilli'} Mandal • {selectedPanchayat?.district || 'Alluri Sitharama Raju'} District
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-center">
                  SRTM DEM: {selectedPanchayat?.elevationMeters || 450}m | GPS: {selectedPanchayat?.latitude || selectedPanchayat?.lat || 17.5912}°N, {selectedPanchayat?.longitude || selectedPanchayat?.lon || 81.7138}°E
                </div>
              </div>
            )}

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

            {/* High-Visibility Panchayat Map (OpenStreetMap Leaflet Tiles + 1km Micro-Mesh) */}
            <PanchayatMap
              selectedPanchayat={selectedPanchayat}
              weatherData={weatherData}
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
              onTriggerAlertHUD={handleTriggerAlert}
            />

            {/* SIH Judge Mode: AI/ML Localization Engine & Downscaling Architecture */}
            {judgeMode && (
              <MlDownscalingTab
                panchayat={selectedPanchayat}
                weather={weatherData}
                t={t}
                currentLang={currentLang}
              />
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700">
            Aakash AI • Smart India Hackathon Production Prototype
          </p>
          <p className="mt-1">
            Downscaling 25km IMD Grid to 1km Hyper-Local Resolution for all 13,326 Gram Panchayats in Andhra Pradesh.
          </p>
        </div>
      </footer>

      {/* MODALS & OVERLAYS */}

      {/* 1. Login & Role Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentLang={currentLang}
      />

      {/* 2. Multilingual Voice Assistant Modal (Anti-Echo / Session Guarded) */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        selectedPanchayat={selectedPanchayat}
        weatherData={weatherData}
        t={t}
      />

      {/* 3. Autonomous Emergency Incoming Call HUD */}
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

      {/* 4. Automated Emergency Alerts & Telephony Simulator */}
      <AlertSimulator
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        selectedPanchayat={selectedPanchayat}
        currentLang={currentLang}
        t={t}
      />

      {/* 5. Language Selection Modal */}
      <LanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        currentLang={currentLang}
        onSelectLang={(langCode) => {
          setCurrentLang(langCode);
          setIsLangModalOpen(false);
        }}
      />

    </div>
  );
}
