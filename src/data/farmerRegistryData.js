// Privacy-Preserving Demo Farmer Registry Data Service
// Strictly DEMO / SYNTHETIC data for prototype demonstration.
// NEVER uses Aadhaar, real phone numbers, or personally identifiable information (PII).

// Deterministic seed generator for stable numbers per Panchayat
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const MASKED_SURNAMES_TE = ["K.", "P.", "M.", "V.", "Ch.", "B.", "G.", "T.", "Y.", "N.", "D.", "S."];
const MASKED_NAMES_TE = ["R*** Rao", "S*** Reddy", "V*** Chowdary", "A*** Naidu", "L*** Prasad", "K*** Murthy", "B*** Raju", "N*** Varma", "M*** Krishna", "G*** Swamy"];

const MASKED_SURNAMES_EN = ["R.", "S.", "K.", "M.", "P.", "D.", "B.", "V."];
const MASKED_NAMES_EN = ["A*** Kumar", "R*** Singh", "S*** Sharma", "M*** Patel", "V*** Verma", "D*** Yadav", "J*** Reddy", "H*** Chowdary"];

const SAMPLE_CROPS = ["Paddy (వరి)", "Cotton (పత్తి)", "Chilli (మిరప)", "Groundnut (వేరుశనగ)", "Maize (మొక్కజొన్న)", "Pulses (పప్పుధాన్యాలు)"];

/**
 * Returns deterministic aggregate stats and sample masked records for a selected Panchayat
 */
export function getPanchayatFarmerRegistry(panchayatName, districtName = "Guntur", currentLang = "te") {
  const seed = hashString(String(panchayatName) + "-" + String(districtName));
  
  // Total registered demo farmers in this Panchayat: between 120 and 240
  const totalEligible = 120 + (seed % 121);
  
  // Channels distribution: Both (60-70%), Voice only (20-25%), SMS only (10-15%)
  const bothCount = Math.round(totalEligible * 0.65);
  const voiceOnlyCount = Math.round(totalEligible * 0.23);
  const smsOnlyCount = totalEligible - bothCount - voiceOnlyCount;

  // Language preference distribution
  const teluguPref = Math.round(totalEligible * 0.88);
  const hindiPref = Math.round(totalEligible * 0.04);
  const englishPref = totalEligible - teluguPref - hindiPref;

  // Generate 8 sample masked records for preview/inspection
  const sampleRecords = [];
  const phonePrefixes = ["98480", "94401", "99890", "91772", "83319", "70932", "96180", "89781"];
  
  for (let i = 0; i < 8; i++) {
    const itemSeed = (seed + i * 37) % 1000;
    const surname = currentLang === 'te' 
      ? MASKED_SURNAMES_TE[itemSeed % MASKED_SURNAMES_TE.length]
      : MASKED_SURNAMES_EN[itemSeed % MASKED_SURNAMES_EN.length];
    const fname = currentLang === 'te'
      ? MASKED_NAMES_TE[(itemSeed + 3) % MASKED_NAMES_TE.length]
      : MASKED_NAMES_EN[(itemSeed + 3) % MASKED_NAMES_EN.length];
    
    const prefix = phonePrefixes[i % phonePrefixes.length];
    const lastThree = String(100 + (itemSeed % 900));
    
    // Privacy Masking: +91 98*** **321
    const maskedMobile = "+91 " + prefix.slice(0, 2) + "*** **" + lastThree;
    const anonymousId = "FMR-AP-" + String(1000 + ((seed + i * 47) % 9000));

    const channel = i < 5 ? "Both (Voice + SMS)" : (i === 5 || i === 6 ? "Voice (IVR)" : "SMS Only");
    const crop = SAMPLE_CROPS[(seed + i) % SAMPLE_CROPS.length];
    const landSize = (1.5 + ((itemSeed % 40) / 10)).toFixed(1) + " acres";

    sampleRecords.push({
      id: anonymousId,
      maskedName: surname + " " + fname,
      maskedPhone: maskedMobile,
      district: districtName,
      panchayat: panchayatName,
      preferredLang: i === 6 ? "English" : (i === 7 ? "Hindi" : "Telugu"),
      alertPreference: channel,
      primaryCrop: crop,
      landHolding: landSize,
      dailyCapStatus: "Eligible (0/1 Batch)",
      lastCallStatus: "Pending Dispatch"
    });
  }

  return {
    panchayatName,
    districtName,
    totalEligible,
    channelDistribution: {
      both: bothCount,
      voiceOnly: voiceOnlyCount,
      smsOnly: smsOnlyCount
    },
    languageDistribution: {
      te: teluguPref,
      hi: hindiPref,
      en: englishPref
    },
    dailyPolicy: {
      cap: "1 Emergency Call Batch / Calendar Day",
      maxRetriesOnMiss: 3,
      retryIntervalMins: 10,
      activeToday: true
    },
    privacyGuarantee: "Strict Zero-PII Standard: No Aadhaar, No Real Phone Numbers, Masked Demo Identifiers Only.",
    sampleRecords
  };
}
