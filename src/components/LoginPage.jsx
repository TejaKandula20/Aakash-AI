import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, User, Lock, Mail, ArrowRight, 
  MapPin, AlertCircle, CheckCircle2, Loader2, 
  Globe, Compass, Check, ChevronDown, UserCheck, ShieldAlert,
  Phone, Sprout, Layers, Volume2, KeyRound, Eye, EyeOff, 
  RefreshCw, X, Smartphone, Send
} from 'lucide-react';
import { apiService } from '../utils/apiService';
import { databaseService } from '../data/databaseService';
import { getAssetUrl } from '../utils/assetHelper';
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

  // Forgot Password modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotMethod, setForgotMethod] = useState('mobile'); // 'mobile' | 'email'
  const [forgotDestination, setForgotDestination] = useState('');
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'verify'
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);
  const [demoOtpCode, setDemoOtpCode] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  const handleOpenForgotPassword = () => {
    const raw = (identifier || '').trim();
    if (raw.includes('@')) {
      setForgotMethod('email');
      setForgotDestination(raw);
    } else if (raw) {
      setForgotMethod('mobile');
      setForgotDestination(raw);
    } else {
      setForgotMethod('mobile');
      setForgotDestination('');
    }
    setForgotStep('request');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError(null);
    setForgotSuccess(null);
    setIsForgotPasswordOpen(true);
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const dest = forgotDestination.trim();
    if (!dest) {
      setForgotError(forgotMethod === 'mobile' ? 'Please enter your registered mobile number.' : 'Please enter your registered email address.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);

    try {
      const res = await apiService.sendPasswordResetOtp({ destination: dest, method: forgotMethod });
      setForgotStep('verify');
      if (res.otpDemo) {
        setDemoOtpCode(res.otpDemo);
      }
      setResendCooldown(60);
      setForgotSuccess(res.message || `Verification code sent to ${dest}`);
    } catch (err) {
      const msg = (err.message || '').replace(/<[^>]*>?/gm, '');
      setForgotError(msg || 'Failed to send verification code. Please check destination details.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!forgotOtp || forgotOtp.trim().length < 4) {
      setForgotError('Please enter the 6-digit OTP code received.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);

    try {
      const res = await apiService.verifyAndResetPassword({
        destination: forgotDestination.trim(),
        method: forgotMethod,
        otp: forgotOtp.trim(),
        newPassword
      });

      setSuccessMsg(res.message || 'Password reset successfully! Please log in with your new password.');
      setIdentifier(forgotDestination.trim());
      setPassword(newPassword);
      setIsForgotPasswordOpen(false);
    } catch (err) {
      const msg = (err.message || '').replace(/<[^>]*>?/gm, '');
      setForgotError(msg || 'Failed to reset password. Please check the OTP code.');
    } finally {
      setForgotLoading(false);
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-6 text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* Atmospheric Background with Photo Texture */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-luminosity filter saturate-150" 
        style={{ backgroundImage: `url(${getAssetUrl('/assets/images/hero-landscape.jpg')})` }} 
      />
      <div className="fixed inset-0 bg-gradient-to-tr from-slate-950 via-emerald-950/85 to-slate-950 pointer-events-none" />
      <div className="fixed inset-0 agro-mesh-bg opacity-30 pointer-events-none" />
      
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto pb-4 border-b border-emerald-900/40 relative z-10">
        <div className="flex items-center gap-3">
          <img 
            src={getAssetUrl('/assets/images/aakash-crest.svg')} 
            alt="Aakash AI Crest" 
            className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-md hover:scale-105 transition-transform" 
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
                <span className="text-gradient-emerald font-black">Aakash AI</span>
                <span className="text-slate-300 font-bold text-xs sm:text-sm">ఆకాశ్ AI</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                v2.0 LIVE
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/70 font-medium">
              {t.systemSubtitle || 'AI-Powered Panchayat Weather Sentinel • Andhra Pradesh'}
            </p>
          </div>
        </div>

        {/* Display Language dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800/90 px-3.5 py-2 rounded-2xl border border-emerald-500/30 shadow-lg text-xs transition-all">
          <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
          <select
            value={currentLang}
            onChange={(e) => handleLanguageSelect(e.target.value)}
            className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer pr-1"
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

      {/* Main Content Area: Split Showcase & Login Grid */}
      <div className="max-w-6xl w-full mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left 5 Cols: Visual Platform Showcase (Hidden on extra small, gorgeous on desktop/tablet) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6">
          
          {/* Hero Visual Card */}
          <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl group">
            <img 
              src={getAssetUrl('/assets/images/hero-landscape.jpg')} 
              alt="Andhra Pradesh Agricultural Landscape" 
              className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-5">
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold mb-1">
                Hyper-Local Agro Intelligence
              </span>
              <h3 className="text-lg font-black text-white leading-snug">
                13,326 Gram Panchayats Protected Against Micro-Climate Disasters
              </h3>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>1km Micro-Mesh</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Downscaled SRTM 30m terrain physics for elevation-precise rainfall.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>IVR Audio Calls</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Autonomous voice call &amp; SMS alerts directly to farmer phones.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span>8 Indic Languages</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Fluent regional speech synthesis in Telugu, Hindi, Tamil &amp; more.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2 text-teal-400 font-bold">
                <Sprout className="w-4 h-4 text-teal-400" />
                <span>Crop Advisory</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Paddy, Cotton, Chilli pest watches and spray window forecasts.
              </p>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200/90 leading-relaxed font-medium">
            "ఆంధ్రప్రదేశ్ రైతాంగానికి సూక్ష్మ వాతావరణ ముప్పుల నుండి ముందుగానే రక్షణ కల్పించే ఆకాశ్ AI ప్లాట్‌ఫారమ్."
          </div>
        </div>

        {/* Right 7 Cols: Interactive Login & Registration Card */}
        <div className="lg:col-span-7 w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        
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
                      ? "e.g. rameshreddy or 9848012345" 
                      : (loginRole === 'admin' ? "kandulatejachowdary@gmail.com" : "suchitra or 9392705998")
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {!isRegister && (
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 {currentLang === 'te' 
                    ? 'మీ రిజిస్టర్డ్ మొబైల్ నంబర్ (ఉదా. 9392705998) లేదా యూజర్‌నేమ్‌తో లాగిన్ అవ్వవచ్చు.' 
                    : 'You can log in with your registered mobile number (e.g. 9392705998) or username.'}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  {t.passwordLabel || 'Password'}
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
                  >
                    {currentLang === 'te' 
                      ? 'పాస్‌వర్డ్ మర్చిపోయారా?' 
                      : currentLang === 'hi'
                      ? 'पासवर्ड भूल गए?'
                      : 'Forgot Password?'}
                  </button>
                )}
              </div>
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
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 text-slate-900">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {currentLang === 'te' 
                      ? 'పాస్‌వర్డ్ రీసెట్ (Forgot Password)' 
                      : currentLang === 'hi' 
                      ? 'पासवर्ड रीसेट करें' 
                      : 'Reset Account Password'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {currentLang === 'te' 
                      ? 'మొబైల్ లేదా ఈమెయిల్ ధృవీకరణ ద్వారా పాస్‌వర్డ్ పొందండి' 
                      : 'Verify via Mobile SMS or Email OTP'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error or Success notification */}
            {forgotError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* STEP 1: Select Method & Destination */}
            {forgotStep === 'request' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    {currentLang === 'te' ? 'ధృవీకరణ మాధ్యమం ఎంచుకోండి:' : 'Select Verification Channel:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => { setForgotMethod('mobile'); setForgotError(null); }}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                        forgotMethod === 'mobile'
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        forgotMethod === 'mobile' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          {currentLang === 'te' ? 'మొబైల్ SMS' : 'Mobile (SMS)'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {currentLang === 'te' ? 'OTP సందేశం' : '6-Digit OTP'}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setForgotMethod('email'); setForgotError(null); }}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                        forgotMethod === 'email'
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        forgotMethod === 'email' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          {currentLang === 'te' ? 'ఈమెయిల్' : 'Email Address'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {currentLang === 'te' ? 'OTP మెయిల్' : 'Email OTP'}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {forgotMethod === 'mobile'
                      ? (currentLang === 'te' ? 'రిజిస్టర్డ్ మొబైల్ నంబర్ (Mobile Number)' : 'Registered Mobile Number')
                      : (currentLang === 'te' ? 'రిజిస్టర్డ్ ఈమెయిల్ అడ్రస్ (Email Address)' : 'Registered Email Address')}
                  </label>
                  <div className="relative">
                    {forgotMethod === 'mobile' ? (
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    ) : (
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    )}
                    <input
                      type={forgotMethod === 'mobile' ? 'tel' : 'email'}
                      required
                      value={forgotDestination}
                      onChange={(e) => setForgotDestination(e.target.value)}
                      placeholder={
                        forgotMethod === 'mobile' 
                          ? "e.g. 9392705998 or 9848012345" 
                          : "e.g. kandulatejachowdary@gmail.com"
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-[2] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          {currentLang === 'te' ? 'OTP కోడ్ పంపండి' : 'Send Verification OTP'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: Verify OTP & Set New Password */
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-xs text-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                      Verification Sent To
                    </span>
                    <span className="font-mono font-bold text-slate-900">{forgotDestination}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setForgotStep('request'); setForgotOtp(''); }}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Change
                  </button>
                </div>

                {demoOtpCode && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                    <span>🔑 Verification Code: <strong>{demoOtpCode}</strong></span>
                    <button
                      type="button"
                      onClick={() => setForgotOtp(demoOtpCode)}
                      className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-bold text-[10px] hover:bg-amber-300 transition-colors"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {currentLang === 'te' ? '6-అంకెల OTP కోడ్ నమోదు చేయండి' : 'Enter 6-Digit OTP Code'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.5em] font-mono font-bold text-base py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 px-1">
                    <span>Valid for 10 minutes</span>
                    {resendCooldown > 0 ? (
                      <span>Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="font-bold text-emerald-700 hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {currentLang === 'te' ? 'కొత్త పాస్‌వర్డ్ (New Password)' : 'New Password (min 6 characters)'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {currentLang === 'te' ? 'కొత్త పాస్‌వర్డ్‌ని నిర్ధారించండి' : 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => { setForgotStep('request'); }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-[2] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Reset &amp; Save Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      <div className="text-center text-[11px] text-slate-500 pt-4 relative z-10">
        Smart India Hackathon • Aakash AI Hyper-Local Downscaled Weather Sentinel • Andhra Pradesh
      </div>

    </div>
  );
}
