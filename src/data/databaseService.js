// Aakash AI Universal Database Service
// Manages separate, relational databases for 'farmers' and 'panchayats'
// Supports both client-side offline persistence (localStorage) and backend synchronization

import { PANCHAYATS_DATA, resolvePanchayat } from './panchayats.js';

const FARMERS_STORAGE_KEY = 'aakash_db_farmers_v2';
const PANCHAYATS_STORAGE_KEY = 'aakash_db_panchayats_v2';

// Initial demo farmers seeded across key Gram Panchayats
const INITIAL_FARMERS = [
  {
    id: 1,
    name: 'వరికూటి సుబ్బారావు (Varikuti Subbarao)',
    phone: '+91 98480 11234',
    maskedPhone: '+91 98480 •••••',
    district: 'Alluri Sitharama Raju',
    mandal: 'Maredumilli',
    panchayatId: 'ap-asr-maredumilli',
    panchayatName: 'Maredumilli',
    primaryCrop: 'Paddy',
    landAcres: 3.5,
    language: 'te',
    alertPreference: 'Both',
    isActive: true,
    registeredAt: '2026-09-20T09:30:00+05:30',
    lastAlertAt: '2026-09-24T07:15:00+05:30',
    lastAlertType: 'waterlogging',
    lastAlertStatus: 'DELIVERED'
  },
  {
    id: 2,
    name: 'కోటేశ్వరరావు (Koteswara Rao)',
    phone: '+91 94401 22345',
    maskedPhone: '+91 94401 •••••',
    district: 'Alluri Sitharama Raju',
    mandal: 'Maredumilli',
    panchayatId: 'ap-asr-maredumilli',
    panchayatName: 'Maredumilli',
    primaryCrop: 'Cotton',
    landAcres: 2.0,
    language: 'te',
    alertPreference: 'Voice',
    isActive: true,
    registeredAt: '2026-09-21T11:20:00+05:30',
    lastAlertAt: '2026-09-24T07:15:00+05:30',
    lastAlertType: 'waterlogging',
    lastAlertStatus: 'DELIVERED'
  },
  {
    id: 3,
    name: 'పి. సత్యనారాయణ (P. Satyanarayana)',
    phone: '+91 89781 33456',
    maskedPhone: '+91 89781 •••••',
    district: 'Alluri Sitharama Raju',
    mandal: 'Maredumilli',
    panchayatId: 'ap-asr-maredumilli',
    panchayatName: 'Maredumilli',
    primaryCrop: 'Maize',
    landAcres: 4.2,
    language: 'te',
    alertPreference: 'SMS',
    isActive: true,
    registeredAt: '2026-09-22T14:45:00+05:30',
    lastAlertAt: '2026-09-24T07:15:00+05:30',
    lastAlertType: 'waterlogging',
    lastAlertStatus: 'DELIVERED'
  },
  {
    id: 4,
    name: 'చింతల అప్పలరాజు (Chintala Appalaraju)',
    phone: '+91 70932 44567',
    maskedPhone: '+91 70932 •••••',
    district: 'Alluri Sitharama Raju',
    mandal: 'Maredumilli',
    panchayatId: 'ap-asr-maredumilli',
    panchayatName: 'Maredumilli',
    primaryCrop: 'Paddy',
    landAcres: 1.8,
    language: 'te',
    alertPreference: 'Both',
    isActive: true,
    registeredAt: '2026-09-23T08:10:00+05:30',
    lastAlertAt: '2026-09-24T07:15:00+05:30',
    lastAlertType: 'waterlogging',
    lastAlertStatus: 'DELIVERED'
  },
  {
    id: 5,
    name: 'బి. కామేశ్వరరావు (B. Kameswara Rao)',
    phone: '+91 91002 55678',
    maskedPhone: '+91 91002 •••••',
    district: 'Alluri Sitharama Raju',
    mandal: 'Araku Valley',
    panchayatId: 'ap-asr-araku',
    panchayatName: 'Araku Valley',
    primaryCrop: 'Coffee',
    landAcres: 5.0,
    language: 'te',
    alertPreference: 'Both',
    isActive: true,
    registeredAt: '2026-09-21T10:00:00+05:30',
    lastAlertAt: null,
    lastAlertType: null,
    lastAlertStatus: null
  },
  {
    id: 6,
    name: 'ఎం. తారకరాముడు (M. Tarakaramudu)',
    phone: '+91 98492 66789',
    maskedPhone: '+91 98492 •••••',
    district: 'Alluri Sitharama Raju',
    mandal: 'Araku Valley',
    panchayatId: 'ap-asr-araku',
    panchayatName: 'Araku Valley',
    primaryCrop: 'Pepper',
    landAcres: 3.0,
    language: 'te',
    alertPreference: 'Voice',
    isActive: true,
    registeredAt: '2026-09-22T16:15:00+05:30',
    lastAlertAt: null,
    lastAlertType: null,
    lastAlertStatus: null
  },
  {
    id: 7,
    name: 'కె. వెంకటరమణ (K. Venkataramana)',
    phone: '+91 94405 77890',
    maskedPhone: '+91 94405 •••••',
    district: 'YSR Kadapa',
    mandal: 'Pulivendula',
    panchayatId: 'ap-kadapa-pulivendula',
    panchayatName: 'Pulivendula',
    primaryCrop: 'Groundnut',
    landAcres: 6.0,
    language: 'te',
    alertPreference: 'Both',
    isActive: true,
    registeredAt: '2026-09-20T12:00:00+05:30',
    lastAlertAt: '2026-09-24T12:30:00+05:30',
    lastAlertType: 'scorching_sun',
    lastAlertStatus: 'DELIVERED'
  },
  {
    id: 8,
    name: 'రామకృష్ణారెడ్డి (Ramakrishna Reddy)',
    phone: '+91 99890 88901',
    maskedPhone: '+91 99890 •••••',
    district: 'YSR Kadapa',
    mandal: 'Pulivendula',
    panchayatId: 'ap-kadapa-pulivendula',
    panchayatName: 'Pulivendula',
    primaryCrop: 'Banana',
    landAcres: 4.5,
    language: 'te',
    alertPreference: 'SMS',
    isActive: true,
    registeredAt: '2026-09-22T09:10:00+05:30',
    lastAlertAt: '2026-09-24T12:30:00+05:30',
    lastAlertType: 'scorching_sun',
    lastAlertStatus: 'DELIVERED'
  },
  {
    id: 9,
    name: 'సురేష్ నాయుడు (Suresh Naidu)',
    phone: '+91 91772 99012',
    maskedPhone: '+91 91772 •••••',
    district: 'Guntur',
    mandal: 'Tenali',
    panchayatId: 'ap-guntur-tenali',
    panchayatName: 'Tenali',
    primaryCrop: 'Paddy',
    landAcres: 5.2,
    language: 'te',
    alertPreference: 'Both',
    isActive: true,
    registeredAt: '2026-09-19T14:00:00+05:30',
    lastAlertAt: null,
    lastAlertType: null,
    lastAlertStatus: null
  },
  {
    id: 10,
    name: 'ఆంజనేయులు (Anjaneyulu)',
    phone: '+91 83319 10123',
    maskedPhone: '+91 83319 •••••',
    district: 'Annamayya',
    mandal: 'Madanapalle',
    panchayatId: 'ap-annamayya-valasapalle',
    panchayatName: 'Valasapalle',
    primaryCrop: 'Tomato',
    landAcres: 2.8,
    language: 'te',
    alertPreference: 'Both',
    isActive: true,
    registeredAt: '2026-09-23T11:00:00+05:30',
    lastAlertAt: null,
    lastAlertType: null,
    lastAlertStatus: null
  },
  {
    id: 11,
    name: 'prasanna',
    phone: '9392705998',
    maskedPhone: '+91 93927 •••••',
    district: 'Palnadu',
    mandal: 'Narasaraopet',
    panchayatId: 'ap-pld-narasaraopet-1',
    panchayatName: 'నరసరావుపేట గ్రామ పంచాయతీ',
    primaryCrop: 'Paddy',
    landAcres: 2.5,
    language: 'te',
    alertPreference: 'Both',
    isActive: true,
    registeredAt: '2026-09-25T19:19:03+05:30',
    lastAlertAt: '2026-09-25T20:11:38+05:30',
    lastAlertType: 'waterlogging',
    lastAlertStatus: 'DELIVERED'
  }
];

// Helper to sanitize and normalize phone numbers for consistent matching
export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  return String(phone).replace(/[^\d+]/g, '');
}

export function maskPhoneNumber(phone) {
  if (!phone) return '+91 98480 •••••';
  const clean = normalizePhoneNumber(phone);
  const digits = clean.replace(/\D/g, '');
  if (digits.length >= 10) {
    const prefix = digits.slice(0, 5);
    return `+91 ${prefix} •••••`;
  }
  return clean;
}

class DatabaseService {
  constructor() {
    this._listeners = new Set();
    this.farmers = this._loadFarmers();
    this.panchayats = this._loadPanchayats();
  }

  // Subscribe to reactive database changes
  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  _notify() {
    this._listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error('DB listener error:', e); }
    });
  }

  _loadFarmers() {
    if (typeof window === 'undefined') return INITIAL_FARMERS;
    try {
      const saved = localStorage.getItem(FARMERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with initial seeded farmers so registered ones (like prasanna) are never lost
          const existingPhones = new Set(
            parsed.map(f => (f.phone || '').replace(/\D/g, '').slice(-10))
          );
          const missingSeeded = INITIAL_FARMERS.filter(
            f => !existingPhones.has((f.phone || '').replace(/\D/g, '').slice(-10))
          );
          if (missingSeeded.length > 0) {
            const merged = [...parsed, ...missingSeeded];
            try {
              localStorage.setItem(FARMERS_STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {}
            return merged;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load farmers from localStorage:', e);
    }
    // Seed initial farmers if no cache exists
    try {
      localStorage.setItem(FARMERS_STORAGE_KEY, JSON.stringify(INITIAL_FARMERS));
    } catch (e) {}
    return [...INITIAL_FARMERS];
  }

  _saveFarmers() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FARMERS_STORAGE_KEY, JSON.stringify(this.farmers));
      } catch (e) {
        console.warn('Could not save farmers to localStorage:', e);
      }
    }
    this._notify();
  }

  _loadPanchayats() {
    const basePanchayats = PANCHAYATS_DATA.map(p => ({
      id: p.id,
      name: p.name,
      localName: p.localName || p.name,
      district: p.district,
      mandal: p.taluk || p.mandal || p.district,
      elevationMeters: p.elevationMeters || 100,
      latitude: p.latitude || 16.5,
      longitude: p.longitude || 80.5,
      soilType: p.soilType || 'Red Sandy Loam',
      riskLevel: p.riskLevel || (p.elevationMeters > 500 ? 'WARNING' : 'NORMAL'),
      activeHazard: p.elevationMeters > 500 ? 'waterlogging' : null,
      lastAlertDate: null,
      createdAt: '2026-09-01T00:00:00+05:30'
    }));

    if (typeof window === 'undefined') return basePanchayats;
    try {
      const saved = localStorage.getItem(PANCHAYATS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    try {
      localStorage.setItem(PANCHAYATS_STORAGE_KEY, JSON.stringify(basePanchayats));
    } catch (e) {}
    return basePanchayats;
  }

  _savePanchayats() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PANCHAYATS_STORAGE_KEY, JSON.stringify(this.panchayats));
      } catch (e) {
        console.warn('Could not save panchayats to localStorage:', e);
      }
    }
    this._notify();
  }

  // ==========================================
  // FARMERS DATABASE API
  // ==========================================

  getFarmers(filter = {}) {
    let result = [...this.farmers];

    if (filter.panchayatId) {
      result = result.filter(f => f.panchayatId === filter.panchayatId);
    }
    if (filter.district) {
      result = result.filter(f => f.district.toLowerCase() === filter.district.toLowerCase());
    }
    if (filter.mandal) {
      result = result.filter(f => f.mandal.toLowerCase() === filter.mandal.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      const qDigits = q.replace(/\D/g, '');
      result = result.filter(f => {
        const nameMatch = f.name.toLowerCase().includes(q);
        const districtMatch = f.district.toLowerCase().includes(q);
        const mandalMatch = f.mandal.toLowerCase().includes(q);
        const panchayatMatch = f.panchayatName.toLowerCase().includes(q);
        const cropMatch = f.primaryCrop.toLowerCase().includes(q);
        const phoneMatch = qDigits.length >= 3 && f.phone.replace(/\D/g, '').includes(qDigits);
        return nameMatch || districtMatch || mandalMatch || panchayatMatch || cropMatch || phoneMatch;
      });
    }

    return result;
  }

  getFarmersCountByPanchayat(panchayatId) {
    return this.farmers.filter(f => f.panchayatId === panchayatId).length;
  }

  getFarmerByPhone(phoneQuery) {
    if (!phoneQuery) return null;
    const cleanQuery = String(phoneQuery).replace(/\D/g, '');
    if (cleanQuery.length < 5) return null;

    // Last 10 digits comparison to match formats like "+91 98480 12345" vs "9848012345"
    const last10Query = cleanQuery.slice(-10);

    return this.farmers.find(f => {
      const farmerDigits = f.phone.replace(/\D/g, '');
      const farmerLast10 = farmerDigits.slice(-10);
      return farmerDigits === cleanQuery || farmerLast10 === last10Query || farmerDigits.includes(cleanQuery);
    }) || null;
  }

  addFarmer(farmerData) {
    const rawPhone = farmerData.phone || '';
    const cleanPhone = normalizePhoneNumber(rawPhone);
    const maskedPhone = maskPhoneNumber(rawPhone);

    const panchayatObj = resolvePanchayat(farmerData.panchayatId || farmerData.panchayat);
    const panchayatId = panchayatObj?.id || farmerData.panchayatId || 'ap-asr-maredumilli';
    const panchayatName = panchayatObj?.localName || panchayatObj?.name || farmerData.panchayatName || 'Maredumilli';
    const district = farmerData.district || panchayatObj?.district || 'Alluri Sitharama Raju';
    const mandal = farmerData.mandal || panchayatObj?.taluk || panchayatObj?.mandal || 'Maredumilli';

    const newId = this.farmers.length > 0 
      ? Math.max(...this.farmers.map(f => f.id)) + 1 
      : 1;

    const newFarmer = {
      id: newId,
      name: farmerData.name?.trim() || `Farmer ${newId}`,
      phone: rawPhone,
      cleanPhone,
      maskedPhone,
      district,
      mandal,
      panchayatId,
      panchayatName,
      primaryCrop: farmerData.primaryCrop || farmerData.crop || 'Paddy',
      landAcres: parseFloat(farmerData.landAcres || farmerData.acres || 2.5),
      language: farmerData.language || 'te',
      alertPreference: farmerData.alertPreference || 'Both',
      isActive: true,
      registeredAt: new Date().toISOString(),
      lastAlertAt: null,
      lastAlertType: null,
      lastAlertStatus: null
    };

    this.farmers.unshift(newFarmer);
    this._saveFarmers();

    console.log(`[DB] Registered new farmer: ${newFarmer.name} (${newFarmer.phone}) in ${newFarmer.panchayatName}`);
    return newFarmer;
  }

  updateFarmer(id, updateData) {
    const index = this.farmers.findIndex(f => f.id === id);
    if (index === -1) return null;

    this.farmers[index] = {
      ...this.farmers[index],
      ...updateData
    };
    this._saveFarmers();
    return this.farmers[index];
  }

  deleteFarmer(id) {
    this.farmers = this.farmers.filter(f => f.id !== id);
    this._saveFarmers();
    return true;
  }

  // ==========================================
  // PANCHAYATS DATABASE API
  // ==========================================

  getPanchayats(filter = {}) {
    const countsMap = new Map();
    for (let i = 0; i < this.farmers.length; i++) {
      const pid = this.farmers[i].panchayatId;
      countsMap.set(pid, (countsMap.get(pid) || 0) + 1);
    }

    let result = this.panchayats;

    if (filter.district) {
      const dist = filter.district.toLowerCase();
      result = result.filter(p => p.district.toLowerCase() === dist);
    }
    if (filter.mandal) {
      const mand = filter.mandal.toLowerCase();
      result = result.filter(p => p.mandal.toLowerCase() === mand);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.localName.toLowerCase().includes(q) || 
        p.district.toLowerCase().includes(q) || 
        p.mandal.toLowerCase().includes(q)
      );
    }

    return result.map(p => ({
      ...p,
      registeredFarmersCount: countsMap.get(p.id) || 0
    }));
  }

  getPanchayatById(id) {
    const p = this.panchayats.find(item => item.id === id) || resolvePanchayat(id);
    return {
      ...p,
      registeredFarmersCount: this.getFarmersCountByPanchayat(p.id)
    };
  }

  // ==========================================
  // ALERT DISPATCH & BROADCAST PIPELINE
  // ==========================================

  // Dispatches alert to a specific farmer by phone number (manual alert)
  dispatchManualAlertByPhone(phoneQuery, alertType = 'waterlogging', alertReason = 'Manual Operator Emergency Trigger') {
    const matched = this.getFarmerByPhone(phoneQuery);
    const now = new Date().toISOString();

    const cleanDigits = (phoneQuery || '').replace(/\D/g, '');
    const fullDigits = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    const hazardLabels = {
      waterlogging: 'కుండపోత వర్షం & నీరు నిలిచే ప్రమాదం (Flash Flood)',
      scorching_sun: 'తీవ్రమైన ఎండ & వడగాల్పులు (Heatwave)',
      wind_squall: 'ఈదురుగాలులు & తుఫాను (Squall / Wind)',
      thunderstorm: 'తీవ్ర పిడుగులు & ఉరుముల వర్షం (Thunderstorm)'
    };
    const hazardDesc = hazardLabels[alertType] || 'వాతావరణ ముప్పు';
    const smsText = `🚨 [ఆకాశ్ AI అత్యవసర హెచ్చరిక] ${matched ? matched.panchayatName : 'మీ ప్రాంతం'} పరిధిలో ${hazardDesc} గుర్తించబడింది. జాగ్రత్తలు పాటించండి. హెల్ప్‌లైన్: 1800-AAKASH`;
    const encodedSms = encodeURIComponent(smsText);
    const smsUrl = `sms:+${fullDigits}?body=${encodedSms}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${fullDigits}&text=${encodedSms}`;

    if (matched) {
      matched.lastAlertAt = now;
      matched.lastAlertType = alertType;
      matched.lastAlertStatus = 'DELIVERED';
      this._saveFarmers();

      return {
        success: true,
        isRegistered: true,
        farmer: matched,
        message: `Alert dispatched successfully to registered farmer ${matched.name} (${matched.phone}) in ${matched.panchayatName}.`,
        dispatchedAt: now,
        smsText,
        smsUrl,
        whatsappUrl
      };
    }

    // If not found in current database, create an instant verified farmer record for this phone number
    const newFarmer = this.addFarmer({
      name: `Farmer (${phoneQuery})`,
      phone: phoneQuery,
      district: 'Alluri Sitharama Raju',
      mandal: 'Maredumilli',
      panchayatId: 'ap-asr-maredumilli',
      panchayatName: 'Maredumilli',
      primaryCrop: 'Paddy',
      landAcres: 2.0,
      language: 'te',
      alertPreference: 'Both'
    });

    newFarmer.lastAlertAt = now;
    newFarmer.lastAlertType = alertType;
    newFarmer.lastAlertStatus = 'DELIVERED';
    this._saveFarmers();

    return {
      success: true,
      isRegistered: true,
      farmer: newFarmer,
      message: `Registered farmer with phone ${phoneQuery} and dispatched emergency alert.`,
      dispatchedAt: now,
      smsText,
      smsUrl,
      whatsappUrl
    };
  }

  // Dispatches alert to ALL registered farmers in a specific Gram Panchayat
  dispatchPanchayatRiskAlert(panchayatId, riskType = 'waterlogging', triggerReason = 'Autonomous Sensor Threshold Exceeded') {
    const targetPanchayat = this.getPanchayatById(panchayatId);
    const farmersInPanchayat = this.farmers.filter(f => f.panchayatId === panchayatId);
    const now = new Date().toISOString();

    // Mark every registered farmer in this panchayat as alerted
    farmersInPanchayat.forEach(f => {
      f.lastAlertAt = now;
      f.lastAlertType = riskType;
      f.lastAlertStatus = 'DELIVERED';
    });
    this._saveFarmers();

    // Update panchayat risk and last alert status
    const pIndex = this.panchayats.findIndex(p => p.id === panchayatId);
    if (pIndex !== -1) {
      this.panchayats[pIndex].riskLevel = 'CRITICAL';
      this.panchayats[pIndex].activeHazard = riskType;
      this.panchayats[pIndex].lastAlertDate = now.slice(0, 10);
      this._savePanchayats();
    }

    console.log(`[DB ALERT] Dispatched ${riskType} alert to ALL ${farmersInPanchayat.length} farmers in ${targetPanchayat.name}`);

    return {
      success: true,
      panchayat: targetPanchayat,
      targetedFarmersCount: farmersInPanchayat.length,
      farmers: farmersInPanchayat,
      dispatchedAt: now
    };
  }
}

export const databaseService = new DatabaseService();
