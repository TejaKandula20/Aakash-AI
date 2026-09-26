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
import { databaseService } from './data/databaseService';
import { getWeatherDataForPanchayat } from './data/weatherData';
import { streamingWeatherService } from './utils/streamingWeatherService';
import { ringtoneService } from './utils/ringtoneService';
import { speechService } from './utils/speechService';
import { apiService } from './utils/apiService';
import { notificationService } from './utils/notificationService';
import { TRANSLATIONS, LANGUAGES } from './data/translations';
import { Mic, PhoneCall, Sparkles, ShieldCheck, Globe, Check, ShieldAlert, BellRing, LogIn, UserCheck } from 'lucide-react';

export default function App() {
  // Current language: Read from localStorage or user profile, default to 'en'
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aakash_preferred_lang');
      if (saved && ['en', 'te', 'hi', 'ta', 'mr', 'kn', 'pa', 'bn'].includes(saved)) {
        return saved;
      }
    }
    return apiService.user?.preferredLanguage || 'en';
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => apiService.user);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(() => Boolean(apiService.user?.role === 'admin'));

  const handleLanguageChange = useCallback((newLang) => {
    if (!newLang) return;
    setCurrentLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aakash_preferred_lang', newLang);
    }
    if (currentUser) {
      currentUser.preferredLanguage = newLang;
    }
  }, [currentUser]);

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
  const [liveHourlyForecast, setLiveHourlyForecast] = useState(null);

  // Translation dictionary with strict English fallback so no key is ever missing or undefined
  const t = useMemo(() => {
    return {
      ...TRANSLATIONS.en,
      ...(TRANSLATIONS[currentLang] || {})
    };
  }, [currentLang]);

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
          if (freshUser.assignedPanchayatId) {
            setSelectedPanchayat(resolvePanchayat(freshUser.assignedPanchayatId));
          }
          if (freshUser.role === 'admin') {
            setIsAdminView(true);
          } else {
            setIsAdminView(false);
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
    if (currentUser?.assignedPanchayatId) {
      const registeredPanchayat = resolvePanchayat(currentUser.assignedPanchayatId);
      fetchDailyAlertStatus(registeredPanchayat.id);
    }
  }, [currentUser?.assignedPanchayatId, fetchDailyAlertStatus]);

  // Fetch live hourly forecast from Open-Meteo for selected panchayat (1-hour intervals)
  useEffect(() => {
    let isMounted = true;
    setLiveHourlyForecast(null);

    streamingWeatherService.fetchLiveHourlyForecast(selectedPanchayat).then(hourly => {
      if (isMounted && hourly && hourly.length > 0) {
        setLiveHourlyForecast(hourly);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedPanchayat.id, streamTick]);

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
      },
      threeDayHourly: liveHourlyForecast || base?.threeDayHourly || []
    };
  }, [selectedPanchayat, streamTick, liveHourlyForecast]);

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
          // Look up user's registered phone number
          const targetPhone = currentUser?.phoneNumber || currentUser?.phone || '9392705998';

          // 1. Dispatch emergency alert directly to registered farmer's mobile number
          apiService.sendManualPhoneAlert(
            targetPhone,
            riskType,
            `Autonomous micro-climate alert for ${registeredPanchayat.name} (Rain: ${rain}mm, Soil: ${soil}%, Temp: ${temp}°C)`
          ).catch((e) => console.warn('Automated phone dispatch note:', e));

          // 2. Dispatch risk alert to ALL registered farmers in this panchayat in the local database
          const targetFarmerCount = databaseService.getFarmersCountByPanchayat(registeredPanchayat.id);
          databaseService.dispatchPanchayatRiskAlert(
            registeredPanchayat.id,
            riskType,
            `Autonomous sensor threshold reached (Rain: ${rain}mm, Soil: ${soil}%, Temp: ${temp}°C)`
          );

          const res = await apiService.triggerDailyAlert({
            panchayatId: registeredPanchayat.id, 
            panchayatName: registeredPanchayat.localName || registeredPanchayat.name,
            riskType,
            riskLevel: 'CRITICAL',
            triggerReason: `Autonomous sensor threshold reached (Rain: ${rain}mm, Soil: ${soil}%, Temp: ${temp}°C)`,
            channel: 'VOICE_CALL',
            recipientCount: Math.max(targetFarmerCount, 1)
          });

          // Server approved first-time execution today!
          setDailyAlertStatus({
            alreadyExecutedToday: true,
            record: res.record,
            todayDate: res.record?.date_str
          });
          localStorage.setItem(localKey, 'executed');

          // Send desktop system notification to registered phone holder
          notificationService.sendSystemNotification({
            title: `🚨 Emergency Alert Dispatched to ${targetPhone}`,
            body: `Hazard condition detected in ${registeredPanchayat.name}. Voice advisory call ringing.`,
            tag: `auto-alert-${registeredPanchayat.id}`
          });

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

  const handleTestAutomatedAlert = async () => {
    const targetPanchayat = registeredPanchayat || selectedPanchayat;
    const regWeather = getWeatherDataForPanchayat(targetPanchayat);
    const riskType = regWeather?.current?.alertTriggerType || 'waterlogging';
    const targetPhone = currentUser?.phoneNumber || currentUser?.phone || '9392705998';

    // 1. Dispatch emergency alert directly to registered farmer's mobile
    try {
      await apiService.sendManualPhoneAlert(
        targetPhone,
        riskType,
        `Automated Emergency Weather Alert for ${targetPanchayat.localName || targetPanchayat.name}`
      );
    } catch (e) {
      console.warn('Manual phone alert dispatch warning:', e);
    }

    // 2. Dispatch risk alert to all registered farmers in this panchayat
    databaseService.dispatchPanchayatRiskAlert(
      targetPanchayat.id,
      riskType,
      'Automated Weather Sentinel Test'
    );

    // 3. Update server record
    try {
      const res = await apiService.triggerDailyAlert({
        panchayatId: targetPanchayat.id,
        panchayatName: targetPanchayat.localName || targetPanchayat.name,
        riskType,
        riskLevel: 'CRITICAL',
        triggerReason: 'Automated Emergency Weather Advisory Test',
        channel: 'VOICE_CALL',
        recipientCount: 1
      });
      setDailyAlertStatus({
        alreadyExecutedToday: true,
        record: res.record,
        todayDate: res.record?.date_str
      });
    } catch (e) {
      setDailyAlertStatus({
        alreadyExecutedToday: true,
        record: { panchayat_name: targetPanchayat.name, date_str: new Date().toISOString().slice(0, 10) },
        todayDate: new Date().toISOString().slice(0, 10)
      });
    }

    // 4. Send desktop system notification
    notificationService.sendSystemNotification({
      title: `🚨 Automated Alert to ${targetPhone}`,
      body: `Emergency call initiated for ${targetPanchayat.localName || targetPanchayat.name}. Answer call now.`,
      tag: `test-alert-${Date.now()}`
    });

    // 5. Open incoming call HUD with ringing audio and Indic speech
    setActiveAlertTrigger(riskType);
    setIsIncomingCallOpen(true);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    streamingWeatherService.fetchLiveHourlyForecast(selectedPanchayat).then(hourly => {
      if (hourly && hourly.length > 0) {
        setLiveHourlyForecast(hourly);
      }
    }).finally(() => {
      setStreamTick(t => t + 1);
      setIsRefreshing(false);
    });
  };

  const handleTriggerAlert = (alertType = 'waterlogging') => {
    setActiveAlertTrigger(alertType);
    setIsIncomingCallOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.assignedPanchayatId) {
      setSelectedPanchayat(resolvePanchayat(user.assignedPanchayatId));
    }
    if (user.preferredLanguage && ['en', 'te', 'hi', 'ta', 'mr', 'kn', 'pa', 'bn'].includes(user.preferredLanguage)) {
      handleLanguageChange(user.preferredLanguage);
    }
    if (user.role === 'admin') {
      setIsAdminView(true);
    } else {
      setIsAdminView(false);
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
        onLanguageChange={handleLanguageChange}
        t={t}
      />
    );
  }

  // Once authenticated: Render accordingly based on role (Admin vs Farmer User)
  const registeredPanchayat = resolvePanchayat(currentUser?.assignedPanchayatId);

  return (
    <div className="min-h-screen agro-mesh-bg text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Universal Top Navigation */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
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
              registeredPhone={currentUser?.phoneNumber || currentUser?.phone || '9392705998'}
              onOpenCallHUD={() => handleTriggerAlert(weatherData?.current?.alertTriggerType || 'waterlogging')}
              currentLang={currentLang}
              t={t}
            />

            {/* Browsing Banner when viewing a Panchayat other than Registered Alert Location */}
            {selectedPanchayat?.id && registeredPanchayat?.id && selectedPanchayat.id !== registeredPanchayat.id && (
              <div className="p-4 rounded-3xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-200/80 flex items-center justify-center font-bold text-amber-900 shrink-0">
                    📍
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block">
                      {t.viewingOtherPanchayat || 'Viewing Weather Forecast for'} {selectedPanchayat.localName || selectedPanchayat.name}
                    </span>
                    <span className="text-xs text-amber-800">
                      {t.alertLockNotice || 'Note: Severe weather automated phone calls & SMS alerts remain strictly locked to your registered location'} ({registeredPanchayat.localName || registeredPanchayat.name}).
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPanchayat(registeredPanchayat)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 self-start sm:self-auto transition-all shadow-sm"
                >
                  {t.returnToAlertHub || '↩️ Return to My Alert Hub'}
                </button>
              </div>
            )}

            {/* District -> Mandal -> Panchayat Selector (Available to ALL users to browse any location) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    {t.exploringWeatherPrompt || 'Explore Weather Forecast across all 13,326 Gram Panchayats:'}
                  </span>
                  {selectedPanchayat?.id && registeredPanchayat?.id && selectedPanchayat.id === registeredPanchayat.id && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                      {t.registeredHubNotice || '✓ Your Registered Alert Hub'}
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
        onLanguageChange={handleLanguageChange}
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
        recipientPhone={currentUser?.phoneNumber || currentUser?.phone || '9392705998'}
        currentLang={currentLang}
        t={t}
      />

      {/* Language Switcher Modal */}
      <LanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        currentLang={currentLang}
        onSelectLanguage={handleLanguageChange}
        onSelectLang={handleLanguageChange}
        onLanguageChange={handleLanguageChange}
      />

    </div>
  );
}
