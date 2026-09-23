import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, Mountain, Layers, Compass, Sparkles, Filter, Search, X, Check, Building2, Navigation } from 'lucide-react';
import { 
  PANCHAYATS_DATA, 
  AP_REGIONS, 
  AP_DISTRICTS, 
  AP_DISTRICTS_TELUGU, 
  TOTAL_AP_PANCHAYATS,
  searchPanchayats,
  getMandalsByDistrict
} from '../data/panchayats';

export default function PanchayatPicker({
  selectedPanchayat,
  onSelectPanchayat,
  currentLang = 'en',
  t
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState(selectedPanchayat.district);
  const [selectedMandal, setSelectedMandal] = useState(selectedPanchayat.taluk || '');

  const searchContainerRef = useRef(null);
  const isTelugu = currentLang === 'te';

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync district & mandal when selectedPanchayat changes externally
  useEffect(() => {
    if (selectedPanchayat) {
      setSelectedDistrict(selectedPanchayat.district);
      setSelectedMandal(selectedPanchayat.taluk || '');
    }
  }, [selectedPanchayat]);

  // Mandals for currently selected district
  const availableMandals = useMemo(() => {
    return getMandalsByDistrict(selectedDistrict);
  }, [selectedDistrict]);

  // Real-time instant search results across all 13,326 Gram Panchayats
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchPanchayats(searchQuery, "", "", 40);
  }, [searchQuery]);

  // Panchayats for the dropdown based on selected District and Mandal
  const mandalPanchayats = useMemo(() => {
    return searchPanchayats("", selectedDistrict, selectedMandal, 100);
  }, [selectedDistrict, selectedMandal]);

  // Regional display labels based on language
  const getRegionName = (regId, defaultName) => {
    if (regId === "all") return t.allApRegion || defaultName;
    if (regId === "rayalaseema") return t.rayalaseemaRegion || defaultName;
    if (regId === "godavari") return t.godavariRegion || defaultName;
    if (regId === "central") return t.centralRegion || defaultName;
    if (regId === "uttarandhra") return t.uttarandhraRegion || defaultName;
    if (regId === "south_coastal") return t.southCoastalRegion || defaultName;
    if (regId === "national") return t.nationalRegion || defaultName;
    return defaultName;
  };

  // Quick benchmark presets specifically for Andhra Pradesh
  const quickPresets = [
    { id: "ap-asr-maredumilli", label: isTelugu ? "మారేడుమిల్లి (అల్లూరి)" : "Maredumilli (Alluri)", tag: isTelugu ? "450మీ ఘాట్స్ / 38.5 మి.మీ వర్షం" : "450m Ghats / 38.5mm Rain", color: "bg-blue-50 text-blue-900 border-blue-300" },
    { id: "ap-asr-araku", label: isTelugu ? "అరకు లోయ (అల్లూరి)" : "Araku Valley (Alluri)", tag: isTelugu ? "911మీ / 24°C చల్లని వాతావరణం" : "911m / 24°C Cool", color: "bg-teal-50 text-teal-900 border-teal-300" },
    { id: "ap-wg-bhimavaram", label: isTelugu ? "భీమవరం (పశ్చిమ గోదావరి)" : "Bhimavaram (West Godavari)", tag: isTelugu ? "7మీ డెల్టా / ముంపు ప్రమాదం" : "7m Delta / Waterlog Risk", color: "bg-indigo-50 text-indigo-900 border-indigo-300" },
    { id: "ap-guntur-tadikonda", label: isTelugu ? "తాడికొండ (గుంటూరు)" : "Tadikonda (Guntur)", tag: isTelugu ? "32మీ / మిరప హబ్" : "32m / Chilli Hub", color: "bg-rose-50 text-rose-900 border-rose-300" },
    { id: "ap-atp-kalyandurg", label: isTelugu ? "కళ్యాణదుర్గం (అనంతపురం)" : "Kalyandurg (Ananthapuramu)", tag: isTelugu ? "580మీ / వర్షాభావ 39°C" : "580m / Semi-Arid 39°C", color: "bg-amber-50 text-amber-950 border-amber-300" },
    { id: "ap-kadapa-pulivendula", label: isTelugu ? "పులివెందుల (వైఎస్సార్ కడప)" : "Pulivendula (YSR Kadapa)", tag: isTelugu ? "154మీ / తీవ్రమైన ఎండ" : "154m / Scorching Sun", color: "bg-orange-50 text-orange-950 border-orange-300" },
    { id: "ap-bapatla-chirala", label: isTelugu ? "చీరాల (బాపట్ల)" : "Chirala (Bapatla)", tag: isTelugu ? "5మీ తీరం / 88% తేమ" : "5m Coast / 88% Humid", color: "bg-cyan-50 text-cyan-900 border-cyan-300" },
    { id: "ap-chittoor-palamaner", label: isTelugu ? "పలమనేరు (చిత్తూరు)" : "Palamaner (Chittoor)", tag: isTelugu ? "683మీ ఎగువ మైదానం" : "683m Highland", color: "bg-emerald-50 text-emerald-900 border-emerald-300" },
    { id: "ap-konaseema-amalapuram", label: isTelugu ? "అమలాపురం (కోనసీమ)" : "Amalapuram (Konaseema)", tag: isTelugu ? "3మీ / నదీ ద్వీపం" : "3m / Inter-Delta", color: "bg-purple-50 text-purple-900 border-purple-300" },
    { id: "ap-srikakulam-palasa", label: isTelugu ? "పలాస (శ్రీకాకుళం)" : "Palasa (Srikakulam)", tag: isTelugu ? "38మీ / జీడిమామిడి" : "38m / Cashew Belt", color: "bg-stone-50 text-stone-900 border-stone-300" }
  ];

  const handleSelectFromResult = (p) => {
    setSelectedDistrict(p.district);
    setSelectedMandal(p.taluk || '');
    onSelectPanchayat(p);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {t.selectPanchayat || "Select Gram Panchayat"}
              </h2>
              <span className="text-[11px] px-3 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold shadow-sm">
                13,326 {isTelugu ? "గ్రామ పంచాయతీలు" : "Gram Panchayats Active"} (26 AP Districts)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {{
                te: "ఆంధ్రప్రదేశ్ లోని మొత్తం 13,326 పంచాయతీలలో దేనినైనా పేరు, తెలుగు పేరు లేదా పిన్‌కోడ్ ద్వారా శోధించండి",
                hi: "आंध्र प्रदेश की सभी 13,326 ग्राम पंचायतों में से किसी को भी नाम, पिनकोड या मंडल से खोजें",
                en: "Instant downscaled weather for all 13,326 AP Gram Panchayats. Search by village name, Telugu script, mandal, or 6-digit PIN."
              }[currentLang] || "Instant downscaled weather for all 13,326 AP Gram Panchayats. Search by village name, Telugu script, mandal, or 6-digit PIN."}
            </p>
          </div>
        </div>

        {/* Global Instant Search Bar across all 13,326 Gram Panchayats */}
        <div ref={searchContainerRef} className="relative w-full lg:w-96">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={isTelugu ? "13,326 పంచాయతీలలో శోధించండి (ఉదా: మారేడుమిల్లి, 533288)..." : "Search 13,326 Panchayats (e.g. Araku, 531149)..."}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown List */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-80 overflow-y-auto divide-y divide-slate-100">
              <div className="px-3.5 py-2 bg-slate-50 text-[11px] font-bold text-slate-500 flex justify-between items-center sticky top-0 border-b border-slate-200">
                <span>{searchResults.length} {isTelugu ? "ఫలితాలు దొరికాయి" : "Panchayats Found"}</span>
                <span className="text-[10px] text-emerald-700 font-extrabold">Instant AP Registry</span>
              </div>
              {searchResults.length > 0 ? (
                searchResults.map(p => {
                  const isSelected = selectedPanchayat.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectFromResult(p)}
                      className={`w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/80 transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-emerald-50 border-l-4 border-emerald-600 font-bold' : ''
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {isTelugu && p.localName ? p.localName : p.name}
                          </span>
                          {p.localName && (
                            <span className="text-[11px] text-slate-500">
                              ({isTelugu ? p.name : p.localName})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{p.taluk} Mandal</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">{p.district}</span>
                          <span>•</span>
                          <span className="font-mono bg-slate-100 px-1 rounded text-slate-600">{p.pincode}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full block">
                          {p.elevationMeters}m DEM
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  {isTelugu ? "సరిపోలే పంచాయతీ కనిపించలేదు. మరొక పేరు లేదా పిన్‌కోడ్ తో ప్రయత్నించండి." : "No gram panchayat matches found. Try spelling or PIN code."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Structured District, Mandal, and Panchayat Selectors */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* 1. AP District Dropdown (All 26 Districts) */}
        <div>
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-emerald-600" />
            <span>{t.apDistrictLabel || "1. District (26 AP Districts)"}</span>
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              const distName = e.target.value;
              setSelectedDistrict(distName);
              const mandals = getMandalsByDistrict(distName);
              const firstMandal = mandals[0]?.name || '';
              setSelectedMandal(firstMandal);
              const firstP = searchPanchayats("", distName, firstMandal, 1)[0] || searchPanchayats("", distName, "", 1)[0];
              if (firstP) {
                onSelectPanchayat(firstP);
              }
            }}
            className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
          >
            {AP_DISTRICTS.map(dist => (
              <option key={dist} value={dist}>
                {isTelugu && AP_DISTRICTS_TELUGU[dist] ? `${AP_DISTRICTS_TELUGU[dist]} (${dist})` : dist}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Mandal Dropdown */}
        <div>
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-emerald-600" />
            <span>{isTelugu ? "2. మండలం" : "2. Mandal (Taluk)"}</span>
          </label>
          <select
            value={selectedMandal}
            onChange={(e) => {
              const mandalName = e.target.value;
              setSelectedMandal(mandalName);
              const firstP = searchPanchayats("", selectedDistrict, mandalName, 1)[0];
              if (firstP) {
                onSelectPanchayat(firstP);
              }
            }}
            className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
          >
            {availableMandals.map(m => (
              <option key={m.name} value={m.name}>
                {isTelugu && m.localName ? `${m.localName} (${m.name})` : m.name} ({m.elev}m)
              </option>
            ))}
          </select>
        </div>

        {/* 3. Gram Panchayat Dropdown */}
        <div>
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600" />
            <span>{t.gramPanchayatLabel || "3. Gram Panchayat"}</span>
          </label>
          <select
            value={selectedPanchayat.id}
            onChange={(e) => {
              const found = PANCHAYATS_DATA.find(p => p.id === e.target.value);
              if (found) {
                onSelectPanchayat(found);
              }
            }}
            className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
          >
            {mandalPanchayats.map(p => (
              <option key={p.id} value={p.id}>
                {isTelugu && p.localName ? p.localName : p.name} - PIN {p.pincode} ({p.elevationMeters}m)
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* AP Agro-Climatic Regional Filter Pills */}
      <div className="mt-3.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.apRegionsLabel || "Andhra Pradesh Agro-Climatic Regions:"}</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {AP_REGIONS.map((reg) => {
            const isActive = activeRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => {
                  setActiveRegion(reg.id);
                  const firstInReg = PANCHAYATS_DATA.find(p => reg.id === "all" ? p.state === "Andhra Pradesh" : reg.id === "national" ? p.state !== "Andhra Pradesh" : p.region === reg.id);
                  if (firstInReg) {
                    setSelectedDistrict(firstInReg.district);
                    onSelectPanchayat(firstInReg);
                  }
                }}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isActive
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {getRegionName(reg.id, reg.name)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Benchmark Presets across AP */}
      <div className="mt-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.quickBenchmarkLabel || "Quick Benchmark Panchayats (Topographic Diversity):"}</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {quickPresets.map(preset => {
            const isSelected = selectedPanchayat.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  const found = PANCHAYATS_DATA.find(p => p.id === preset.id);
                  if (found) {
                    setSelectedDistrict(found.district);
                    onSelectPanchayat(found);
                  }
                }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-400 shadow-sm font-bold'
                    : `${preset.color} hover:opacity-90 font-medium`
                }`}
              >
                <span className="font-bold">{preset.label}</span>
                <span className="opacity-80 text-[10px]">({preset.tag})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Panchayat Geo-Pill Strip */}
      <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-black text-slate-900">
          <span>{selectedPanchayat.localName ? selectedPanchayat.localName : selectedPanchayat.name}</span>
          <span className="text-emerald-700 font-normal">[{selectedPanchayat.name}]</span>
        </div>
        <span className="hidden sm:inline text-slate-300">•</span>
        <div className="flex items-center gap-1">
          <Mountain className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.elevation || "Elevation"}: <strong className="text-slate-900 font-bold">{selectedPanchayat.elevationMeters}m (SRTM DEM)</strong></span>
        </div>
        <span className="hidden sm:inline text-slate-300">•</span>
        <div className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.terrain || "Terrain"}: <strong className="text-slate-900 font-bold">{selectedPanchayat.terrainType}</strong></span>
        </div>
        <span className="hidden sm:inline text-slate-300">•</span>
        <div className="flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.soil || "Soil"}: <strong className="text-slate-900 font-bold">{selectedPanchayat.soilType}</strong></span>
        </div>
      </div>

    </div>
  );
}
