import React, { useState } from 'react';
import { Calendar, Clock, CalendarRange, CloudRain, Sun, Wind, Droplets, ShieldAlert, CheckCircle2, AlertTriangle, Cloud, CloudLightning, Zap } from 'lucide-react';
import { getLocalizedCondition } from '../data/weatherData';

export default function ForecastTabs({
  weather,
  weatherData,
  selectedPanchayat,
  panchayat,
  currentLang = 'en',
  t = {}
}) {
  const [activeTab, setActiveTab] = useState('3day'); // '3day' | '1week' | '1month'
  const [hourlyDayFilter, setHourlyDayFilter] = useState('Today'); // 'Today' | 'Tomorrow' | 'Day 3' | 'All'
  const effectiveWeather = weatherData || weather || {};
  const { threeDayHourly = [], oneWeekForecast = [], oneMonthOutlook = {} } = effectiveWeather;

  const DAY_MAP = {
    Today: { te: "ఈరోజు", hi: "आज", ta: "இன்று", kn: "ಇಂದು", mr: "आज", pa: "ਅੱਜ", bn: "আজ", en: "Today" },
    Tomorrow: { te: "రేపు", hi: "कल", ta: "நாளை", kn: "ನಾಳೆ", mr: "उद्या", pa: "ਕੱਲ੍ਹ", bn: "আগামীকাল", en: "Tomorrow" },
    "Day 3": { te: "ఎల్లుండి", hi: "परसों", ta: "நாளை மறுநாள்", kn: "ನಾಡಿದ್ದು", mr: "परवा", pa: "ਪਰਸੋਂ", bn: "পরশু", en: "Day 3" },
    Monday: { te: "సోమవారం", hi: "सोमवार", ta: "திங்கட்கிழமை", kn: "ಸೋಮವಾರ", mr: "सोमवार", pa: "ਸੋਮਵਾਰ", bn: "সোমবার", en: "Monday" },
    Tuesday: { te: "మంగళవారం", hi: "मंगलवार", ta: "செவ்வாய்க்கிழமை", kn: "ಮಂಗಳವಾರ", mr: "मंगळवार", pa: "ਮੰਗਲਵਾਰ", bn: "মঙ্গলবার", en: "Tuesday" },
    Wednesday: { te: "బుధవారం", hi: "बुधवार", ta: "புதன்கிழமை", kn: "ಬುಧವಾರ", mr: "बुधवार", pa: "ਬੁੱਧਵਾਰ", bn: "বুধবার", en: "Wednesday" },
    Thursday: { te: "గురువారం", hi: "गुरुवार", ta: "வியாழக்கிழமை", kn: "ಗುರುವಾರ", mr: "गुरुवार", pa: "ਵੀਰਵਾਰ", bn: "বৃহস্পতিবার", en: "Thursday" },
    Friday: { te: "శుక్రవారం", hi: "शुक्रवार", ta: "வெள்ளிக்கிழமை", kn: "ಶುಕ್ರವಾರ", mr: "शुक्रवार", pa: "ਸ਼ੁੱਕਰਵਾਰ", bn: "শুক্রবার", en: "Friday" },
    Saturday: { te: "శనివారం", hi: "शनिवार", ta: "சனிக்கிழமை", kn: "ಶನಿವಾರ", mr: "शनिवार", pa: "ਸ਼ਨੀਵਾਰ", bn: "শনিবার", en: "Saturday" },
    Sunday: { te: "ఆదివారం", hi: "रविवार", ta: "ஞாயிற்றுக்கிழமை", kn: "ಭಾನುವಾರ", mr: "रविवार", pa: "ਐਤਵਾਰ", bn: "রবিবার", en: "Sunday" }
  };

  const getDayName = (dayStr) => {
    if (DAY_MAP[dayStr] && DAY_MAP[dayStr][currentLang]) {
      return DAY_MAP[dayStr][currentLang];
    }
    return dayStr;
  };

  const getSprayBadgeText = (sprayStr) => {
    if (sprayStr.includes("Prohibited") || sprayStr.includes("Not")) return t.sprayProhibited || "Prohibited";
    if (sprayStr.includes("Risky") || sprayStr.includes("Moderate")) return t.sprayRisky || "Risky";
    return t.spraySafe || "Safe";
  };

  const getPestRiskBadge = (riskStr) => {
    if (riskStr.includes("High")) return t.highRisk || (currentLang === 'te' ? "అధిక ప్రమాదం" : currentLang === 'hi' ? "उच्च जोखिम" : "High Risk");
    if (riskStr.includes("Medium") || riskStr.includes("Moderate")) return t.mediumRisk || (currentLang === 'te' ? "మధ్యస్థం" : currentLang === 'hi' ? "मध्यम" : "Medium Risk");
    return t.lowRisk || (currentLang === 'te' ? "తక్కువ" : currentLang === 'hi' ? "कम" : "Low Risk");
  };

  const DAYS_WORD = { te: "రోజులు", hi: "दिन", ta: "நாட்கள்", kn: "ದಿನಗಳು", mr: "दिवस", pa: "ਦਿਨ", bn: "দিন", en: "Days" };
  const SPELLS_WORD = { te: "తేలికపాటి జల్లులు", hi: "रुक-रुक कर बारिश", ta: "விட்டு விட்டு மழை", kn: "ಮಧ್ಯಂತರ ಮಳೆ", mr: "थांबून थांबून पाऊस", pa: "ਰੁਕ-ਰੁਕ ਕੇ ਮੀਂਹ", bn: "মাঝে মাঝে বৃষ্টি", en: "Intermittent Spells" };
  const DAY_NIGHT_WORD = { te: "పగలు / రాత్రి", hi: "दिन / रात", ta: "பகல் / இரவு", kn: "ಹಗಲು / ರಾತ್ರಿ", mr: "दिवस / रात्र", pa: "ਦਿਨ / ਰਾਤ", bn: "দিন / रात", en: "Day / Night" };
  const WEEK_WORD = { te: "వారం", hi: "सप्ताह", ta: "வாரம்", kn: "ವಾರ", mr: "आठवडा", pa: "ਹਫ਼ਤਾ", bn: "সপ্তাহ", en: "Week" };
  const SOIL_MOISTURE_WORD = { te: "నేలలో తేమ", hi: "मिट्टी की नमी", ta: "மண் ஈரப்பதம்", kn: "ಮಣ್ಣಿನ ತೇವಾಂಶ", mr: "मातीतील ओलावा", pa: "ਮਿੱਟੀ ਦੀ ਨਮੀ", bn: "মাটির আর্দ্রতা", en: "Soil Moisture" };

  const renderWeatherIcon = (item) => {
    const cond = item.condition || '';
    if (cond.includes("Thunderstorm")) {
      return <CloudLightning className="w-5 h-5 text-purple-600" />;
    }
    if (item.rainMm > 0 || item.rainProb > 40 || cond.includes("Rain") || cond.includes("Drizzle") || cond.includes("Squall") || cond.includes("Showers")) {
      return <CloudRain className="w-5 h-5 text-blue-500" />;
    }
    if (cond.includes("Cloud") || cond.includes("Overcast") || cond.includes("Fog")) {
      return <Cloud className="w-5 h-5 text-slate-500" />;
    }
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
      
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>{t.forecastHorizonsTitle || "Downscaled Agro-Weather Forecast Horizons"}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.forecastHorizonsSubtitle || "Micro-forecasts engineered for critical farm operations: spraying, irrigation, and crop planning"}
          </p>
        </div>

        {/* 3 Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('3day')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === '3day'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t.horizon3Day}</span>
          </button>

          <button
            onClick={() => setActiveTab('1week')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === '1week'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.horizon1Week}</span>
          </button>

          <button
            onClick={() => setActiveTab('1month')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === '1month'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>{t.horizon1Month}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 3-Day Hourly Forecast (1-Hour Intervals) */}
      {activeTab === '3day' && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-600 px-1">
            <div className="flex items-center gap-2">
              <span>{t.hourlyPrecipSub || (currentLang === 'te' ? "ప్రతి గంట వర్షపాతం, ఉష్ణోగ్రత మరియు మందుల పిచికారీ భద్రత వివరాలు:" : "Hourly precipitation, temperature curve, and real-time spraying safety window:")}</span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 shrink-0">
                ⚡ 1-hr updates
              </span>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0">
              {['Today', 'Tomorrow', 'Day 3', 'All'].map((d) => (
                <button
                  key={d}
                  onClick={() => setHourlyDayFilter(d)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    hourlyDayFilter === d
                      ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d === 'All' ? (currentLang === 'te' ? 'అన్నీ (72 గం)' : 'All (72 hrs)') : `${getDayName(d)} (24 hrs)`}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto pb-3">
            <div className="flex gap-2.5 min-w-max">
              {(threeDayHourly || [])
                .filter(item => hourlyDayFilter === 'All' || item.day === hourlyDayFilter)
                .map((item, idx) => {
                  const isProhibited = item.sprayWindow.includes("Prohibited");
                  const isSafe = item.sprayWindow.includes("Safe") || item.sprayWindow.includes("Optimal");
                  return (
                    <div
                      key={idx}
                      className="w-[125px] bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-2xl p-3 border border-slate-200 flex flex-col justify-between text-center shadow-sm shrink-0"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-0.5">
                          <span className="uppercase tracking-wider">{getDayName(item.day)}</span>
                          {item.isLiveApi && (
                            <span className="text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-700 rounded font-mono">Live</span>
                          )}
                        </div>
                        <span className="text-xs font-black text-slate-800 block mb-1">
                          {item.time}
                        </span>

                        <div className="my-1.5 flex flex-col items-center justify-center gap-1 min-h-[46px]">
                          {renderWeatherIcon(item)}
                          <span className="text-[10px] text-slate-600 font-medium leading-tight line-clamp-1" title={getLocalizedCondition(item.condition, currentLang)}>
                            {getLocalizedCondition(item.condition, currentLang) || item.condition}
                          </span>
                        </div>

                        <p className="text-lg font-black text-slate-900">{item.temp}°C</p>
                        
                        <div className="mt-1 text-[11px] font-bold text-blue-700">
                          {item.rainMm > 0 ? `${item.rainMm} mm` : '0 mm'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          {item.rainProb}% {t.rainLabel || (currentLang === 'te' ? "వర్షం" : "Rain")}
                        </div>

                        <div className="mt-1.5 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
                          {item.humidity !== undefined && <span title="Humidity">💧 {item.humidity}%</span>}
                          {item.wind !== undefined && <span title="Wind">💨 {item.wind}k</span>}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          {t.sprayWindowLabel || "Spray Window"}
                        </span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md inline-block leading-tight ${
                          isProhibited 
                            ? 'bg-red-100 text-red-800' 
                            : isSafe 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {getSprayBadgeText(item.sprayWindow)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 1-Week Trend Forecast */}
      {activeTab === '1week' && (
        <div className="mt-5 space-y-3">
          <p className="text-xs text-slate-500 mb-2">
            {t.sevenDayTrajectory || (currentLang === 'te' ? "రాగల 7 రోజుల వాతావరణ ధోరణి, వర్షపాతం అంచనా మరియు సిఫార్సు చేయబడిన రైతు పనులు:" : "7-day agro-meteorological trajectory including daily rainfall estimates and farm activity guidance:")}
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {oneWeekForecast.map((day, idx) => (
              <div
                key={idx}
                className="bg-slate-50 hover:bg-slate-100/60 transition-all rounded-2xl p-3.5 sm:p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sm:text-sm"
              >
                {/* Day & Condition */}
                <div className="flex items-center gap-3 md:w-1/4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm shrink-0">
                    {day.rainProb > 40 ? <CloudRain className="w-5 h-5 text-blue-600" /> : <Sun className="w-5 h-5 text-amber-600" />}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      {getDayName(day.day)} <span className="text-xs text-slate-400 font-normal">({day.date})</span>
                    </h4>
                    <span className="text-xs text-slate-600 font-medium">{getLocalizedCondition(day.condition, currentLang)}</span>
                  </div>
                </div>

                {/* Temps & Rain */}
                <div className="flex items-center gap-4 md:w-1/4">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold">{t.avgTempsLabel || "Temp (Max/Min)"}</span>
                    <span className="font-black text-slate-900">{day.maxTemp}° / {day.minTemp}°C</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold">{t.expectedRainLabel || "Rain"}</span>
                    <span className="font-bold text-blue-700">{day.expectedRainMm} mm ({day.rainProb}%)</span>
                  </div>
                </div>

                {/* Pest Risk */}
                <div className="flex items-center gap-3 md:w-1/6">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold">{t.pestRiskLabel || "Pest Risk"}</span>
                    <span className={`px-2.5 py-0.5 rounded-md font-black text-xs ${
                      day.pestRisk.includes("High")
                        ? 'bg-red-100 text-red-800'
                        : day.pestRisk.includes("Medium")
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {getPestRiskBadge(day.pestRisk)}
                    </span>
                  </div>
                </div>

                {/* Recommended Farm Activity */}
                <div className="md:w-1/3 bg-white p-3 rounded-xl border border-slate-200/80 text-slate-700 text-xs">
                  <span className="font-bold text-emerald-800 block text-[10px] uppercase">{t.farmActivityLabel || "Farmer Recommendation"}:</span>
                  <span className="font-medium">{day.farmActivity}</span>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 1-Month Agro-Meteorological Seasonal Outlook */}
      {activeTab === '1month' && (
        <div className="mt-5 space-y-4">
          
          {/* Summary Box */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-800">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                {t.monthlyProjectionTitle || "Monthly Agro-Meteorological Projection (Next 30 Days)"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                {oneMonthOutlook.monthlySummary.rainfallDeviation}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-emerald-300 text-[11px] block">{t.expectedRainLabel || "Expected Rain"}</span>
                <strong className="text-xl font-black text-white">{oneMonthOutlook.monthlySummary.totalExpectedRainMm} mm</strong>
                <span className="text-emerald-400 text-[10px] block">{t.normalLabel || "Normal"}: {oneMonthOutlook.monthlySummary.historicalAverageRainMm} mm</span>
              </div>
              <div>
                <span className="text-emerald-300 text-[11px] block">{t.rainyDaysLabel || "Rainy Days"}</span>
                <strong className="text-xl font-black text-white">{oneMonthOutlook.monthlySummary.rainyDaysCount} {DAYS_WORD[currentLang] || "Days"}</strong>
                <span className="text-emerald-400 text-[10px] block">{SPELLS_WORD[currentLang] || "Intermittent Spells"}</span>
              </div>
              <div>
                <span className="text-emerald-300 text-[11px] block">{t.avgTempsLabel || "Average Temps"}</span>
                <strong className="text-xl font-black text-white">{oneMonthOutlook.monthlySummary.averageDayTemp}° / {oneMonthOutlook.monthlySummary.averageNightTemp}°C</strong>
                <span className="text-emerald-400 text-[10px] block">{DAY_NIGHT_WORD[currentLang] || "Day / Night"}</span>
              </div>
              <div>
                <span className="text-emerald-300 text-[11px] block">{t.cropSuitabilityLabel || "Overall Crop Suitability"}</span>
                <strong className="text-xs font-bold text-emerald-200 block mt-1">{oneMonthOutlook.monthlySummary.overallSuitability}</strong>
              </div>
            </div>
          </div>

          {/* 4 Weeks Detailed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {oneMonthOutlook.weeks.map((wk, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-black text-slate-900 text-sm">
                    {(WEEK_WORD[currentLang] || "Week") + " " + (idx + 1)}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                    {wk.expectedRainfall}
                  </span>
                </div>

                <div className="text-slate-800 font-bold text-xs text-emerald-800">
                  {wk.theme}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 py-1">
                  <div>
                    <span className="block text-[10px]">{SOIL_MOISTURE_WORD[currentLang] || "Soil Moisture"}</span>
                    <strong className="text-slate-800">{wk.soilMoistureTrend}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px]">{t.drySpellRiskLabel || "Dry Spell"}</span>
                    <strong className="text-slate-800">{wk.drySpellRisk}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px]">{t.heatStressLabel || "Heat Stress"}</span>
                    <strong className="text-slate-800">{wk.heatStressRisk}</strong>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-slate-700 leading-relaxed text-xs">
                  <strong className="text-slate-900 block text-[10px] uppercase font-bold text-emerald-800">{t.advisoryHeading || "Advisory:"}</strong>
                  {wk.cultivationAdvisory}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
