import React, { useState } from 'react';
import { Sprout, Tractor, AlertOctagon, Droplets, Sun, Wind, CheckCircle, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { ALL_CROPS, getLocalizedCropAdvisory, getLocalizedStage } from '../data/cropAdvisory';

export default function CropAdviser({
  selectedPanchayat,
  weatherData,
  currentLang = 'en',
  t
}) {
  // Proactive mode: 'standing' (current crop) vs 'new' (planning cultivation)
  const [advisoryMode, setAdvisoryMode] = useState('standing'); 
  const [selectedCropId, setSelectedCropId] = useState('cotton');
  const [selectedStage, setSelectedStage] = useState('');

  const activeCrop = ALL_CROPS.find(c => c.id === selectedCropId) || ALL_CROPS[0];
  const currentStage = selectedStage || activeCrop.stages[1] || activeCrop.stages[0];

  const currentCropLocalName = activeCrop.localNames[currentLang] || activeCrop.name;
  const localizedAdvisory = getLocalizedCropAdvisory(activeCrop, currentLang);

  const getStageDisplayName = (stg) => getLocalizedStage(stg, currentLang);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-emerald-100 text-emerald-800">
              <Sprout className="w-5 h-5 text-emerald-600" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {t.cropAdvisoryTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.tailoredFor || "Tailored for microclimate and soil conditions of"} {selectedPanchayat.localName || selectedPanchayat.name} ({selectedPanchayat.elevationMeters}m)
              </p>
            </div>
          </div>
        </div>

        {/* Proactive AI Decision Switcher (User Requirement) */}
        <div className="bg-emerald-50/80 p-1.5 rounded-2xl border border-emerald-200 flex items-center gap-1.5 self-start md:self-auto">
          <button
            onClick={() => setAdvisoryMode('standing')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              advisoryMode === 'standing'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>{t.standingCropBtn}</span>
          </button>

          <button
            onClick={() => setAdvisoryMode('new')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              advisoryMode === 'new'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            <Tractor className="w-4 h-4" />
            <span>{t.newCultivationBtn}</span>
          </button>
        </div>
      </div>

      {/* Proactive Assistant Banner */}
      <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-xs sm:text-sm font-bold text-emerald-950 leading-snug">
          {t.proactiveQuestion}
        </p>
      </div>

      {/* Crop Selector Grid */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
          {t.selectCropPrompt}:
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ALL_CROPS.map((crop) => {
            const isSelected = crop.id === activeCrop.id;
            const displayName = crop.localNames[currentLang] || crop.name;
            return (
              <button
                key={crop.id}
                onClick={() => {
                  setSelectedCropId(crop.id);
                  setSelectedStage(crop.stages[1] || crop.stages[0]);
                }}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-800 ring-2 ring-emerald-400 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-base">{crop.icon}</span>
                <span>{displayName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODE 1: Standing Crop Advisory */}
      {advisoryMode === 'standing' && (
        <div className="space-y-4">
          
          {/* Crop Stage Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-800">
                {t.selectStagePrompt} ({currentCropLocalName}):
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                {t.vulnerabilityLabel || "Vulnerability:"} <strong className="text-amber-800">{localizedAdvisory.waterloggingSensitivity}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeCrop.stages.map((stage, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedStage(stage)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    currentStage === stage
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {getStageDisplayName(stage)}
                </button>
              ))}
            </div>
          </div>

          {/* Actionable Agro-Advisory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            
            {/* 1. Waterlogging Risk & Mitigation */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <Droplets className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-blue-950 text-xs sm:text-sm">
                  {t.waterloggingAdvice}
                </h4>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">
                {localizedAdvisory.current.waterloggingRisk}
              </p>
              <div className="text-[11px] text-blue-950 font-semibold bg-blue-100/80 p-2.5 rounded-xl border border-blue-200">
                ⚡ {t.drainageStatus || "Drainage status:"} {t.soilSaturation || "Soil Saturation"} {weatherData.current.soilMoisture}%. {t.drainageAdviceNote || "Maintain clear outlet trenches."}
              </div>
            </div>

            {/* 2. Scorching Sun & Heatwave Defense */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-600 text-white">
                  <Sun className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm">
                  {t.heatAdvice}
                </h4>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">
                {localizedAdvisory.current.scorchingSunRisk}
              </p>
              <div className="text-[11px] text-amber-950 font-semibold bg-amber-100/80 p-2.5 rounded-xl border border-amber-200">
                ☀️ {t.heatIndex || "Heat Index:"} {weatherData.current.temp}°C ({t.feelsLike} {weatherData.current.feelsLike}°C). {t.eveningIrrigationNote || "Light evening irrigation advised."}
              </div>
            </div>

            {/* 3. Spray Window Notice */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <Wind className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-emerald-950 text-xs sm:text-sm">
                  {t.sprayWindow}
                </h4>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">
                {localizedAdvisory.current.sprayWindowNotice}
              </p>
              <div className="text-[11px] text-emerald-950 font-semibold bg-emerald-100/80 p-2.5 rounded-xl border border-emerald-200">
                🎯 {t.windVelocityStatus || "Micro-Wind Velocity:"} {weatherData.current.windSpeed} km/h ({weatherData.current.rainProb > 40 ? t.sprayProhibited : t.spraySafe}).
              </div>
            </div>

            {/* 4. Weather-Triggered Pest/Disease Watch */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-600 text-white">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-rose-950 text-xs sm:text-sm">
                  {t.diseaseAdvice}
                </h4>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">
                {localizedAdvisory.current.diseaseWatch}
              </p>
              <div className="text-[11px] text-rose-950 font-semibold bg-rose-100/80 p-2.5 rounded-xl border border-rose-200">
                🔬 {t.microTrigger || "Microclimate Trigger:"} {weatherData.current.humidity}% {t.relativeHumidity || "Humidity"}. {t.humiditySporeNote || "Humidity promotes spore germination."}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MODE 2: Plan New Cultivation (Pre-Sowing Advisory) */}
      {advisoryMode === 'new' && (
        <div className="space-y-4">
          
          <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-5 rounded-3xl border border-emerald-800 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-extrabold tracking-wider text-emerald-300 uppercase">
                {t.monthlySuitabilityScore || "1-Month Seasonal Suitability Score"}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-black border border-emerald-400/40">
                {t.suitabilityHigh || "Suitability: 92% (Highly Recommended)"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold">
              {t.newCultivationPlanning} {currentCropLocalName} ({selectedPanchayat.localName || selectedPanchayat.name})
            </h3>
            <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
              {t.monthlyProjectionTitle || "Monthly Projection"}: {weatherData.oneMonthOutlook.monthlySummary.totalExpectedRainMm}mm {t.expectedRainLabel || "Rain"}, {weatherData.oneMonthOutlook.monthlySummary.rainyDaysCount} {t.rainyDaysLabel || "Rainy Days"} | {selectedPanchayat.soilType}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            
            {/* Optimal Window */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-sm">
              <span className="text-emerald-800 font-black text-xs uppercase block">
                📅 {t.sowingWindow}
              </span>
              <p className="text-slate-900 font-bold text-xs sm:text-sm">
                {localizedAdvisory.newCultivation.optimalSowingWindow}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {t.fieldCapacityText}
              </p>
            </div>

            {/* Climate Resilient Varieties */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-sm">
              <span className="text-blue-800 font-black text-xs uppercase block">
                🌱 {t.recommendedVarieties}
              </span>
              <p className="text-slate-900 font-bold text-xs sm:text-sm">
                {localizedAdvisory.newCultivation.varietiesRecommended}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {t.resilientVarietiesText}
              </p>
            </div>

            {/* Soil Preparation */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-sm">
              <span className="text-amber-800 font-black text-xs uppercase block">
                🚜 {t.soilPreparation}
              </span>
              <p className="text-slate-700 text-xs leading-relaxed font-medium">
                {localizedAdvisory.newCultivation.preparationSteps}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
