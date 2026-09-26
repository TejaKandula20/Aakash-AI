import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, Users, Radio, Activity, CheckCircle2, 
  XCircle, Clock, Server, FileText, UserPlus, RefreshCw, 
  Eye, PhoneCall, AlertTriangle, Sparkles, Filter, ChevronRight,
  Database, Layers, Search, Phone, MapPin, Sprout, Send, Plus
} from 'lucide-react';
import { apiService } from '../utils/apiService';
import { databaseService } from '../data/databaseService';
import { notificationService } from '../utils/notificationService';
import { getAssetUrl } from '../utils/assetHelper';
import { getAllDistricts, getMandalsByDistrict, PANCHAYATS_DATA } from '../data/panchayats';

export default function AdminDashboard({
  currentUser,
  onSwitchToVillageView,
  t,
  currentLang = 'en',
  onTriggerCall
}) {
  const [activeTab, setActiveTab] = useState('farmers'); // 'farmers' | 'panchayats' | 'broadcast' | 'overview' | 'users' | 'alerts' | 'audit'
  const [overviewData, setOverviewData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [alertLogs, setAlertLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Farmers database state
  const [farmersList, setFarmersList] = useState(() => databaseService.getFarmers());
  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerDistrictFilter, setFarmerDistrictFilter] = useState('');
  const [isAddFarmerOpen, setIsAddFarmerOpen] = useState(false);

  // New farmer form state
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerPhone, setNewFarmerPhone] = useState('');
  const [newFarmerDistrict, setNewFarmerDistrict] = useState('Alluri Sitharama Raju');
  const [newFarmerMandal, setNewFarmerMandal] = useState('Maredumilli');
  const [newFarmerPanchayat, setNewFarmerPanchayat] = useState('ap-asr-maredumilli');
  const [newFarmerCrop, setNewFarmerCrop] = useState('Paddy');
  const [newFarmerAcres, setNewFarmerAcres] = useState('2.5');
  const [newFarmerLang, setNewFarmerLang] = useState('te');
  const [newFarmerPref, setNewFarmerPref] = useState('Both');
  const [farmerSuccessMsg, setFarmerSuccessMsg] = useState(null);

  // Panchayats database state
  const [panchayatsList, setPanchayatsList] = useState(() => databaseService.getPanchayats());
  const [panchayatSearch, setPanchayatSearch] = useState('');
  const [panchayatDistrictFilter, setPanchayatDistrictFilter] = useState('');

  // Manual Phone Alert state
  const [manualPhone, setManualPhone] = useState('');
  const [manualHazard, setManualHazard] = useState('waterlogging');
  const [manualChannel, setManualChannel] = useState('Both');
  const [manualSending, setManualSending] = useState(false);
  const [manualAlertResult, setManualAlertResult] = useState(null);
  const [showTelephonyConfig, setShowTelephonyConfig] = useState(false);
  const [fast2smsKey, setFast2smsKey] = useState('');
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioFrom, setTwilioFrom] = useState('');
  const [telephonySavedMsg, setTelephonySavedMsg] = useState(null);

  // Broadcast state
  const [broadcastDistrict, setBroadcastDistrict] = useState('Alluri Sitharama Raju');
  const [broadcastMandal, setBroadcastMandal] = useState('Maredumilli');
  const [broadcastPanchayat, setBroadcastPanchayat] = useState('ap-asr-maredumilli');
  const [broadcastRisk, setBroadcastRisk] = useState('waterlogging');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // New user form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserPanchayat, setNewUserPanchayat] = useState('ap-asr-maredumilli');
  const [createSuccess, setCreateSuccess] = useState(null);

  
  useEffect(() => {
    fetch('/api/telephony/settings')
      .then(res => res.json())
      .then(data => {
        if (data.fast2smsApiKeyMasked) setFast2smsKey(data.fast2smsApiKeyMasked);
        if (data.twilioSidMasked) setTwilioSid(data.twilioSidMasked);
        if (data.twilioFromPhone) setTwilioFrom(data.twilioFromPhone);
      })
      .catch(() => {});
  }, []);

  const handleSaveTelephonySettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/telephony/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fast2smsApiKey: fast2smsKey.includes('••') ? undefined : fast2smsKey,
          twilioAccountSid: twilioSid.includes('••') ? undefined : twilioSid,
          twilioAuthToken: twilioToken ? twilioToken : undefined,
          twilioFromPhone: twilioFrom ? twilioFrom : undefined
        })
      });
      const data = await res.json();
      setTelephonySavedMsg('Telephony & SMS Gateway configuration saved!');
      setTimeout(() => setTelephonySavedMsg(null), 4000);
    } catch (err) {
      setError('Failed to save gateway settings.');
    }
  };

  const allDistricts = useMemo(() => getAllDistricts(), []);

  // Filtered dropdown lists for new farmer form
  const newFarmerAvailableMandals = useMemo(() => getMandalsByDistrict(newFarmerDistrict), [newFarmerDistrict]);
  const newFarmerAvailablePanchayats = useMemo(() => {
    return PANCHAYATS_DATA.filter(p => 
      p.district.toLowerCase() === newFarmerDistrict.toLowerCase() &&
      (p.taluk.toLowerCase() === newFarmerMandal.toLowerCase() || (p.mandal && p.mandal.toLowerCase() === newFarmerMandal.toLowerCase()))
    );
  }, [newFarmerDistrict, newFarmerMandal]);

  // Filtered dropdown lists for mass broadcast form
  const broadcastAvailableMandals = useMemo(() => getMandalsByDistrict(broadcastDistrict), [broadcastDistrict]);
  const broadcastAvailablePanchayats = useMemo(() => {
    return PANCHAYATS_DATA.filter(p => 
      p.district.toLowerCase() === broadcastDistrict.toLowerCase() &&
      (p.taluk.toLowerCase() === broadcastMandal.toLowerCase() || (p.mandal && p.mandal.toLowerCase() === broadcastMandal.toLowerCase()))
    );
  }, [broadcastDistrict, broadcastMandal]);

  // Panchayats table pagination
  const [panchayatPage, setPanchayatPage] = useState(1);
  const PANCHAYATS_PER_PAGE = 30;

  useEffect(() => {
    if (newFarmerAvailablePanchayats.length > 0 && !newFarmerAvailablePanchayats.some(p => p.id === newFarmerPanchayat)) {
      setNewFarmerPanchayat(newFarmerAvailablePanchayats[0].id);
    }
  }, [newFarmerAvailablePanchayats, newFarmerPanchayat]);

  useEffect(() => {
    if (broadcastAvailablePanchayats.length > 0 && !broadcastAvailablePanchayats.some(p => p.id === broadcastPanchayat)) {
      setBroadcastPanchayat(broadcastAvailablePanchayats[0].id);
    }
  }, [broadcastAvailablePanchayats, broadcastPanchayat]);

  // Subscribe to databaseService reactive updates
  useEffect(() => {
    const unsub = databaseService.subscribe(() => {
      setFarmersList(databaseService.getFarmers());
      setPanchayatsList(databaseService.getPanchayats());
    });
    return unsub;
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAdminOverview();
      setOverviewData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminUsers();
      setUsersList(res.users || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertLogs = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminAlertLogs();
      setAlertLogs(res.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch alert logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminAuditLogs();
      setAuditLogs(res.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') fetchOverview();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'alerts') fetchAlertLogs();
    else if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  // Handle register farmer
  const handleRegisterFarmer = (e) => {
    e.preventDefault();
    if (!newFarmerName || !newFarmerPhone) {
      setError('Farmer name and phone number are required.');
      return;
    }

    const panchayatObj = PANCHAYATS_DATA.find(p => p.id === newFarmerPanchayat) || PANCHAYATS_DATA[0];

    const created = databaseService.addFarmer({
      name: newFarmerName,
      phone: newFarmerPhone,
      district: newFarmerDistrict,
      mandal: newFarmerMandal,
      panchayatId: panchayatObj.id,
      panchayatName: panchayatObj.localName || panchayatObj.name,
      primaryCrop: newFarmerCrop,
      landAcres: parseFloat(newFarmerAcres) || 2.5,
      language: newFarmerLang,
      alertPreference: newFarmerPref
    });

    apiService.addFarmer({
      name: newFarmerName,
      phone: newFarmerPhone,
      district: newFarmerDistrict,
      mandal: newFarmerMandal,
      panchayatId: panchayatObj.id,
      panchayatName: panchayatObj.localName || panchayatObj.name,
      primaryCrop: newFarmerCrop,
      landAcres: parseFloat(newFarmerAcres) || 2.5,
      language: newFarmerLang,
      alertPreference: newFarmerPref
    }).catch(() => {});

    setFarmerSuccessMsg(`Farmer ${created.name} (${created.phone}) registered successfully in ${created.panchayatName}!`);
    setNewFarmerName('');
    setNewFarmerPhone('');
    setIsAddFarmerOpen(false);
    setFarmersList(databaseService.getFarmers());
  };

  // Live lookup of farmer when phone is typed in Manual Alert section
  const matchedFarmerForPhone = useMemo(() => {
    if (!manualPhone || manualPhone.trim().length < 5) return null;
    return databaseService.getFarmerByPhone(manualPhone);
  }, [manualPhone, farmersList]);

  // Dispatch Manual Alert by Phone
  const handleSendManualPhoneAlert = async (e) => {
    if (e) e.preventDefault();
    if (!manualPhone) {
      setError('Please enter a valid phone number.');
      return;
    }

    setManualSending(true);
    setError(null);
    setManualAlertResult(null);

    try {
      // 1. Dispatch native OS system notification
      notificationService.sendSystemNotification({
        title: `🚨 Emergency Alert Dispatched to ${manualPhone}`,
        body: `Hazard condition (${manualHazard}) alert initiated for recipient ${manualPhone}.`,
        tag: `manual-phone-alert-${Date.now()}`
      });

      const res = await apiService.sendManualPhoneAlert(
        manualPhone,
        manualHazard,
        `Manual Operator Emergency Alert Dispatched to ${manualPhone}`
      );

      setManualAlertResult(res);
      setFarmersList(databaseService.getFarmers());

      // 1. AUTO-RING CALL: Immediately open IncomingCallHUD with loud ringing & Indic speech
      if (manualChannel === 'Both' || manualChannel === 'Voice') {
        if (onTriggerCall) {
          onTriggerCall(manualHazard);
        }
      }

      // 2. AUTO-OPEN WHATSAPP: Instantly deliver message to recipient's phone via WhatsApp
      if (manualChannel === 'Both' || manualChannel === 'SMS') {
        const textPayload = res.smsText || `[ఆకాశ్ AI అత్యవసర హెచ్చరిక] మీ ప్రాంతంలో వాతావరణ ముప్పు (${manualHazard}) గుర్తించబడింది. జాగ్రత్తలు పాటించండి. హెల్ప్‌లైన్: 1800-AAKASH`;
        notificationService.openWhatsApp(manualPhone, textPayload);
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch manual alert.');
    } finally {
      setManualSending(false);
    }
  };

  // Dispatch Panchayat-Wide Risk Alert to all registered farmers
  const handlePanchayatRiskBroadcast = async (pId, hazard = 'waterlogging') => {
    setBroadcasting(true);
    setError(null);
    setBroadcastResult(null);

    try {
      const res = await apiService.dispatchPanchayatRisk(pId, hazard, 'Panchayat-Wide Automated Risk Trigger');
      setBroadcastResult(res);
      setFarmersList(databaseService.getFarmers());
      setPanchayatsList(databaseService.getPanchayats());
    } catch (err) {
      setError(err.message || 'Failed to dispatch panchayat alert.');
    } finally {
      setBroadcasting(false);
    }
  };

  // Filtered farmers
  const filteredFarmers = useMemo(() => {
    return databaseService.getFarmers({
      search: farmerSearch,
      district: farmerDistrictFilter
    });
  }, [farmerSearch, farmerDistrictFilter, farmersList]);

  // Filtered panchayats
  const filteredPanchayats = useMemo(() => {
    return databaseService.getPanchayats({
      search: panchayatSearch,
      district: panchayatDistrictFilter
    });
  }, [panchayatSearch, panchayatDistrictFilter, panchayatsList]);

  const totalPanchayatPages = Math.ceil(filteredPanchayats.length / PANCHAYATS_PER_PAGE) || 1;
  const paginatedPanchayats = useMemo(() => {
    const start = (panchayatPage - 1) * PANCHAYATS_PER_PAGE;
    return filteredPanchayats.slice(start, start + PANCHAYATS_PER_PAGE);
  }, [filteredPanchayats, panchayatPage]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url(${getAssetUrl('/assets/images/hero-landscape.jpg')})` }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <img 
              src={getAssetUrl('/assets/images/aakash-crest.svg')} 
              alt="Aakash AI" 
              className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 drop-shadow-xl hover:scale-105 transition-transform" 
            />
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                  State Command &amp; Control
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30">
                  Admin: {currentUser?.username || 'Teja Kandula'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                <span>Aakash AI Command Center</span>
                <span className="text-xs sm:text-sm font-normal text-emerald-300/80 font-mono">13,326 GP Mesh</span>
              </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Centralized monitoring for 13,326 Gram Panchayats, dual-table Farmers &amp; Panchayats database management, phone-based manual alerts, and emergency sentinels.
            </p>
          </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={onSwitchToVillageView}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all shadow-sm active:scale-95"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Inspect Village View</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          {[
            { id: 'farmers', label: '🌾 Farmers Database', icon: Users },
            { id: 'panchayats', label: '🏛️ Panchayats Database', icon: Layers },
            { id: 'broadcast', label: '🚨 Emergency Alerts & Phone Dispatch', icon: PhoneCall },
            { id: 'overview', label: 'System Analytics', icon: Activity },
            { id: 'users', label: 'User Roles', icon: UserPlus },
            { id: 'alerts', label: 'Alert Records', icon: Radio },
            { id: 'audit', label: 'Security Audit Logs', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Alerts / Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {farmerSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{farmerSuccessMsg}</span>
          </div>
          <button onClick={() => setFarmerSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: FARMERS DATABASE */}
      {/* ======================================================== */}
      {activeTab === 'farmers' && (
        <div className="space-y-6">
          
          {/* Top Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Registered Farmers</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{farmersList.length}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Live Database Records</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Monitored Land</div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-900">
                {farmersList.reduce((acc, f) => acc + (f.landAcres || 0), 0).toFixed(1)} <span className="text-sm font-semibold text-slate-500">acres</span>
              </div>
              <div className="text-[11px] text-indigo-600 font-semibold mt-1">Under Agro-Sentinel</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Voice &amp; SMS Coverage</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {Math.round((farmersList.filter(f => f.alertPreference === 'Both').length / (farmersList.length || 1)) * 100)}%
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Dual-Channel Delivery</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Recent Alerts Dispatched</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600">
                {farmersList.filter(f => f.lastAlertAt).length}
              </div>
              <div className="text-[11px] text-amber-700 font-semibold mt-1">Farmers Alerted</div>
            </div>
          </div>

          {/* Search, Filter & Action Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={farmerSearch}
                  onChange={(e) => setFarmerSearch(e.target.value)}
                  placeholder="Search farmers by name, phone, panchayat, or crop..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={farmerDistrictFilter}
                onChange={(e) => setFarmerDistrictFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Districts ({allDistricts.length})</option>
                {allDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsAddFarmerOpen(!isAddFarmerOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Farmer</span>
            </button>
          </div>

          {/* Inline Register Farmer Form */}
          {isAddFarmerOpen && (
            <div className="bg-emerald-50/80 p-6 rounded-3xl border border-emerald-200 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Register Farmer into Live Database</span>
                </div>
                <button onClick={() => setIsAddFarmerOpen(false)} className="text-slate-500 hover:text-slate-800 text-xs font-bold">Cancel</button>
              </div>

              <form onSubmit={handleRegisterFarmer} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Farmer Full Name</label>
                  <input
                    type="text"
                    required
                    value={newFarmerName}
                    onChange={(e) => setNewFarmerName(e.target.value)}
                    placeholder="e.g. రమేష్ రెడ్డి / Ramesh Reddy"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mobile Number (For Calls &amp; SMS)</label>
                  <input
                    type="tel"
                    required
                    value={newFarmerPhone}
                    onChange={(e) => setNewFarmerPhone(e.target.value)}
                    placeholder="e.g. +91 98480 12345"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">District</label>
                  <select
                    value={newFarmerDistrict}
                    onChange={(e) => {
                      setNewFarmerDistrict(e.target.value);
                      const mandals = getMandalsByDistrict(e.target.value);
                      if (mandals.length > 0) setNewFarmerMandal(mandals[0].name);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {allDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mandal</label>
                  <select
                    value={newFarmerMandal}
                    onChange={(e) => setNewFarmerMandal(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {newFarmerAvailableMandals.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Gram Panchayat</label>
                  <select
                    value={newFarmerPanchayat}
                    onChange={(e) => setNewFarmerPanchayat(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
                  >
                    {newFarmerAvailablePanchayats.map(p => (
                      <option key={p.id} value={p.id}>{p.localName || p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Primary Crop</label>
                  <select
                    value={newFarmerCrop}
                    onChange={(e) => setNewFarmerCrop(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Paddy">Paddy (వరి)</option>
                    <option value="Cotton">Cotton (పత్తి)</option>
                    <option value="Chilli">Chilli (మిరప)</option>
                    <option value="Maize">Maize (మొక్కజొన్న)</option>
                    <option value="Groundnut">Groundnut (వేరుశనగ)</option>
                    <option value="Tomato">Tomato (టమోటా)</option>
                    <option value="Coffee">Coffee (కాఫీ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Land Size (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={newFarmerAcres}
                    onChange={(e) => setNewFarmerAcres(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Alert Channel</label>
                  <select
                    value={newFarmerPref}
                    onChange={(e) => setNewFarmerPref(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Both">Both Voice Call &amp; SMS</option>
                    <option value="Voice">Voice Call Only</option>
                    <option value="SMS">SMS Only</option>
                  </select>
                </div>

                <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
                  >
                    Confirm &amp; Save Farmer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Farmers Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Registered Farmers Registry</h3>
                <p className="text-xs text-slate-500">Showing {filteredFarmers.length} registered farmers across Gram Panchayats</p>
              </div>
              <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                Table: farmers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Farmer Name</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">Gram Panchayat</th>
                    <th className="py-3 px-4">Mandal &amp; District</th>
                    <th className="py-3 px-4">Crop &amp; Land</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Last Alert</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFarmers.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0">
                          {f.name.charAt(0)}
                        </div>
                        <div>
                          <div>{f.name}</div>
                          <div className="text-[10px] text-slate-400">ID #{f.id}</div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {f.phone}
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-800">
                        {f.panchayatName}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div>{f.mandal}</div>
                        <div className="text-[10px] text-slate-400">{f.district}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-semibold text-slate-900">{f.primaryCrop}</span> • {f.landAcres} ac
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                          {f.alertPreference}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {f.lastAlertAt ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            {f.lastAlertType} ({f.lastAlertAt.slice(0, 10)})
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">None Yet</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setManualPhone(f.phone);
                            setActiveTab('broadcast');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all"
                        >
                          Direct Alert
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: PANCHAYATS DATABASE */}
      {/* ======================================================== */}
      {activeTab === 'panchayats' && (
        <div className="space-y-6">
          
          {/* Panchayats Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Panchayats Indexed</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">13,326</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">All 26 Districts Connected</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">High Elevation Zones</div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-900">
                {panchayatsList.filter(p => p.elevationMeters > 500).length} <span className="text-sm font-semibold text-slate-500">hubs</span>
              </div>
              <div className="text-[11px] text-indigo-600 font-semibold mt-1">Mountain &amp; Eastern Ghats</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Active Risk Status</div>
              <div className="text-2xl sm:text-3xl font-black text-rose-600">
                {panchayatsList.filter(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'WARNING').length}
              </div>
              <div className="text-[11px] text-rose-600 font-semibold mt-1">Hazard Flags Monitored</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Farmers Connected</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {farmersList.length}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Across Seeded Hubs</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={panchayatSearch}
                  onChange={(e) => setPanchayatSearch(e.target.value)}
                  placeholder="Search panchayats by name, mandal, or district..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={panchayatDistrictFilter}
                onChange={(e) => setPanchayatDistrictFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Districts ({allDistricts.length})</option>
                {allDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Panchayats Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Gram Panchayats Database</h3>
                <p className="text-xs text-slate-500">Showing {filteredPanchayats.length} Gram Panchayats with terrain elevation and risk profile</p>
              </div>
              <span className="text-[11px] px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                Table: panchayats
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Gram Panchayat</th>
                    <th className="py-3 px-4">Vernacular Name</th>
                    <th className="py-3 px-4">Mandal &amp; District</th>
                    <th className="py-3 px-4">Elevation (SRTM)</th>
                    <th className="py-3 px-4">Soil Texture</th>
                    <th className="py-3 px-4">Registered Farmers</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPanchayats.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.name}
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-800">
                        {p.localName}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div>{p.mandal}</div>
                        <div className="text-[10px] text-slate-400">{p.district}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {p.elevationMeters}m
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {p.soilType}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                          {p.registeredFarmersCount} farmers
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          p.riskLevel === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : p.riskLevel === 'WARNING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {p.riskLevel}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handlePanchayatRiskBroadcast(p.id, p.activeHazard || 'waterlogging')}
                          disabled={broadcasting}
                          className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-sm transition-all disabled:opacity-50"
                        >
                          🚨 Broadcast Alert
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-600">
                Showing <strong>{(panchayatPage - 1) * PANCHAYATS_PER_PAGE + 1}</strong> to <strong>{Math.min(panchayatPage * PANCHAYATS_PER_PAGE, filteredPanchayats.length)}</strong> of <strong>{filteredPanchayats.length}</strong> Gram Panchayats
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPanchayatPage(p => Math.max(p - 1, 1))}
                  disabled={panchayatPage <= 1}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  ← Previous
                </button>

                <span className="px-3 py-1 font-bold text-slate-800 bg-white rounded-xl border border-slate-200">
                  Page {panchayatPage} of {totalPanchayatPages}
                </span>

                <button
                  onClick={() => setPanchayatPage(p => Math.min(p + 1, totalPanchayatPages))}
                  disabled={panchayatPage >= totalPanchayatPages}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: EMERGENCY ALERTS & MANUAL PHONE DISPATCH */}
      {/* ======================================================== */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* SECTION 1: MANUAL PHONE NUMBER ALERT TOOL */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Manual Alert by Farmer Phone Number</h3>
                <p className="text-xs text-slate-500">Dispatch voice calls and SMS to specific registered or newly registered farmers</p>
              </div>
            </div>

            <form onSubmit={handleSendManualPhoneAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="e.g. +91 98480 11234 or 9848011234"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Live Lookup Feedback */}
                {manualPhone.trim().length >= 5 && (
                  <div className="mt-2 text-xs">
                    {matchedFarmerForPhone ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Verified Registered Farmer:</span> {matchedFarmerForPhone.name}
                          <div className="text-[11px] text-emerald-800">
                            Panchayat: <strong>{matchedFarmerForPhone.panchayatName}</strong> • Crop: {matchedFarmerForPhone.primaryCrop} ({matchedFarmerForPhone.landAcres} ac)
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                        ℹ️ Number not yet in database. Dispatching will instantly index and record this farmer.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Hazard Condition</label>
                <select
                  value={manualHazard}
                  onChange={(e) => setManualHazard(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="waterlogging">Flash Flood &amp; Waterlogging Risk (Rainfall &gt; 35mm)</option>
                  <option value="scorching_sun">Scorching Heatwave (Canopy Temp &gt; 38.5°C)</option>
                  <option value="wind_squall">Squall &amp; Gale Lodging Risk (Wind Gusts &gt; 45 km/h)</option>
                  <option value="thunderstorm">Thunderstorm &amp; Severe Lightning Advisory</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Channel</label>
                <select
                  value={manualChannel}
                  onChange={(e) => setManualChannel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Both">Both Voice Call (IVR) &amp; Actionable SMS</option>
                  <option value="Voice">Voice Call Only (IVR)</option>
                  <option value="SMS">Actionable SMS Only</option>
                </select>
              </div>

              {manualAlertResult && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Alert Dispatched to {manualPhone}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-mono">
                      {manualAlertResult.dispatchedAt ? new Date(manualAlertResult.dispatchedAt).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">{manualAlertResult.message}</p>

                  {/* Delivery Channel Status Indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 block">Voice Call Status:</span>
                        <span className="text-slate-600">
                          {manualAlertResult.callDispatched ? '✅ Cellular carrier call active' : '📞 Call audio ringing in HUD'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 block">SMS / Message Status:</span>
                        <span className="text-slate-600">
                          {manualAlertResult.smsDispatched ? '✅ Cellular carrier SMS sent' : '💬 WhatsApp / Native SMS active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SMS Payload Display */}
                  {manualAlertResult.smsText && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-slate-800 text-[11px] leading-relaxed shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                        Dispatched Advisory Payload:
                      </span>
                      "{manualAlertResult.smsText}"
                    </div>
                  )}

                  {/* Direct Delivery Actions */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Direct 1-Click Handset Actions:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => notificationService.openWhatsApp(manualPhone, manualAlertResult.smsText || 'Emergency Alert from Aakash AI')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        title="Open WhatsApp directly with alert pre-filled"
                      >
                        <span>💬 Deliver via WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => notificationService.openNativeSms(manualPhone, manualAlertResult.smsText || 'Emergency Alert from Aakash AI')}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        title="Open device native SMS app with message prefilled"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>📱 Open Native SMS App</span>
                      </button>

                      {onTriggerCall && (
                        <button
                          type="button"
                          onClick={() => onTriggerCall(manualHazard)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                          title="Ring the incoming emergency call audio HUD now"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>📞 Re-ring Call Audio</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway Configuration Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTelephonyConfig(!showTelephonyConfig)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5"
                >
                  <span>⚙️ {showTelephonyConfig ? 'Hide' : 'Configure'} Cellular SMS &amp; Phone Call Gateway (Fast2SMS / Twilio)</span>
                </button>

                {showTelephonyConfig && (
                  <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3 animate-fade-in">
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      To send <strong>direct cellular carrier SMS</strong> or make <strong>actual telephone calls</strong> to physical mobile phone SIM cards in India, provide a Fast2SMS API key (free signup in India) or Twilio credentials:
                    </p>

                    {telephonySavedMsg && (
                      <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-[11px]">
                        ✓ {telephonySavedMsg}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                          Fast2SMS API Key (Instant Indian Cellular SMS):
                        </label>
                        <input
                          type="password"
                          value={fast2smsKey}
                          onChange={(e) => setFast2smsKey(e.target.value)}
                          placeholder="Paste Fast2SMS API Key"
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                            Twilio Account SID:
                          </label>
                          <input
                            type="text"
                            value={twilioSid}
                            onChange={(e) => setTwilioSid(e.target.value)}
                            placeholder="ACxxxxxxxx"
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                            Twilio Auth Token:
                          </label>
                          <input
                            type="password"
                            value={twilioToken}
                            onChange={(e) => setTwilioToken(e.target.value)}
                            placeholder="Auth Token"
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                            Twilio From Phone:
                          </label>
                          <input
                            type="tel"
                            value={twilioFrom}
                            onChange={(e) => setTwilioFrom(e.target.value)}
                            placeholder="+1xxxxxxxxxx"
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleSaveTelephonySettings}
                          className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          Save Gateway Keys
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={manualSending}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{manualSending ? 'Dispatching Emergency Alert...' : 'Send Alert to Phone Number'}</span>
              </button>
            </form>
          </div>

          {/* SECTION 2: PANCHAYAT-WIDE MASS BROADCAST */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-500/20">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Panchayat-Wide Automated Risk Broadcast</h3>
                <p className="text-xs text-slate-500">When hazard is detected, automatically alerts ALL registered farmers in that panchayat</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Target District</label>
                  <select
                    value={broadcastDistrict}
                    onChange={(e) => {
                      setBroadcastDistrict(e.target.value);
                      const m = getMandalsByDistrict(e.target.value);
                      if (m.length > 0) setBroadcastMandal(m[0].name);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {allDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Target Mandal</label>
                  <select
                    value={broadcastMandal}
                    onChange={(e) => setBroadcastMandal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {broadcastAvailableMandals.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Target Panchayat</label>
                  <select
                    value={broadcastPanchayat}
                    onChange={(e) => setBroadcastPanchayat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 truncate"
                  >
                    {broadcastAvailablePanchayats.map(p => (
                      <option key={p.id} value={p.id}>{p.localName || p.name} ({p.elevationMeters}m)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hazard Risk Trigger</label>
                <select
                  value={broadcastRisk}
                  onChange={(e) => setBroadcastRisk(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="waterlogging">Flash Flood &amp; Severe Waterlogging (Rainfall &gt; 35mm)</option>
                  <option value="scorching_sun">Scorching Heatwave (Canopy Temp &gt; 38.5°C)</option>
                  <option value="wind_squall">Squall &amp; Crop Lodging (Wind Gusts &gt; 45 km/h)</option>
                  <option value="thunderstorm">Severe Lightning &amp; Cloudburst</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Mass Broadcast Effect:</strong> This triggers autonomous emergency alerts to <strong>every single farmer registered in this Gram Panchayat</strong> ({databaseService.getFarmersCountByPanchayat(broadcastPanchayat)} farmers).
                </span>
              </div>

              {broadcastResult && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Broadcast Completed Successfully!</span>
                  </div>
                  <p>{broadcastResult.message}</p>
                  <div className="text-[10px] text-emerald-700 font-mono">Dispatched to {broadcastResult.targetedFarmersCount || broadcastResult.recipientCount} registered farmers.</div>
                </div>
              )}

              <button
                onClick={() => handlePanchayatRiskBroadcast(broadcastPanchayat, broadcastRisk)}
                disabled={broadcasting}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 active:scale-98 transition-all disabled:opacity-50"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{broadcasting ? 'Broadcasting to All Farmers...' : 'Broadcast to All Registered Farmers'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: SYSTEM ANALYTICS */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Panchayats</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">13,326</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Coverage (26 Districts)</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Registered Users</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{overviewData?.systemStats?.registeredUsers || 3}</div>
              <div className="text-[11px] text-indigo-600 font-semibold mt-1">Active Accounts</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Farmers in Database</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">{farmersList.length}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Live Relational Store</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">AI/ML Downscaling</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">NOMINAL</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">Lapse Rate (-6.5°C/1000m)</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              Database &amp; Storage Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <span className="font-bold text-slate-900 block text-sm">🌾 Table: farmers</span>
                <p className="text-slate-600">Stores farmer names, verified mobile numbers, panchayat linking, crop varieties, land holdings, language preferences, and alert histories.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <span className="font-bold text-slate-900 block text-sm">🏛️ Table: panchayats</span>
                <p className="text-slate-600">Stores all Gram Panchayats with ISRO Bhuvan / SRTM 30m elevation models, coordinates, soil types, risk sentinel levels, and live farmer counts.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: USER ROLES */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">User Account &amp; Access Governance</h3>
                <p className="text-xs text-slate-500">Manage administrator and farmer user accounts with role-based access</p>
              </div>
              <button onClick={fetchUsers} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Assigned Location</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{u.username}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {u.assigned_panchayat_name || 'Maredumilli'} ({u.assigned_district || 'ASR'})
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: ALERT RECORDS */}
      {/* ======================================================== */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Historical Alert Dispatch Records</h3>
              <p className="text-xs text-slate-500">Live records of automated emergency calls and SMS broadcasts</p>
            </div>
            <button onClick={fetchAlertLogs} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Gram Panchayat</th>
                  <th className="py-3 px-4">Hazard Risk</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alertLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{log.date_str}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{log.panchayat_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                        {log.risk_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">{log.channel}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{log.recipient_count} farmers</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: AUDIT LOGS */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Security &amp; Operational Audit Logs</h3>
              <p className="text-xs text-slate-500">Immutable server-side logs recording authentication events, role blocks, and dispatches</p>
            </div>
            <button onClick={fetchAuditLogs} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.created_at}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.username}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
