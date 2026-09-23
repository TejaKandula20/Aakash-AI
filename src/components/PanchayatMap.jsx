import React, { useState } from 'react';
import { Map, Layers, CloudRain, Thermometer, ShieldAlert, Navigation, Compass, Mountain, Maximize2, Radio } from 'lucide-react';

export default function PanchayatMap({
  selectedPanchayat,
  weatherData,
  currentLang = 'en',
  t,
  onTriggerAlert
}) {
  const [activeLayer, setActiveLayer] = useState('weather'); // 'weather' | 'temp' | 'risk'
  const [selectedSubPoint, setSelectedSubPoint] = useState(null);

  const { current } = weatherData;
  const isTelugu = currentLang === 'te';

  // Sub-points within the 1km micro-mesh
  const subPoints = [
    { id: 'center', name: t.gpCentroidLabel || "Gram Panchayat Center", offsetLat: 0, offsetLon: 0, elevDelta: 0, desc: isTelugu ? "ప్రధాన నివాస ప్రాంతం" : "Main Habitation Area" },
    { id: 'north-farm', name: t.northFarmLabel || "North Agricultural Fields", offsetLat: 0.006, offsetLon: 0.004, elevDelta: -8, desc: isTelugu ? "పల్లపు వరి చేలు (ముంపు అవకాశం)" : "Lowland Paddy (Drainage Prone)" },
    { id: 'east-ridge', name: t.eastRidgeLabel || "East Upland Ridge", offsetLat: -0.005, offsetLon: 0.007, elevDelta: 24, desc: isTelugu ? "మెట్ట పంటల గట్లు" : "Highland Crop Terraces" },
    { id: 'south-basin', name: t.drainageBasinLabel || "South Natural Drainage Stream", offsetLat: -0.007, offsetLon: -0.003, elevDelta: -14, desc: isTelugu ? "వరద నీరు ప్రవహించే మార్గం" : "Flash Runoff Channel" }
  ];

  const activeInspectPoint = selectedSubPoint 
    ? subPoints.find(p => p.id === selectedSubPoint) 
    : subPoints[0];

  const inspectElev = selectedPanchayat.elevationMeters + (activeInspectPoint?.elevDelta || 0);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
      
      {/* Header & Layer Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {t.mapHeaderTitle || "Interactive Panchayat Boundary & Weather Risk Map"}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                  1km Micro-Mesh
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {(selectedPanchayat.localName || selectedPanchayat.name) + " - " + (t.mapHeaderSubtitle || "Boundary envelope & downscaled telemetry")}
              </p>
            </div>
          </div>
        </div>

        {/* Layer Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveLayer('weather')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeLayer === 'weather'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>{t.rainfallLayer || "Rainfall"}</span>
          </button>

          <button
            onClick={() => setActiveLayer('temp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeLayer === 'temp'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>{t.temperatureLayer || "Temperature"}</span>
          </button>

          <button
            onClick={() => setActiveLayer('risk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeLayer === 'risk'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.agroRiskLayer || "Agro Risk"}</span>
          </button>
        </div>
      </div>

      {/* Map Canvas & Telemetry HUD */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 8 Cols: Vector SVG Interactive Map */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl p-4 border border-slate-800 relative overflow-hidden min-h-[320px] sm:min-h-[380px] flex items-center justify-center">
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>

          {/* SVG Map Visualization */}
          <svg className="w-full h-full max-w-[550px] max-h-[340px] z-10" viewBox="0 0 500 320">
            <defs>
              {/* Rain Gradient */}
              <radialGradient id="rainGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.75" />
                <stop offset="70%" stopColor="#1d4ed8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.05" />
              </radialGradient>
              {/* Heat Gradient */}
              <radialGradient id="heatGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.75" />
                <stop offset="70%" stopColor="#d97706" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#78350f" stopOpacity="0.05" />
              </radialGradient>
              {/* Risk Gradient */}
              <radialGradient id="riskGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.75" />
                <stop offset="70%" stopColor="#b91c1c" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#450a0a" stopOpacity="0.05" />
              </radialGradient>
            </defs>

            {/* 1. Coarse 25km IMD Boundary Box (Dashed Outlines) */}
            <rect x="30" y="20" width="440" height="280" rx="16" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
            <text x="45" y="42" fill="#94a3b8" fontSize="10" fontFamily="monospace">{t.coarseGridBoxLabel || "IMD Coarse NWP Grid Box (25km × 25km)"}</text>

            {/* 2. Topographic Elevation Contours */}
            <path d="M 60 180 Q 150 120 250 160 T 440 140" fill="none" stroke="#334155" strokeWidth="1.2" strokeDasharray="3 3" />
            <path d="M 60 220 Q 180 170 280 200 T 440 190" fill="none" stroke="#334155" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x="370" y="135" fill="#64748b" fontSize="8" fontFamily="monospace">{t.contourLabel || "Contour"} {selectedPanchayat.elevationMeters + 30}m</text>
            <text x="370" y="185" fill="#64748b" fontSize="8" fontFamily="monospace">{t.contourLabel || "Contour"} {selectedPanchayat.elevationMeters - 15}m</text>

            {/* 3. Layer Color Fill (Rain, Heat, or Risk) */}
            {activeLayer === 'weather' && (
              <circle cx="250" cy="160" r="110" fill="url(#rainGrad)" />
            )}
            {activeLayer === 'temp' && (
              <circle cx="250" cy="160" r="110" fill="url(#heatGrad)" />
            )}
            {activeLayer === 'risk' && (
              <circle cx="250" cy="160" r="110" fill="url(#riskGrad)" />
            )}

            {/* 4. Downscaled Panchayat Boundary Envelope (1km) */}
            <polygon
              points="190,90 310,80 340,170 300,230 180,220 150,140"
              fill={activeLayer === 'weather' ? 'rgba(59, 130, 246, 0.15)' : activeLayer === 'temp' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
              stroke={activeLayer === 'weather' ? '#60a5fa' : activeLayer === 'temp' ? '#fbbf24' : '#f87171'}
              strokeWidth="2.5"
            />
            <text x="175" y="76" fill="#f8fafc" fontSize="11" fontWeight="bold">
              {selectedPanchayat.localName ? selectedPanchayat.localName : selectedPanchayat.name} (1km)
            </text>

            {/* 5. Sub-Points / Habitation Nodes within Panchayat */}
            {/* North farm */}
            <circle cx="290" cy="115" r="5" fill="#10b981" className="cursor-pointer hover:r-7 transition-all" onClick={() => setSelectedSubPoint('north-farm')} />
            <text x="298" y="118" fill="#cbd5e1" fontSize="9">{t.northFarmLabel || "North Farm"}</text>

            {/* East ridge */}
            <circle cx="315" cy="180" r="5" fill="#f59e0b" className="cursor-pointer hover:r-7 transition-all" onClick={() => setSelectedSubPoint('east-ridge')} />
            <text x="323" y="184" fill="#cbd5e1" fontSize="9">{t.eastRidgeLabel || "East Ridge"}</text>

            {/* South basin */}
            <circle cx="220" cy="210" r="5" fill="#3b82f6" className="cursor-pointer hover:r-7 transition-all" onClick={() => setSelectedSubPoint('south-basin')} />
            <text x="145" y="222" fill="#cbd5e1" fontSize="9">{t.drainageBasinLabel || "Drainage Basin"}</text>

            {/* Centroid / GP Office Pin */}
            <g transform="translate(240, 140)" className="cursor-pointer" onClick={() => setSelectedSubPoint('center')}>
              <circle cx="10" cy="10" r="14" fill="#10b981" opacity="0.3" className="animate-ping" />
              <circle cx="10" cy="10" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <text x="22" y="14" fill="#34d399" fontSize="10" fontWeight="bold">{t.gpCentroidLabel || "GP Centroid"}</text>
            </g>
          </svg>

          {/* Map Compass Rose */}
          <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-700/80 rounded-xl p-2 flex flex-col items-center text-[10px] text-slate-300 font-mono">
            <span className="font-bold text-emerald-400">N</span>
            <Compass className="w-4 h-4 text-slate-400 my-0.5" />
            <span>S</span>
          </div>

          {/* Scale Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-[10px] text-slate-300 font-mono flex items-center gap-2">
            <div className="w-12 h-1 bg-emerald-400 rounded"></div>
            <span>1 km</span>
          </div>
        </div>

        {/* Right 4 Cols: Localized Telemetry HUD for Selected Point */}
        <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                {t.pointInspectionHud || "Micro-Point Telemetry HUD"}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {t.activeZone || "Active Zone"}
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-black text-slate-900 mb-1">
              {activeInspectPoint.name}
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              {activeInspectPoint.desc}
            </p>

            {/* Parameters Grid */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-600 font-medium">{t.pointElevLabel || "Point Elevation:"}</span>
                <strong className="text-slate-900 font-bold font-mono">{inspectElev}m (DEM)</strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-600 font-medium">{t.pointPrecipLabel || "Point Precipitation:"}</span>
                <strong className="text-blue-700 font-bold font-mono">{current.rainMm} mm</strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-600 font-medium">{t.canopyTempLabel || "Canopy Temperature:"}</span>
                <strong className="text-slate-900 font-bold font-mono">{current.temp}°C</strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-600 font-medium">{t.pointSoilSatLabel || "Soil Saturation:"}</span>
                <strong className="text-emerald-700 font-bold font-mono">{current.soilMoisture}%</strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-600 font-medium">{t.pointRiskLabel || "Agricultural Risk:"}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  current.rainMm > 25 || current.soilMoisture > 80 
                    ? 'bg-red-100 text-red-800 border border-red-200' 
                    : current.temp > 38 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {current.rainMm > 25 ? (t.waterlogRiskLabel || "Waterlog Risk") : current.temp > 38 ? (t.heatStressRiskLabel || "Heat Stress") : (t.normalConditionLabel || "Normal Conditions")}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action Note */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              onClick={() => onTriggerAlert(current.alertTriggerType || 'waterlogging')}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{t.testZoneAlertBtn || "Test Alert for this Zone"}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
