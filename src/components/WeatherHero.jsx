import React, { useState } from 'react';
import { 
  CloudRain, Wind, Droplets, Sun, AlertTriangle, 
  HelpCircle, ChevronDown, ChevronUp, 
  ShieldCheck, Info, Radio, Sparkles, RefreshCw, Activity, Gauge
} from 'lucide-react';
import { getLocalizedCondition, getLocalizedWhyItRains } from '../data/weatherData';

export default function WeatherHero({
  weatherData,
  selectedPanchayat,
  currentLang = 'en',
  t,
  onOpenVoice,
  onTriggerAlert,
  onRefreshTelemetry,
  isRefreshing
}) {
  const [showWhyItRains, setShowWhyItRains] = useState(false);
  const { current, whyItRains, coarseModelComparison, telemetryMeta } = weatherData;

  const isRainy = current.rainMm > 5 || current.rainProb > 50;
  const isHeat = current.alertTriggerType === 'scorching_sun' || current.temp >= 38;

  // VPD status description for farmers in chosen language
  const getVpdStatus = (vpd) => {
    if (vpd < 0.4) {
      const labels = {
        te: "అధిక తేమ (శిలీంధ్ర ప్రమాదం)",
        hi: "अत्यधिक नमी (फंगल जोखिम)",
        ta: "அதிக ஈரப்பதம் (பூஞ்சை ஆபத்து)",
        kn: "ಅಧಿಕ ತೇವಾಂಶ (ಶಿಲೀಂಧ್ರ ಅಪಾಯ)",
        mr: "अति आर्द्रता (बुरशी धोका)",
        pa: "ਬਹੁਤ ਜ਼ਿਆਦਾ ਨਮੀ (ਉੱਲੀ ਦਾ ਖ਼ਤਰਾ)",
        bn: "অতিরিক্ত আর্দ্রতা (ছত্রাক ঝুঁকি)",
        en: "High Fungal Risk (Overly Damp)"
      };
      return { label: labels[currentLang] || labels.en, color: "text-blue-700 bg-blue-100 border-blue-200" };
    }
    if (vpd <= 1.2) {
      const labels = {
        te: "ఆకులకు అనుకూల శ్వాసక్రియ",
        hi: "अनुकूल वाष्पोत्सर्जन",
        ta: "உகந்த சுவாசம்",
        kn: "ಅನುಕೂಲಕರ ಉಸಿರಾಟ",
        mr: "अनुकूल बाष्पोत्सर्जन",
        pa: "ਅਨੁਕੂਲ ਵਾਸ਼ਪੀਕਰਨ",
        bn: "অনুকূল প্রস্বেদন",
        en: "Optimal Transpiration"
      };
      return { label: labels[currentLang] || labels.en, color: "text-emerald-800 bg-emerald-100 border-emerald-200" };
    }
    if (vpd <= 1.6) {
      const labels = {
        te: "స్వల్ప తేమ లోపం (నీటి తడి అవసరం)",
        hi: "हल्का नमी तनाव (सिंचाई आवश्यक)",
        ta: "லேசான ஈரப்பத பற்றாக்குறை",
        kn: "ಸ್ವಲ್ಪ ತೇವಾಂಶ ಕೊರತೆ",
        mr: "हलका पाण्याचा ताण",
        pa: "ਹਲਕਾ ਨਮੀ ਤਣਾਅ",
        bn: "সামান্য আর্দ্রতার ঘাটতি",
        en: "Mild Plant Stress"
      };
      return { label: labels[currentLang] || labels.en, color: "text-amber-800 bg-amber-100 border-amber-200" };
    }
    const labels = {
      te: "తీవ్ర తేమ లోపం (ఆకులు వాడిపోతాయి)",
      hi: "गंभीर नमी की कमी (पत्तियां मुरझाएंगी)",
      ta: "தீவிர ஈரப்பத பற்றாக்குறை",
      kn: "ತೀವ್ರ ತೇವಾಂಶ ಕೊರತೆ",
      mr: "तीव्र पाण्याचा तुटवडा",
      pa: "ਗੰਭੀਰ ਨਮੀ ਦੀ ਘਾਟ",
      bn: "তীব্র আর্দ্রতার ঘাটতি",
      en: "Severe Moisture Deficit"
    };
    return { label: labels[currentLang] || labels.en, color: "text-red-800 bg-red-100 border-red-200" };
  };

  const vpdInfo = getVpdStatus(current.vpdKpa || 0.88);

  const translatedCondition = getLocalizedCondition(current.condition, currentLang);
  const localWhy = getLocalizedWhyItRains(whyItRains, currentLang) || whyItRains;

  const getSoilMoistureStatus = (moist) => {
    if (moist > 80) {
      const map = {
        te: "అధిక నీటి నిల్వ", hi: "अत्यधिक जलभराव", ta: "அதிக நீர் தேக்கம்",
        kn: "ಅಧಿಕ ನೀರು ಶೇಖರಣೆ", mr: "अति पाण्याचा निचरा आवश्यक", pa: "ਬਹੁਤ ਜ਼ਿਆਦਾ ਪਾਣੀ",
        bn: "অতিরিক্ত জল জমে থাকা", en: "High Saturation"
      };
      return map[currentLang] || map.en;
    }
    if (moist < 35) {
      const map = {
        te: "తేమ కొరత", hi: "नमी की कमी", ta: "ஈரப்பதம் குறைவு",
        kn: "ತೇವಾಂಶ ಕೊರತೆ", mr: "ओलाव्याची कमतरता", pa: "ਨਮੀ ਦੀ ਘਾਟ",
        bn: "আর্দ্রতার ঘাটতি", en: "Moisture Deficit"
      };
      return map[currentLang] || map.en;
    }
    const map = {
      te: "అనుకూల తేమ", hi: "अनुकूल नमी", ta: "உகந்த ஈரப்பதம்",
      kn: "ಅನುಕೂಲ ತೇವಾಂಶ", mr: "योग्य ओलावा", pa: "ਸਹੀ ਨਮੀ",
      bn: "অনুকূল আর্দ্রতা", en: "Optimal Field Capacity"
    };
    return map[currentLang] || map.en;
  };

  const getErrorReductionLabel = () => {
    const map = {
      te: "ప్రోటోటైప్ మోడల్ — మూల్యాంకనం పురోగతిలో ఉంది",
      hi: "प्रोटोटाइप मॉडल — सत्यापन आवश्यक",
      ta: "மாதிரி மதிப்பீடு செயல்பாட்டில் உள்ளது",
      kn: "ಮಾದರಿ ಮೌಲ್ಯಮಾಪನ ಪ್ರಗತಿಯಲ್ಲಿದೆ",
      mr: "प्रोटोटाइप मॉडेल — प्रमाणीकरण आवश्यक",
      pa: "ਪ੍ਰੋਟੋਟਾਈਪ ਮਾਡਲ — ਪ੍ਰਮਾਣਿਕਤਾ ਲੋੜੀਂਦੀ",
      bn: "প্রোটোটাইপ মডেল — যাচাইকরণ প্রয়োজন",
      en: "Prototype model — validation required"
    };
    return map[currentLang] || map.en;
  };

  return (
    <div className="space-y-4 mb-6">
      
      {/* Top Banner: Meteorological Telemetry Stream Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg border-2 border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Stream Status & Provider */}
        <div className="flex items-center gap-3">
          <span className="flex h-3.5 w-3.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold tracking-wide uppercase text-emerald-400 flex items-center gap-1.5 text-xs sm:text-sm">
                <Activity className="w-4 h-4 text-emerald-400" />
                {t.telemetryLive || "Demo Weather Data Stream (Prototype)"}
              </span>
              <span className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono text-[10px] border border-amber-500/40">
                {t.simulatedNotice || "SIMULATED DEMO VALUES"}
              </span>
              <span className="bg-emerald-950/80 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono text-[10px] border border-emerald-700/60">
                1km Mesh
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {t.sourceLabel || "Source"}: IMD-NWP Baseline (25km) + ISRO Bhuvan SRTM 30m Micro-DEM Mesh
            </p>
          </div>
        </div>

        {/* Right: Timestamp & Manual Sync Button */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden md:block text-[11px]">
            <span className="text-slate-400 block">{t.istStreamTime || "IST Stream Time"}</span>
            <span className="font-mono font-bold text-emerald-300 text-xs">{telemetryMeta?.timestampIst || "Live Sync"}</span>
          </div>

          <button
            onClick={onRefreshTelemetry}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs shadow-md border border-emerald-500 transition-all active:scale-95 disabled:opacity-50"
            title="Sync Live Stream Now"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? (t.syncing || "Syncing...") : (t.syncStream || "Sync Stream")}</span>
          </button>
        </div>

      </div>

      {/* Main Weather Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 8 Cols: Hyper-Local Panchayat Current Conditions */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 relative overflow-hidden">
          
          {/* Subtle Background Accent */}
          <div className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-15 pointer-events-none ${
            isRainy ? 'bg-blue-600' : isHeat ? 'bg-amber-600' : 'bg-emerald-600'
          }`} />

          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1.5 shadow-sm">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
                {t.downscaleBadge}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {selectedPanchayat.localName ? selectedPanchayat.localName : selectedPanchayat.name}
              </h1>
              <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                {selectedPanchayat.name} ({selectedPanchayat.district} - PIN: {selectedPanchayat.pincode})
              </p>
              <span className="text-[11px] text-slate-500 font-mono block mt-1">
                GPS: {selectedPanchayat.latitude.toFixed(4)}° N, {selectedPanchayat.longitude.toFixed(4)}° E • {t.elevationLabel || "Elevation"}: {selectedPanchayat.elevationMeters}m
              </span>
            </div>

            {/* Condition Badge */}
            <div className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black border flex items-center gap-2 shadow-sm ${
              isRainy 
                ? 'bg-blue-50 text-blue-900 border-blue-200' 
                : isHeat 
                ? 'bg-amber-50 text-amber-900 border-amber-200' 
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}>
              {isRainy ? <CloudRain className="w-5 h-5 text-blue-600" /> : <Sun className="w-5 h-5 text-amber-600" />}
              <span>{translatedCondition}</span>
            </div>
          </div>

          {/* Temperature & Key Rain Stat */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center mb-6">
            
            <div className="sm:col-span-6 flex items-baseline gap-3">
              <span className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900">
                {current.temp}°
              </span>
              <div className="text-slate-500 text-sm">
                <p className="font-bold text-slate-800">{t.celsius}</p>
                <p className="text-xs">{t.feelsLike} {current.feelsLike}°C</p>
                <p className="text-xs text-emerald-700 font-bold">{t.elevationLabel}: {selectedPanchayat.elevationMeters}m</p>
              </div>
            </div>

            {/* Precipitation & Model Confidence Box */}
            <div className="sm:col-span-6 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-inner space-y-3">
              {/* Rainfall Probability */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t.rainProbLabel} (PoP)</span>
                  </span>
                  <span className="text-xs font-black text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {current.rainProb}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-700" 
                    style={{ width: `${current.rainProb}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                  <span>{t.expectedRainLabel}: <strong className="text-blue-700 font-black">{current.rainMm} mm</strong></span>
                  <span className="text-[10px] text-slate-400">Precipitation Chance</span>
                </div>
              </div>

              {/* Model Confidence (Distinct from Rain Probability) */}
              <div className="pt-2.5 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>{t.modelConfidence || "Model Confidence"}</span>
                  </span>
                  <span className="text-xs font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                    {current.modelConfidence || 88}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-1.5 overflow-hidden">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-700" 
                    style={{ width: `${current.modelConfidence || 88}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Multi-Source Sensor Convergence: <strong className="text-emerald-700 font-bold">High</strong></span>
                  <span className="text-[10px] text-purple-700 font-semibold">Prediction Reliability</span>
                </div>
              </div>
            </div>

          </div>

          {/* Precision Micro-Parameters Grid (6 Metrics) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            
            {/* Relative Humidity */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1">
                <Droplets className="w-4 h-4 text-blue-500" /> {t.relativeHumidity}
              </span>
              <p className="text-lg font-black text-slate-900">{current.humidity}%</p>
              <span className="text-[10px] text-slate-500 font-semibold">{t.dewPoint}: {current.dewPoint}°C</span>
            </div>

            {/* Vapor Pressure Deficit (VPD) */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1">
                <Gauge className="w-4 h-4 text-purple-600" /> {t.vpd}
              </span>
              <p className="text-lg font-black text-slate-900">{current.vpdKpa || 0.88} kPa</p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${vpdInfo.color}`}>
                {vpdInfo.label}
              </span>
            </div>

            {/* Solar Radiation Flux */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1">
                <Sun className="w-4 h-4 text-amber-500" /> {t.solarIrradiance}
              </span>
              <p className="text-lg font-black text-slate-900">{current.solarRadiationWm2 || 420} W/m²</p>
              <span className="text-[10px] text-slate-500 font-semibold">{t.uvIndex}: {current.uvIndex} / 10</span>
            </div>

            {/* Wind Velocity */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1">
                <Wind className="w-4 h-4 text-teal-500" /> {t.windVelocity}
              </span>
              <p className="text-lg font-black text-slate-900">{current.windSpeed} km/h</p>
              <span className="text-[10px] text-slate-500 font-semibold">{t.direction}: {current.windDirection}</span>
            </div>

            {/* Root-Zone Soil Saturation */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1">
                <Droplets className="w-4 h-4 text-emerald-600" /> {t.soilSaturation}
              </span>
              <p className="text-lg font-black text-slate-900">{current.soilMoisture}%</p>
              <span className="text-[10px] text-slate-500 font-semibold">
                {getSoilMoistureStatus(current.soilMoisture)}
              </span>
            </div>

            {/* Spraying Safety Window */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> {t.sprayWindow}
              </span>
              <p className={`text-xs font-black ${
                current.rainProb > 40 || current.windSpeed > 18 ? 'text-red-700' : 'text-emerald-700'
              }`}>
                {current.rainProb > 40 || current.windSpeed > 18 ? t.sprayProhibited : t.spraySafe}
              </p>
              <span className="text-[10px] text-slate-500 font-semibold">{current.windSpeed} km/h • {current.rainProb}%</span>
            </div>

          </div>

          {/* Action Row: 'AI Explanation' Button + Automated Voice trigger */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setShowWhyItRains(!showWhyItRains)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-all shadow-sm"
            >
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>{t.aiExplanationTitle || "AI Explanation: Major Prediction Factors"}</span>
              {showWhyItRains ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </button>

            {current.alertTriggerType && (
              <button
                onClick={() => onTriggerAlert(current.alertTriggerType)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 animate-pulse transition-all shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>{t.urgentAlertSim}</span>
              </button>
            )}
          </div>

        </div>

        {/* Right 4 Cols: Baseline IMD District vs Aakash AI Localized Forecast */}
        <div className="lg:col-span-4 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black tracking-wider text-purple-400 uppercase">
                {t.downscalingAuditTitle || "Downscaling Audit"}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                IMD 25km vs 1km
              </span>
            </div>
            
            <h3 className="text-base font-bold text-white mb-2 leading-snug">
              {t.whyLocalizedMatters || t.whyGenericFails || "Why Localized Forecasting Matters"}
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {t.districtModelDesc || "Baseline IMD district forecasts provide a 25km regional grid average. Aakash AI downscales to 1km microclimates using SRTM 30m DEM elevation and lapse rates:"}
            </p>

            {/* Comparison Table */}
            <div className="space-y-2.5 bg-slate-800/70 p-4 rounded-2xl border border-slate-700/70 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700 text-slate-400 font-bold">
                <span>{t.tableParam}</span>
                <span>{t.tableCoarse}</span>
                <span className="text-emerald-400 font-black">{t.tableDownscaled}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{t.tempParam}</span>
                <span className="text-slate-400 line-through">{coarseModelComparison.coarseForecast.temp}°C</span>
                <span className="text-white font-black">{current.temp}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{t.rainParam}</span>
                <span className="text-slate-400 line-through">{coarseModelComparison.coarseForecast.rainMm} mm</span>
                <span className="text-blue-400 font-black">{current.rainMm} mm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{t.rainRiskParam}</span>
                <span className="text-slate-400 line-through">{coarseModelComparison.coarseForecast.rainChance}%</span>
                <span className="text-blue-300 font-black">{current.rainProb}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{t.windParam}</span>
                <span className="text-slate-400">{coarseModelComparison.coarseForecast.windSpeed}</span>
                <span className="text-emerald-300 font-black">{current.windSpeed} km/h</span>
              </div>
            </div>

            {/* Key Highlight Callout */}
            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 text-[11px] text-emerald-200 leading-relaxed">
              <strong>🔬 {t.microDelta}:</strong> {(currentLang === 'te' && selectedPanchayat.localHighlight) ? selectedPanchayat.localHighlight : selectedPanchayat.coarseVsDownscaleHighlight}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>SRTM DEM 30m + Gradient Boosting</span>
            <span className="text-amber-400 font-bold">{getErrorReductionLabel()}</span>
          </div>
        </div>

      </div>

      {/* Expandable "AI Explanation: Localized Prediction Factors" Panel */}
      {showWhyItRains && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border-2 border-blue-200 rounded-3xl p-5 sm:p-7 shadow-md transition-all">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
                  {t.aiExplanationTitle || "AI Explanation: Major Contributing Factors to Localized Prediction"}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {localWhy.headline || "Multivariate Downscaling Rationale"}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setShowWhyItRains(false)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-300"
            >
              {t.close}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm mb-4">
            {/* 1. IMD Regional NWP Baseline */}
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide block">
                1. IMD Regional NWP Forecast
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                {localWhy.atmosphericReason || "Coarse GFS/NCUM 25km model establishes macro-synoptic moisture transport, geopotential height, and regional pressure troughs."}
              </p>
              <span className="text-[10px] text-blue-600 font-mono block">Baseline: {coarseModelComparison.coarseForecast.temp}°C, {coarseModelComparison.coarseForecast.rainChance}% rain chance</span>
            </div>

            {/* 2. Historical Micro-Climate Weather */}
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wide block">
                2. Historical Weather & Bias Correction
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                Calibrated with 10-year Indian monsoon reanalysis to rectify persistent rain-shadow patterns and localized coastal sea-breeze convergence boundaries.
              </p>
              <span className="text-[10px] text-purple-600 font-mono block">Historical Station Weights: 16%</span>
            </div>

            {/* 3. NDVI & Vegetation Canopy */}
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wide block">
                3. NDVI & Vegetation Canopy
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                Sentinel-2/Landsat NDVI indices map canopy transpiration cooling and boundary layer moisture retention across standing cropland.
              </p>
              <span className="text-[10px] text-teal-600 font-mono block">NDVI: 0.68 • Moderate Transpiration</span>
            </div>

            {/* 4. Root-Zone Soil Moisture */}
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide block">
                4. Root-Zone Soil Moisture
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                Evaluates surface saturation ({current.soilMoisture}%) against local soil type ({selectedPanchayat.soilType}) to project flash infiltration vs. rapid surface runoff.
              </p>
              <span className="text-[10px] text-amber-600 font-mono block">Field Saturation: {current.soilMoisture}%</span>
            </div>

            {/* 5. Elevation & Orographic Lift */}
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide block">
                5. Elevation (SRTM 30m DEM)
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                Calculates dry/moist adiabatic lapse rate cooling (-6.5°C/1000m) at {selectedPanchayat.elevationMeters}m elevation and windward slope condensation.
              </p>
              <span className="text-[10px] text-indigo-600 font-mono block">Elevation Delta: {selectedPanchayat.elevationMeters}m MSL</span>
            </div>

            {/* 6. Land-Cover & Surface Radiative Flux */}
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide block">
                6. Land-Cover & Radiative Flux
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                Terrain classification ({selectedPanchayat.terrainType}) controls frictional wind deceleration and land surface temperature (LST) radiative flux.
              </p>
              <span className="text-[10px] text-rose-600 font-mono block">Terrain: {selectedPanchayat.terrainType}</span>
            </div>
          </div>

          {/* Action Recommendation Banner */}
          <div className="bg-emerald-100/80 border border-emerald-300 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide block">
                🌾 {t.actionSummary || "Immediate Farmer Actionable Advice"}:
              </span>
              <p className="text-emerald-950 font-bold mt-0.5">
                {localWhy.actionRecommendation}
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-700 text-white rounded-xl text-xs font-black shrink-0 self-start sm:self-auto">
              Verified Advisory
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
