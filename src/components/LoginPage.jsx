import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, User, Lock, Mail, ArrowRight, 
  MapPin, AlertCircle, CheckCircle2, Loader2, 
  Globe, Compass, Check, ChevronDown, UserCheck, ShieldAlert,
  Phone, Sprout, Layers, Volume2
} from 'lucide-react';
import { apiService } from '../utils/apiService';
import { databaseService } from '../data/databaseService';
import { LANGUAGES, TRANSLATIONS } from '../data/translations';
import { 
  getAllDistricts, 
  getMandalsByDistrict, 
  searchPanchayats,
  PANCHAYATS_DATA 
} from '../data/panchayats';

export default function LoginPage({
  onLoginSuccess,
  currentLang = 'en',
  onLanguageChange,
  t: propT
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [loginRole, setLoginRole] = useState('user'); // 'user' | 'admin'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Farmer registration fields
  const [phone, setPhone] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('Paddy');
  const [landAcres, setLandAcres] = useState('2.5');
  const [alertPreference, setAlertPreference] = useState('Both');

  // Translations dictionary for current language
  const t = useMemo(() => {
    return {
      ...TRANSLATIONS.en,
      ...(TRANSLATIONS[currentLang] || {}),
      ...(propT || {})
    };
  }, [currentLang, propT]);

  // Location selector state for alert registration
  const allDistricts = useMemo(() => getAllDistricts(), []);
  const [selectedDistrict, setSelectedDistrict] = useState('Alluri Sitharama Raju');
  
  const availableMandals = useMemo(() => {
    return getMandalsByDistrict(selectedDistrict);
  }, [selectedDistrict]);

  const [selectedMandal, setSelectedMandal] = useState('Maredumilli');

  // Panchayats in selected district & mandal
  const availablePanchayats = useMemo(() => {
    const list = PANCHAYATS_DATA.filter(p => 
      p.district.toLowerCase() === selectedDistrict.toLowerCase() && 
      (p.taluk.toLowerCase() === selectedMandal.toLowerCase() || (p.mandal && p.mandal.toLowerCase() === selectedMandal.toLowerCase()))
    );
    if (list.length > 0) return list;
    return searchPanchayats("", selectedDistrict, selectedMandal, 50);
  }, [selectedDistrict, selectedMandal]);

  const [selectedPanchayatId, setSelectedPanchayatId] = useState('ap-asr-maredumilli');

  // Automatically keep selectedPanchayatId valid when availablePanchayats changes
  useEffect(() => {
    if (availablePanchayats.length > 0 && !availablePanchayats.some(p => p.id === selectedPanchayatId)) {
      setSelectedPanchayatId(availablePanchayats[0].id);
    }
  }, [availablePanchayats, selectedPanchayatId]);

  // Reset mandal and panchayat when district changes
  const handleDistrictChange = (dist) => {
    setSelectedDistrict(dist);
    const mandals = getMandalsByDistrict(dist);
    const defaultMandal = mandals.length > 0 ? mandals[0].name : '';
    setSelectedMandal(defaultMandal);
    const newPanchayats = searchPanchayats("", dist, defaultMandal, 10);
    if (newPanchayats.length > 0) {
      setSelectedPanchayatId(newPanchayats[0].id);
    }
  };

  const handleMandalChange = (mandal) => {
    setSelectedMandal(mandal);
    const newPanchayats = searchPanchayats("", selectedDistrict, mandal, 10);
    if (newPanchayats.length > 0) {
      setSelectedPanchayatId(newPanchayats[0].id);
    }
  };

  const selectedPanchayatObj = useMemo(() => {
    return PANCHAYATS_DATA.find(p => p.id === selectedPanchayatId) || availablePanchayats[0] || PANCHAYATS_DATA[0];
  }, [selectedPanchayatId, availablePanchayats]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleLanguageSelect = (langCode) => {
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('aakash_preferred_lang', langCode);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!identifier || !password) {
      setError(currentLang === 'te' 
        ? 'దయచేసి ఇమెయిల్ లేదా యూజర్‌నేమ్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.' 
        : currentLang === 'hi'
        ? 'कृपया अपना ईमेल या उपयोगकर्ता नाम और पासवर्ड दर्ज करें।'
        : 'Please enter your email or username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const locationData = {
        assignedPanchayatId: selectedPanchayatObj?.id || 'ap-asr-maredumilli',
        assignedPanchayatName: selectedPanchayatObj?.localName || selectedPanchayatObj?.name || 'Maredumilli',
        assignedDistrict: selectedDistrict,
        assignedMandal: selectedMandal,
        role: loginRole
      };

      const res = await apiService.login(identifier, password, locationData);
      
      // Ensure local session user is properly assigned
      const assignedUser = {
        ...res.user,
        assignedPanchayatId: locationData.assignedPanchayatId,
        assignedPanchayatName: locationData.assignedPanchayatName,
        assignedDistrict: locationData.assignedDistrict,
        assignedMandal: locationData.assignedMandal
      };

      setSuccessMsg(
        `${t.appName || 'Aakash AI'}: Welcome, ${res.user.username}! ${res.user.role === 'admin' ? 'Connecting to Command Center...' : 'Connected to ' + (selectedPanchayatObj.localName || selectedPanchayatObj.name) + ' (' + selectedDistrict + ')...'}`
      );
      
      setTimeout(() => {
        onLoginSuccess(assignedUser);
      }, 500);
    } catch (err) {
      const msg = (err.message || '').replace(/<[^>]*>?/gm, '');
      setError(msg || (currentLang === 'te' 
        ? 'లాగిన్ విఫలమైంది. వివరాలు తనిఖీ చేయండి.' 
        : currentLang === 'hi'
        ? 'लॉगिन विफल रहा। कृपया क्रेडेंशियल जांचें।'
        : 'Login failed. Please verify credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!identifier || !password || !fullName) {
      setError(currentLang === 'te' 
        ? 'దయచేసి అన్ని వివరాలు పూర్తి చేయండి.' 
        : currentLang === 'hi'
        ? 'कृपया सभी आवश्यक फ़ील्ड भरें।'
        : 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanPhone = phone || identifier;
      const panchayatId = selectedPanchayatObj?.id || 'ap-asr-maredumilli';
      const panchayatName = selectedPanchayatObj?.localName || selectedPanchayatObj?.name || 'Maredumilli';

      // 1. Register user login account
      const res = await apiService.register({
        email: identifier.includes('@') ? identifier : `${identifier.toLowerCase().replace(/\s+/g, '')}@aakash.gov.in`,
        password,
        username: fullName,
        role: loginRole,
        assignedPanchayatId: panchayatId,
        assignedPanchayatName: panchayatName,
        assignedDistrict: selectedDistrict,
        assignedMandal: selectedMandal,
        phoneNumber: cleanPhone,
        preferredLanguage: currentLang
      });

      // 2. Register into dedicated Farmers Database
      const newFarmerRecord = databaseService.addFarmer({
        name: fullName,
        phone: cleanPhone,
        district: selectedDistrict,
        mandal: selectedMandal,
        panchayatId,
        panchayatName,
        primaryCrop,
        landAcres: parseFloat(landAcres) || 2.5,
        language: currentLang,
        alertPreference
      });

      // Sync with backend database asynchronously if server running
      apiService.addFarmer({
        name: fullName,
        phone: cleanPhone,
        district: selectedDistrict,
        mandal: selectedMandal,
        panchayatId,
        panchayatName,
        primaryCrop,
        landAcres: parseFloat(landAcres) || 2.5,
        language: currentLang,
        alertPreference
      }).catch(() => {});

      setSuccessMsg(
        currentLang === 'te'
          ? `రైతు నమోదు విజయవంతమైంది! ${panchayatName} పంచాయతీలో హెచ్చరికల కోసం మీ మొబైల్ నంబర్ (${cleanPhone}) రిజిస్టర్ అయింది.`
          : `Farmer registered successfully! Connected to ${panchayatName} for weather alerts with mobile: ${cleanPhone}.`
      );

      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 700);
    } catch (err) {
      const msg = (err.message || '').replace(/<[^>]*>?/gm, '');
      setError(msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-between p-4 sm:p-6 text-slate-100 font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-black text-sm sm:text-base text-white">
              {t.appTitle || 'Aakash AI'}
            </h1>
            <p className="text-[10px] text-slate-400">
              {t.systemSubtitle || 'AI-Powered Panchayat Weather Sentinel'}
            </p>
          </div>
        </div>

        {/* Display Language dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-700/60 shadow-sm text-xs">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <select
            value={currentLang}
            onChange={(e) => handleLanguageSelect(e.target.value)}
            className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            aria-label="Display Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white font-semibold">
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-xl mx-auto my-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {t.portalTitle || 'Aakash AI Portal'}
          </h2>
          <p className="text-xs text-emerald-200 mt-1 font-medium">
            {t.portalSubtitle || 'Gram Panchayat Agro-Meteorological Sentinel & Role-Based Access'}
          </p>
        </div>

        <div className="p-6 sm:p-7 space-y-5">
          
          {/* 1. SELECT LOGIN ROLE: Farmer (User) vs Administrator */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              {t.selectLoginRole || 'Select Login Role:'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLoginRole('user')}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                  loginRole === 'user'
                    ? 'bg-emerald-50/90 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  loginRole === 'user' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {t.farmerRole || 'Farmer (User)'}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {t.farmerRoleDesc || 'Alerts & Forecasts'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLoginRole('admin')}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                  loginRole === 'admin'
                    ? 'bg-purple-50/90 border-purple-500 shadow-sm ring-2 ring-purple-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  loginRole === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {t.adminRole || 'Officer (Admin)'}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {t.adminRoleDesc || 'State Command'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. LOCATION SELECTOR: Auto-syncs for both User and Admin */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-950">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <div className="text-xs font-black">
                  {t.registeredHubLabel || 'Select Panchayat Location for Weather & Emergency Alerts:'}
                </div>
                <div className="text-[10px] text-emerald-700">
                  {t.alertLockNotice || 'All automated weather forecasts, phone calls & SMS alerts will be connected to this Gram Panchayat'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* District */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  {t.selectDistrictLabel || 'District'}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {allDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Mandal */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  {t.selectMandalLabel || 'Mandal'}
                </label>
                <select
                  value={selectedMandal}
                  onChange={(e) => handleMandalChange(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availableMandals.map((m) => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Gram Panchayat */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  {t.selectPanchayatLabel || 'Gram Panchayat'}
                </label>
                <select
                  value={selectedPanchayatId}
                  onChange={(e) => setSelectedPanchayatId(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
                >
                  {availablePanchayats.map((p) => (
                    <option key={p.id} value={p.id}>{p.localName || p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-white/80 px-2.5 py-1.5 rounded-xl border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {t.registeredHubNotice || 'Registered Alert Hub:'}{' '}
                <strong>{selectedPanchayatObj?.localName || selectedPanchayatObj?.name}</strong> ({selectedDistrict})
              </span>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tabs: Sign In vs Register */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                !isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.signInBtn || 'Sign In'}
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {currentLang === 'te' ? 'కొత్త రైతు నమోదు (Register Farmer)' : (t.createAccountBtn || 'New Farmer Registration')}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-3.5">
            {isRegister && (
              <>
                {/* Farmer Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {currentLang === 'te' ? 'రైతు పూర్తి పేరు (Farmer Full Name)' : (t.fullNameLabel || 'Farmer Full Name')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={currentLang === 'te' ? 'ఉదా. రమేష్ రెడ్డి / Ramesh Reddy' : 'e.g. Ramesh Reddy'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Mobile Phone for Alerts */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {currentLang === 'te' ? 'హెచ్చరికల కోసం మొబైల్ నంబర్ (Alerts Mobile Number)' : 'Alerts Mobile Number'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98480 12345"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Crop & Land Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      {currentLang === 'te' ? 'ప్రధాన పంట (Primary Crop)' : 'Primary Crop'}
                    </label>
                    <select
                      value={primaryCrop}
                      onChange={(e) => setPrimaryCrop(e.target.value)}
                      className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Paddy">Paddy (వరి)</option>
                      <option value="Cotton">Cotton (పత్తి)</option>
                      <option value="Chilli">Chilli (మిరప)</option>
                      <option value="Maize">Maize (మొక్కజొన్న)</option>
                      <option value="Groundnut">Groundnut (వేరుశనగ)</option>
                      <option value="Sugarcane">Sugarcane (చెరకు)</option>
                      <option value="Tomato">Tomato (టమోటా)</option>
                      <option value="Coffee">Coffee (కాఫీ)</option>
                      <option value="Pulses">Pulses (పప్పుధాన్యాలు)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      {currentLang === 'te' ? 'భూమి విస్తీర్ణం (Land Acres)' : 'Land Size (Acres)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={landAcres}
                      onChange={(e) => setLandAcres(e.target.value)}
                      placeholder="2.5"
                      className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Alert Preference Channel */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    {currentLang === 'te' ? 'హెచ్చరికల మాధ్యమం (Alert Channel)' : 'Alert Delivery Mode'}
                  </label>
                  <select
                    value={alertPreference}
                    onChange={(e) => setAlertPreference(e.target.value)}
                    className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Both">Both Automated Voice Call & SMS (సిఫార్సు చేయబడింది)</option>
                    <option value="Voice">Automated Voice Call Only (ఫోన్ కాల్)</option>
                    <option value="SMS">Actionable SMS Only (ఎస్ఎంఎస్)</option>
                  </select>
                </div>
              </>
            )}

            {/* Login Identifier */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRegister 
                  ? (currentLang === 'te' ? 'యూజర్‌నేమ్ / లాగిన్ ఐడీ' : 'Username / Login ID') 
                  : (t.identifierLabel || 'Registered Mobile / Username / Email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    isRegister 
                      ? "e.g. rameshreddy" 
                      : (loginRole === 'admin' ? "kandulatejachowdary@gmail.com" : "suchitra")
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.passwordLabel || 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder || '••••••••'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.syncing || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {isRegister 
                      ? (currentLang === 'te' ? 'రైతు నమోదు పూర్తి చేయండి (Register Farmer)' : 'Register Farmer & Enter Dashboard') 
                      : (t.signInBtn || 'Sign In')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          {t.prototypeDisclaimer || 'Protected with cryptographic token verification & once-per-day emergency call sentinel'}
        </div>

      </div>

      <div className="text-center text-[10px] text-slate-500 pt-4">
        Smart India Hackathon • Aakash AI Hyper-Local Downscaled Weather Sentinel
      </div>

    </div>
  );
}
