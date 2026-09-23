export const ALL_CROPS = [
  {
    id: "paddy",
    name: "Paddy (Rice)",
    localNames: {
      te: "వరి (Paddy)",
      hi: "धान (चावल)",
      ta: "நெல்",
      mr: "भात (धान)",
      kn: "ಭತ್ತ",
      pa: "ਝੋਨਾ",
      bn: "ধান"
    },
    season: "Kharif & Rabi",
    icon: "🌾",
    stages: ["Nursery / Transplanting", "Tillering & Vegetative", "Panicle Initiation & Flowering", "Milking & Grain Filling", "Maturity & Harvesting"],
    waterloggingSensitivity: "Moderate in nursery, High during harvesting",
    heatSensitivity: "High during flowering (causes spikelet sterility >35°C)",
    currentCropAdvisory: {
      waterloggingRisk: "If continuous rain exceeds 40mm, drain excess water to maintain standing depth under 5-7cm to prevent seedling rot and tillering suppression.",
      heavyRainRisk: "Suspend top-dressing of Urea and potash immediately. Heavy rains wash away applied nitrogen into field bunds.",
      scorchingSunRisk: "Maintain a thin film of water (3-5cm) in fields during hot afternoons to regulate soil-canopy microclimate and avoid spikelet desiccation.",
      sprayWindowNotice: "Avoid pesticide spray if rain probability exceeds 40% in next 24 hours. Ideal spray window opens when wind speed < 12 km/h.",
      diseaseWatch: "High humidity (>85%) and 26-30°C temperature triggers Blast (Pyricularia oryzae) and Bacterial Leaf Blight. Monitor leaf edges."
    },
    newCultivationAdvisory: {
      optimalSowingWindow: "Next 12-18 days during favorable soil moisture build-up.",
      soilSuitability: "Clay loam and black alluvial soil with high water retention.",
      varietiesRecommended: "MTU 1061 (Indra - flood tolerant), BPT 5204 (Samba Mahsuri), RNR 15048 (Telangana Sona - low GI), NLR 34449.",
      preparationSteps: "Puddle soil thoroughly. Apply 10 tonnes FYM/acre. Treat seeds with Carbendazim (2g/kg seed) or Pseudomonas fluorescens before soaking."
    }
  },
  {
    id: "cotton",
    name: "Cotton (Kapas)",
    localNames: {
      te: "ప్రత్తి (Cotton)",
      hi: "कपास (कपास)",
      ta: "பருத்தி",
      mr: "कापूस",
      kn: "ಹತ್ತಿ",
      pa: "ਨਰਮਾ/ਕਪਾਹ",
      bn: "তুলা"
    },
    season: "Kharif",
    icon: "☁️",
    stages: ["Seedling Emergence", "Squaring & Vegetative", "Flowering & Boll Formation", "Boll Bursting & Picking"],
    waterloggingSensitivity: "Extremely High (Root suffocation & wilting within 24-36 hrs)",
    heatSensitivity: "Moderate (Square & flower drop if day temp >38°C with dry winds)",
    currentCropAdvisory: {
      waterloggingRisk: "🚨 URGENT: Cotton cannot tolerate stagnant water. Open cross-furrows immediately to drain water away from root zone to prevent Para-wilt and root rot.",
      heavyRainRisk: "Rain during flowering washes away pollen, causing square shedding. Post-rain foliar spray of 1% 19:19:19 + Boron recommended once skies clear.",
      scorchingSunRisk: "High heat wave causes square desiccation. If dry spell extends beyond 7 days, provide light furrow irrigation.",
      sprayWindowNotice: "Pink bollworm and sucking pest (whitefly/aphid) spray should strictly be timed when leaves are dry and wind speed is below 10 km/h.",
      diseaseWatch: "Wet canopy + high temperature triggers Alternaria leaf spot and internal boll rot."
    },
    newCultivationAdvisory: {
      optimalSowingWindow: "Sow only after receipt of at least 65-75mm cumulative soaking rainfall and soil wet to 30cm depth.",
      soilSuitability: "Deep black cotton soils (regur) with good internal drainage.",
      varietiesRecommended: "Bt-II hybrids suitable for dryland; High Density Planting System (HDPS) compact varieties.",
      preparationSteps: "Deep summer plowing to destroy pupae. Ridge and furrow sowing recommended for rainwater harvesting and drainage safety."
    }
  },
  {
    id: "chilli",
    name: "Chilli (Mirchi)",
    localNames: {
      te: "మిరప (Chilli)",
      hi: "मिर्च (Chilli)",
      ta: "மிளகாய்",
      mr: "मिरची",
      kn: "ಮೆಣಸಿನಕಾಯಿ",
      pa: "ਮਿਰਚ",
      bn: "লঙ্কা"
    },
    season: "Kharif & Rabi",
    icon: "🌶️",
    stages: ["Nursery", "Transplanting & Establishment", "Vegetative & Branching", "Flowering & Fruit Set", "Fruit Ripening & Harvesting"],
    waterloggingSensitivity: "Extremely High (Damping-off & Phytophthora wilt)",
    heatSensitivity: "High (Blossom drop and sun scald on fruits)",
    currentCropAdvisory: {
      waterloggingRisk: "Drain water from beds without delay. Drench root zone with Copper Oxychloride (3g/litre) or Metalaxyl to prevent sudden wilting.",
      heavyRainRisk: "Continuous rain leads to severe Anthracnose (fruit rot / die-back). Spray Tebuconazole + Trifloxystrobin immediately after rain ceases.",
      scorchingSunRisk: "Sun scald damages green fruits. Maintain soil moisture with mulching or micro-sprinklers during dry hot afternoons.",
      sprayWindowNotice: "Target thrips (black thrips) and mites during calm early morning hours (6:30 AM - 9:30 AM).",
      diseaseWatch: "High humidity and evening dew favor Cercospora leaf spot and powdery mildew."
    },
    newCultivationAdvisory: {
      optimalSowingWindow: "Prepare raised nursery beds in August-September; transplant 35-day seedlings following the 1-week rain forecast.",
      soilSuitability: "Well-drained light loams and rich alluvial soils; avoid water-retentive heavy clay without raised beds.",
      varietiesRecommended: "Teja, Byadgi, LCA 334, Guntur Hope, hybrid tolerant varieties.",
      preparationSteps: "Construct 15cm raised beds. Solarize nursery with polythene mulch. Seed treatment with Trichoderma viride @ 4g/kg."
    }
  },
  {
    id: "maize",
    name: "Maize (Corn)",
    localNames: {
      te: "మొక్కజొన్న (Maize)",
      hi: "मक्का (भुट्टा)",
      ta: "மக்காச்சோளம்",
      mr: "मका",
      kn: "ಮೆಕ್ಕೆಜೋಳ",
      pa: "ਮੱਕੀ",
      bn: "ভুট্টা"
    },
    season: "Kharif, Rabi & Spring",
    icon: "🌽",
    stages: ["Knee-high Vegetative", "Tasseling & Silking", "Grain Filling", "Physiological Maturity"],
    waterloggingSensitivity: "High at knee-high and tasseling stages (causes yellowing and stunted cobs)",
    heatSensitivity: "High during tasseling (>36°C desensitizes pollen)",
    currentCropAdvisory: {
      waterloggingRisk: "Make drain channels every 6 rows. Waterlogging for more than 48 hours causes chlorosis and 30% yield penalty.",
      heavyRainRisk: "Fall Armyworm (FAW) whorl treatment should be postponed if heavy showers are expected within 4 hours.",
      scorchingSunRisk: "Tasseling period is critically sensitive to moisture deficit. Provide life-saving irrigation if rain fails.",
      sprayWindowNotice: "Apply Emamectin Benzoate directly into whorls on a clear morning.",
      diseaseWatch: "Maydis leaf blight and band/sheath rot under cloudy, warm weather."
    },
    newCultivationAdvisory: {
      optimalSowingWindow: "Rabi sowing from October 15 - November 15 after monsoon withdrawal.",
      soilSuitability: "Deep, well-drained loams rich in organic matter.",
      varietiesRecommended: "DHM 117, DKC 9108, Pioneer 3396, Kaveri 50.",
      preparationSteps: "Apply balanced NPK with Zinc Sulphate @ 10kg/acre. Ridge and furrow method ensures drought and waterlogging resistance."
    }
  },
  {
    id: "redgram",
    name: "Red Gram (Pigeon Pea / Kandi)",
    localNames: {
      te: "కంది (Red Gram)",
      hi: "अरहर / तुअर (दाल)",
      ta: "துவரை",
      mr: "तूर",
      kn: "ತೊಗರಿ",
      pa: "ਅਰਹਰ",
      bn: "অড়হর ডাল"
    },
    season: "Kharif long-duration",
    icon: "🌱",
    stages: ["Vegetative Growth", "Branching & Nipping", "Flowering", "Pod Development & Maturity"],
    waterloggingSensitivity: "Severe (Phytophthora stem blight in stagnant fields)",
    heatSensitivity: "Low-to-moderate; deep taproot provides drought resistance",
    currentCropAdvisory: {
      waterloggingRisk: "Open broad bed and furrows. If stagnant water occurs, drench with Metalaxyl @ 2g/L along affected rows.",
      heavyRainRisk: "Flower drop occurs during continuous overcast rain. Spray Planofix (NAA) @ 4ml/15L water on bright sunny days.",
      scorchingSunRisk: "Tolerates heat well, but terminal moisture stress reduces pod filling. One protective irrigation boosts yield by 25%.",
      sprayWindowNotice: "Helicoverpa pod borer monitoring with pheromone traps; spray neem oil or Chlorantraniliprole in safe spray window.",
      diseaseWatch: "Fusarium wilt and sterility mosaic disease."
    },
    newCultivationAdvisory: {
      optimalSowingWindow: "June-July for sole crop; early Rabi intercrop sowing in September-October.",
      soilSuitability: "Well-drained deep black and red loamy soils with pH 6.5 - 7.5.",
      varietiesRecommended: "PRG 176, Asha (ICPL 87119), Maruti, WRG 65.",
      preparationSteps: "Inoculate seeds with Rhizobium culture and Trichoderma to ensure strong root nodulation."
    }
  },
  {
    id: "groundnut",
    name: "Groundnut (Peanut)",
    localNames: {
      te: "వేరుశనగ (Groundnut)",
      hi: "मूंगफली",
      ta: "வேர்க்கடலை",
      mr: "भुईमूग",
      kn: "ಕಡಲೆಕಾಯಿ",
      pa: "ਮੂੰਗਫਲੀ",
      bn: "চিনাবাদাম"
    },
    season: "Kharif & Rabi-Summer",
    icon: "🥜",
    stages: ["Vegetative", "Flowering & Pegging", "Pod Development", "Harvesting"],
    waterloggingSensitivity: "High during pegging (pegs rot in wet mud)",
    heatSensitivity: "High during flowering (pollen desiccation)",
    currentCropAdvisory: {
      waterloggingRisk: "Pegging zone must be friable and aerated. Drain excess rain rapidly to avoid pod rot and aflatoxin buildup.",
      heavyRainRisk: "Avoid lifting/harvesting during wet weather as pods will detach in mud.",
      scorchingSunRisk: "In Rayalaseema & Deccan plains: Extreme heat and dry soil make peg entry impossible. Irrigate immediately at pegging stage.",
      sprayWindowNotice: "Tikka leaf spot and rust control: spray Mancozeb or Hexaconazole on calm sunny morning.",
      diseaseWatch: "Spodoptera litura caterpillar and collar rot."
    },
    newCultivationAdvisory: {
      optimalSowingWindow: "Rabi sowing: October 15 - November 15 with assured sprinkler irrigation.",
      soilSuitability: "Light textured sandy loams and red soils that allow easy peg penetration and pod development.",
      varietiesRecommended: "Kadiri 6, Kadiri 9, TAG 24, Dharani, GJG 31.",
      preparationSteps: "Add gypsum @ 200 kg/acre at pegging stage for calcium pod filling. Seed treatment with Imidacloprid."
    }
  },
  {
    id: "tomato",
    name: "Tomato",
    localNames: {
      te: "టమాటా (Tomato)",
      hi: "टमाटर",
      ta: "தக்காளி",
      mr: "टोमॅटो",
      kn: "ಟೊಮೇಟೊ",
      pa: "ਟਮਾਟਰ",
      bn: "টমেটো"
    },
    season: "All Year (Kharif, Rabi, Summer)",
    icon: "🍅",
    stages: ["Transplanting", "Vegetative & Staking", "Flowering & Fruit Initiation", "Fruit Sizing & Picking"],
    waterloggingSensitivity: "Very High (Bacterial wilt and fruit cracking)",
    heatSensitivity: "Very High (Pollen sterility >34°C causes blossom drop)",
    currentCropAdvisory: {
      waterloggingRisk: "Heavy waterlogging leads to severe bacterial wilt (Ralstonia). Ensure stakes keep fruit off wet soil.",
      heavyRainRisk: "Fruit cracking occurs after dry spells followed by sudden heavy downpours. Maintain uniform micro-irrigation.",
      scorchingSunRisk: "Sunscald turns fruit shoulders yellow/white. Maintain good foliar canopy or use shading nets.",
      sprayWindowNotice: "Early blight and late blight protection: Spray Mancozeb or Dimethomorph prior to forecast rainy spells.",
      diseaseWatch: "Tomato pinworm (Tuta absoluta) and leaf curl virus transmitted by whiteflies."
    },
    newCultivationAdvisory: {
      optimalSowingWindow: "Sow in seedling trays in shade net; transplant after 25 days on raised mulch beds.",
      soilSuitability: "Well-drained sandy loam rich in organic matter with pH 6.0 - 7.0.",
      varietiesRecommended: "Arka Rakshak, Arka Abhed (triple disease resistant), US 440, Saaho.",
      preparationSteps: "Apply silver-black plastic mulch with drip lines for soil moisture stability and weed control."
    }
  },
  {
    id: "wheat",
    name: "Wheat (Gehun)",
    localNames: {
      te: "గోధుమ (Wheat)",
      hi: "गेहूं",
      ta: "கோதுமை",
      mr: "गहू",
      kn: "ಗೋಧಿ",
      pa: "ਕਣਕ",
      bn: "গম"
    },
    season: "Rabi",
    icon: "🌾",
    stages: ["Crown Root Initiation (CRI)", "Tillering", "Jointing & Booting", "Flowering & Anthesis", "Dough & Maturity"],
    waterloggingSensitivity: "High at seedling and CRI stage (causes yellowing)",
    heatSensitivity: "Extreme during grain filling ('Terminal Heat Stress')",
    currentCropAdvisory: {
      waterloggingRisk: "Avoid excess irrigation; field must drain within 12 hours.",
      heavyRainRisk: "Untimely rain accompanied by strong winds at boot/milking stage causes crop lodging (falling flat).",
      scorchingSunRisk: "Terminal heat wave in February-March shrinks grains. Foliar spray of 0.2% Potassium Nitrate helps mitigate heat stress.",
      sprayWindowNotice: "Spray for yellow rust (Puccinia striiformis) on clear mornings if temperature is 10-20°C with high dew.",
      diseaseWatch: "Loose smut, Karnal bunt, and pink stem borer."
    },
    newCultivationAdvisory: {
      optimalSowingWindow: "November 1 - November 20 (Timely sown) for maximum yield potential.",
      soilSuitability: "Well-drained fertile clay loams and alluvium.",
      varietiesRecommended: "HD 2967, HD 3086, DBW 187 (Karan Vandana), DBW 222.",
      preparationSteps: "Zero-tillage / Happy Seeder sowing into paddy stubble retains soil moisture and cuts sowing costs by ₹2500/acre."
    }
  },
  {
    id: "soybean",
    name: "Soybean",
    localNames: {
      te: "సోయాబీన్ (Soybean)",
      hi: "सोयाबीन",
      ta: "சோயாபீன்",
      mr: "सोयाबीन",
      kn: "ಸೋಯಾಬೀನ್",
      pa: "ਸੋਇਆਬੀਨ",
      bn: "সয়াবিন"
    },
    season: "Kharif",
    icon: "🌱",
    stages: ["Emergence", "Vegetative V1-V4", "Flowering R1-R2", "Pod Formation R3-R4", "Pod Filling R5-R6"],
    waterloggingSensitivity: "High during emergence and pod formation",
    heatSensitivity: "Moderate",
    currentCropAdvisory: {
      waterloggingRisk: "Surface drainage is critical. Water stagnation for 48 hours cuts yield by 40% due to nodule oxygen starvation.",
      heavyRainRisk: "Heavy downpours during maturity cause pod shattering and seed germination in pod.",
      scorchingSunRisk: "Dry spell at pod filling stage causes pod dropping. Run sprinkler irrigation during 7-day rain breaks.",
      sprayWindowNotice: "Girdle beetle and semilooper caterpillar spray: Chlorantraniliprole 18.5 SC during safe morning wind conditions.",
      diseaseWatch: "Yellow Mosaic Virus (YMV) and charcoal rot under alternate wet-dry cycles."
    },
    newCultivationAdvisory: {
      optimalSowingWindow: "Sow within 5 days of receiving 75mm monsoon rain when soil temperature is 20-30°C.",
      soilSuitability: "Well-drained black clay soils (Vertisols) with good organic carbon.",
      varietiesRecommended: "JS 335, JS 20-34, JS 20-98, NRC 127.",
      preparationSteps: "Broad bed furrow (BBF) or Ridge & Furrow planter prevents both waterlogging in wet spells and moisture stress in dry spells."
    }
  },
  {
    id: "sugarcane",
    name: "Sugarcane (Cheraku)",
    localNames: {
      te: "చెరకు (Sugarcane)",
      hi: "गन्ना",
      ta: "கரும்பு",
      mr: "ऊस",
      kn: "ಕಬ್ಬು",
      pa: "ਗੰਨਾ",
      bn: "আখ"
    },
    season: "Annual (Adsali, Autumn, Spring)",
    icon: "🎋",
    stages: ["Germination & Tillering", "Grand Growth", "Elongation", "Ripening & Harvesting"],
    waterloggingSensitivity: "Tolerant when mature, but sensitive at early tillering stage",
    heatSensitivity: "Moderate (Requires high sunlight for sucrose synthesis)",
    currentCropAdvisory: {
      waterloggingRisk: "Tie cane clumps (trash twist) before heavy monsoon rains and high winds to prevent cane lodging.",
      heavyRainRisk: "Ensure main drains are cleared to prevent red rot fungal pathogen entry via stagnant root standing.",
      scorchingSunRisk: "Trash mulching (10cm layer between cane rows) saves 40% irrigation water and prevents soil moisture baking.",
      sprayWindowNotice: "Early shoot borer and pyrilla control; spray during calm wind hours.",
      diseaseWatch: "Red rot, smut, and Pokkah Boeng disease during high humidity."
    },
    newCultivationAdvisory: {
      optimalSowingWindow: "Autumn planting: October - November; Spring planting: February - March.",
      soilSuitability: "Deep, well-drained loams and clay loams with neutral pH.",
      varietiesRecommended: "Co 86032 (Nayana), Co 0238, CoV 09356, 2003V46.",
      preparationSteps: "Single-bud settling or STP method saves seed setts and water; apply Trichoderma enriched press mud."
    }
  }
];

export const TELUGU_CROP_ADVISORIES = {
  paddy: {
    sensitivity: "నారుమడిలో మధ్యస్థం, కోత దశలో అధిక ప్రమాదం",
    current: {
      waterloggingRisk: "ఎడతెరిపి లేకుండా 40 మి.మీ కంటే ఎక్కువ వర్షం పడితే, నారుమడి కుళ్లకుండా మరియు పిలకలు దెబ్బతినకుండా నీటి మట్టం 5-7 సెం.మీ కంటే మించకుండా వెంటనే మురుగు నీటిని బయటకు వదలండి.",
      heavyRainRisk: "యూరియా మరియు పొటాష్ పైపాటు ఎరువులు వేయడం వెంటనే ఆపండి. భారీ వర్షాలకు ఎరువులు కొట్టుకుపోయి వృథా అవుతాయి.",
      scorchingSunRisk: "తీవ్రమైన ఎండల్లో ఆకులు ఎండిపోకుండా మరియు వెన్ను మాడిపోకుండా ఉండేందుకు పొలంలో 3-5 సెం.మీ పలుచని నీటి పొర నిల్వ ఉండేలా చూసుకోండి.",
      sprayWindowNotice: "రాగల 24 గంటల్లో వర్ష సూచన 40% మించితే మందుల పిచికారీ చేయవద్దు. గాలి వేగం 12 కి.మీ లోపు ఉన్నప్పుడు మాత్రమే పిచికారీ చేయాలి.",
      diseaseWatch: "గాలిలో తేమ 85% దాటి, 26-30°C ఉష్ణోగ్రత ఉన్నప్పుడు అగ్గితెగులు మరియు బాక్టీరియా ఆకు ఎండు తెగులు వచ్చే ప్రమాదం ఉంది. ఆకుల చివర్లను గమనించండి."
    },
    newCultivation: {
      optimalSowingWindow: "నేలలో అనుకూల తేమ లభించే రాబోయే 12-18 రోజుల్లో విత్తుకోవడానికి అనుకూలం.",
      soilSuitability: "నీటిని నిలుపుకునే బంకమట్టి, ఒండ్రు మరియు నల్లరేగడి నేలలు.",
      varietiesRecommended: "ఎంటీయూ 1061 (ఇంద్ర - ముంపును తట్టుకుంటుంది), బిపిటి 5204 (సాంబ మసూరి), ఆర్ఎన్ఆర్ 15048 (తెలంగాణ సోనా), ఎన్ఎల్ఆర్ 34449.",
      preparationSteps: "దమ్ము బాగా చేయాలి. ఎకరాకు 10 టన్నుల పశువుల ఎరువు వేయాలి. కార్బండిజం (2 గ్రా/కిలో) లేదా సూడోమోనాస్ తో విత్తన శుద్ధి చేయాలి."
    }
  },
  cotton: {
    sensitivity: "అత్యధిక సున్నితం (24-36 గంటల్లో వేర్లు కుళ్లి మొక్కలు వాడిపోతాయి)",
    current: {
      waterloggingRisk: "🚨 అత్యవసరం: పత్తి చేనులో నీరు నిలిస్తే తట్టుకోలేదు. వేరుకుళ్లు మరియు పారా-విల్ట్ రాకుండా ఉండేందుకు వెంటనే అడ్డకాలువలు తీసి నీటిని బయటకు పంపండి.",
      heavyRainRisk: "పూత సమయంలో వర్షం పడితే పుప్పొడి కొట్టుకుపోయి పూత రాలిపోతుంది. వర్షం తగ్గిన తర్వాత 1% 19:19:19 + బోరాన్ పిచికారీ చేయండి.",
      scorchingSunRisk: "తీవ్రమైన ఎండ మరియు పొడి గాలుల వల్ల కాయ తొడుగులు రాలిపోతాయి. 7 రోజులకు పైగా వర్షాభావం ఉంటే సాలులలో తేలికపాటి తడి ఇవ్వండి.",
      sprayWindowNotice: "గులాబీ రంగు బొబ్బ పురుగు మరియు రసం పీల్చే పురుగుల మందులను ఆకులు పొడిగా ఉన్నప్పుడు, గాలి వేగం 10 కి.మీ లోపు ఉన్నప్పుడు మాత్రమే పిచికారీ చేయండి.",
      diseaseWatch: "తేమ అధికంగా ఉండి ఉష్ణోగ్రత పెరిగితే ఆల్టర్నేరియా ఆకుమచ్చ మరియు కాయ కుళ్లు తెగులు ఆశిస్తుంది."
    },
    newCultivation: {
      optimalSowingWindow: "కనీసం 65-75 మి.మీ వర్షం కురిసి, నేల 30 సెం.మీ లోతు వరకు తడిసిన తర్వాత మాత్రమే విత్తనాలు వేయండి.",
      soilSuitability: "మంచి మురుగు నీటి వసతి కలిగిన లోతైన నల్లరేగడి నేలలు.",
      varietiesRecommended: "వర్షాధారానికి అనువైన బిటి-2 హైబ్రిడ్లు, అధిక సాంద్రత సాగు (HDPS) వంగడాలు.",
      preparationSteps: "వేసవిలో లోతు దుక్కులు చేయండి. నీటి సంరక్షణ మరియు మురుగు పారుదలకు బోదెలు-కాలువల పద్ధతి పాటించండి."
    }
  },
  chilli: {
    sensitivity: "అత్యధికం (నీరు నిలిస్తే కొమ్మ ఎండు & అకస్మాత్తుగా వాడిపోవుట)",
    current: {
      waterloggingRisk: "మడుల్లో నీరు నిలవకుండా వెంటనే బయటకు పంపండి. అకస్మాత్తుగా మొక్కలు వాడిపోకుండా కాపర్ ఆక్సిక్లోరైడ్ (3 గ్రా/లీ) తో వేరు భాగాన్ని తడపండి.",
      heavyRainRisk: "ఎడతెరిపిలేని వర్షాల వల్ల కొమ్మ ఎండు మరియు కాయకుళ్లు తెగులు వస్తుంది. వర్షం ఆగిన వెంటనే టెబుకొనజోల్ + ట్రైఫ్లాక్సిస్ట్రోబిన్ పిచికారీ చేయండి.",
      scorchingSunRisk: "తీవ్రమైన ఎండ వల్ల కాయలపై తెల్లటి మచ్చలు (సన్ స్కాల్డ్) వస్తాయి. మల్చింగ్ లేదా మైక్రో స్ప్రింక్లర్లతో నేలలో తేమ కాపాడండి.",
      sprayWindowNotice: "నల్ల తామర పురుగులు (బ్లాక్ త్రిప్స్) మరియు నల్లి నివారణకు ఉదయం 6:30 నుండి 9:30 గంటల మధ్య అనుకూల సమయం.",
      diseaseWatch: "గాలిలో తేమ మరియు మంచు వల్ల సర్కోస్పోరా ఆకుమచ్చ మరియు బూడిద తెగులు వ్యాపిస్తాయి."
    },
    newCultivation: {
      optimalSowingWindow: "ఆగస్టు-సెప్టెంబర్ లో ఎత్తైన మడులపై నారు పెంచి, 35 రోజుల నారును వర్ష సూచన చూసి నాటుకోవాలి.",
      soilSuitability: "మంచి మురుగు నీటి పారుదల గల ఇసుక నేలలు మరియు ఎర్ర నేలలు అనుకూలం.",
      varietiesRecommended: "తేజ, బ్యాడగి, ఎల్ సి ఏ 334, గుంటూరు హోప్, వైరస్ తట్టుకునే హైబ్రిడ్లు.",
      preparationSteps: "15 సెం.మీ ఎత్తైన నారుమడులు వేయాలి. ట్రైకోడెర్మా విరిడె (4 గ్రా/కిలో) తో విత్తన శుద్ధి చేయాలి."
    }
  },
  maize: {
    sensitivity: "మోకాలు లోతు మరియు కంకి దశల్లో అధిక ప్రమాదం",
    current: {
      waterloggingRisk: "ప్రతి 6 సాలులకు ఒక మురుగు కాలువ తీయండి. 48 గంటలకు మించి నీరు నిలిస్తే ఆకులు పసుపు రంగులోకి మారి 30% దిగుబడి తగ్గుతుంది.",
      heavyRainRisk: "రాగల 4 గంటల్లో భారీ వర్షం పడే అవకాశం ఉంటే కత్తెర పురుగు మందు సుడులలో వేయడం వాయిదా వేయండి.",
      scorchingSunRisk: "కంకి పాలు పోసుకునే దశలో తేమ కొరత రాకూడదు. వర్షం లేకపోతే ప్రాణరక్షక తడి తప్పనిసరిగా ఇవ్వండి.",
      sprayWindowNotice: "వాతావరణం నిర్మలంగా ఉన్న ఉదయం వేళల్లో ఎమామెక్టిన్ బెంజోయేట్ సుడులలో పడేలా పిచికారీ చేయండి.",
      diseaseWatch: "మబ్బులతో కూడిన వెచ్చని వాతావరణంలో మైడిస్ ఆకు ఎండు మరియు కాండం కుళ్లు తెగులు వస్తుంది."
    },
    newCultivation: {
      optimalSowingWindow: "వర్షాకాలం ముగిసిన తర్వాత అక్టోబర్ 15 నుండి నవంబర్ 15 వరకు రబీ విత్తుకోవడానికి అనుకూలం.",
      soilSuitability: "సేంద్రియ పదార్థం సమృద్ధిగా ఉన్న లోతైన సారవంతమైన నేలలు.",
      varietiesRecommended: "డిహెచ్ఎం 117, డికెసి 9108, పయనీర్ 3396, కావేరి 50.",
      preparationSteps: "ఎకరాకు 10 కిలోల జింక్ సల్ఫేట్ వేయాలి. బోదెలు-సాలుల పద్ధతిలో విత్తుకోవాలి."
    }
  },
  redgram: {
    sensitivity: "తీవ్ర ప్రమాదం (నీరు నిలిస్తే కాండం కుళ్లు తెగులు)",
    current: {
      waterloggingRisk: "వెడల్పాటి బోదెలు-కాలువలు తెరవండి. నీరు నిలిస్తే ఫైటోఫ్తోరా కాండం కుళ్లు రాకుండా మెటలాక్సిల్ (2 గ్రా/లీ) ద్రావణాన్ని పిచికారీ చేయండి.",
      heavyRainRisk: "ఎడతెరిపిలేని మబ్బులు, వర్షాల వల్ల పూత రాలిపోతుంది. ఎండ వచ్చినప్పుడు ప్లానోఫిక్స్ (4 మి.లీ/15 లీటర్ల నీటికి) పిచికారీ చేయండి.",
      scorchingSunRisk: "ఎండను తట్టుకుంటుంది కానీ కాయ నిండే దశలో తేమ కొరత ఉంటే దిగుబడి తగ్గుతుంది. ఒక రక్షక తడి ఇస్తే 25% దిగుబడి పెరుగుతుంది.",
      sprayWindowNotice: "శెనగ పచ్చ పురుగు నివారణకు లింగాకర్షక బుట్టలు అమర్చండి. అనుకూల సమయంలో క్లోరాంట్రానిలిప్రోల్ పిచికారీ చేయండి.",
      diseaseWatch: "ఎండు తెగులు (ఫ్యుసేరియం విల్ట్) మరియు వంధ్యత్వ మొజాయిక్ తెగులు."
    },
    newCultivation: {
      optimalSowingWindow: "ప్రధాన పంటగా జూన్-జూలై; రబీ అంతర పంటగా సెప్టెంబర్-అక్టోబర్.",
      soilSuitability: "మంచి మురుగు నీటి వసతి కలిగిన లోతైన నల్లరేగడి మరియు ఎర్ర నేలలు.",
      varietiesRecommended: "పిఆర్జి 176, ఆశా (ఐసిపిఎల్ 87119), మారుతి, డబ్ల్యుఆర్జి 65.",
      preparationSteps: "రైజోబియం మరియు ట్రైకోడెర్మా కల్చర్ తో విత్తన శుద్ధి తప్పనిసరిగా చేయండి."
    }
  },
  groundnut: {
    sensitivity: "ఊడలు దిగే దశలో అధిక ప్రమాదం (తేమ ఎక్కువైతే ఊడలు కుళ్లుతాయి)",
    current: {
      waterloggingRisk: "ఊడలు దిగే ప్రాంతంలో మట్టి గుల్లగా ఉండాలి. కాయ కుళ్లు మరియు అఫ్లాటాక్సిన్ రాకుండా అదనపు నీటిని వెంటనే బయటకు పంపండి.",
      heavyRainRisk: "నేల తడిగా ఉన్నప్పుడు పంటను పీకవద్దు, కాయలు మట్టిలోనే తెగిపోతాయి.",
      scorchingSunRisk: "రాయలసీమ ప్రాంతంలో తీవ్రమైన ఎండ వల్ల నేల గట్టిపడి ఊడలు నేలలోకి దిగవు. ఊడలు దిగే దశలో వెంటనే నీటి తడి ఇవ్వండి.",
      sprayWindowNotice: "తిక్కా ఆకుమచ్చ మరియు తుప్పు తెగులు నివారణకు మాంకోజెబ్ లేదా హెక్సాకొనజోల్ ఉదయం వేళల్లో పిచికారీ చేయండి.",
      diseaseWatch: "స్పోడోప్టెరా లద్దెపురుగు మరియు మొదలు కుళ్లు తెగులు."
    },
    newCultivation: {
      optimalSowingWindow: "స్ప్రింక్లర్ సౌకర్యం ఉంటే అక్టోబర్ 15 నుండి నవంబర్ 15 వరకు రబీ విత్తడానికి అనుకూలం.",
      soilSuitability: "తేలికపాటి ఇసుకతో కూడిన ఎర్ర నేలలు, ఊడలు సులభంగా దిగే నేలలు.",
      varietiesRecommended: "కదిరి 6, కదిరి 9, టిఎజి 24, ధరణి, జిజెజి 31.",
      preparationSteps: "ఊడలు దిగే దశలో ఎకరాకు 200 కిలోల జిప్సం వేయాలి. ఇమిడాక్లోప్రిడ్ తో విత్తన శుద్ధి చేయాలి."
    }
  },
  tomato: {
    sensitivity: "చాలా అధికం (బాక్టీరియల్ ఎండు తెగులు & కాయలు పగులుట)",
    current: {
      waterloggingRisk: "ఎక్కువ నీరు నిలిస్తే బాక్టీరియల్ విల్ట్ (బాక్టీరియా ఎండు తెగులు) వస్తుంది. కాయలు తడి నేలకు తగలకుండా ఊతాలు కట్టండి.",
      heavyRainRisk: "ఎండల తర్వాత అకస్మాత్తుగా భారీ వర్షం పడితే కాయలు పగిలిపోతాయి. మైక్రో ఇరిగేషన్ ద్వారా క్రమం తప్పకుండా తేమ అందించండి.",
      scorchingSunRisk: "తీవ్రమైన ఎండ వల్ల కాయలు మాడిపోతాయి. చేనుపై ఆకుల కప్పు ఉండేలా చూసుకోండి లేదా నీడ వలలు వాడండి.",
      sprayWindowNotice: "ముందస్తు మరియు ఆలస్యపు ఆకుమచ్చ తెగులు రాకుండా వర్షపు కాలానికి ముందే మాంకోజెబ్ పిచికారీ చేయండి.",
      diseaseWatch: "టమాటా పెంకు పురుగు (టూటా అబ్సొల్యూటా) మరియు తెల్లదోమ వల్ల వచ్చే ఆకుముడత వైరస్."
    },
    newCultivation: {
      optimalSowingWindow: "షేడ్ నెట్ లో ప్రోట్రేలలో నారు పోసి, 25 రోజుల నారును మల్చింగ్ బెడ్లపై నాటుకోవాలి.",
      soilSuitability: "సేంద్రియ ఎరువులు పుష్కలంగా ఉన్న తేలికపాటి ఇసుక ఒండ్రు నేలలు.",
      varietiesRecommended: "అర్కా రక్షక్, అర్కా అభేద్ (మూడు తెగుళ్లను తట్టుకుంటుంది), యుఎస్ 440, సాహో.",
      preparationSteps: "తేమ కాపాడటానికి మరియు కలుపు నివారణకు సిల్వర్-బ్లాక్ ప్లాస్టిక్ మల్చింగ్ వేయండి."
    }
  },
  wheat: {
    sensitivity: "మొలక మరియు వేర్లు వేసే దశలో అధిక సున్నితం",
    current: {
      waterloggingRisk: "అదనపు నీటిని నిలవనీయవద్దు; 12 గంటల్లోపు మురుగు నీటిని తీసివేయాలి.",
      heavyRainRisk: "ఈనె వేసే దశలో ఈదురు గాలులతో కూడిన వర్షం పడితే పైరు పడిపోతుంది (లాడ్జింగ్).",
      scorchingSunRisk: "ఫిబ్రవరి-మార్చి లో వచ్చే వేడి గాలుల వల్ల గింజ సరిగ్గా నిండదు. 0.2% పొటాషియం నైట్రేట్ పిచికారీ చేయడం వల్ల వేడి ఒత్తిడి తగ్గుతుంది.",
      sprayWindowNotice: "పసుపు తుప్పు తెగులు నివారణకు ఉదయం వేళల్లో ప్రొపికొనజోల్ పిచికారీ చేయండి.",
      diseaseWatch: "లక్షణాలు కనిపించగానే తుప్పు తెగులు నివారణ చర్యలు చేపట్టండి."
    },
    newCultivation: {
      optimalSowingWindow: "గరిష్ట దిగుబడికి నవంబర్ 1 నుండి నవంబర్ 20 లోపు సకాలంలో విత్తుకోవాలి.",
      soilSuitability: "మంచి మురుగు నీటి వసతి కలిగిన సారవంతమైన నల్లరేగడి మరియు ఒండ్రు నేలలు.",
      varietiesRecommended: "హెచ్ డి 2967, హెచ్ డి 3086, డిబిడబ్ల్యు 187, డిబిడబ్ల్యు 222.",
      preparationSteps: "జీరో-టిల్లేజ్ / హ్యాపీ సీడర్ పద్ధతిలో విత్తితే నేలలో తేమ నిలిచి ఎకరాకు ₹2500 ఆదా అవుతుంది."
    }
  },
  soybean: {
    sensitivity: "మొలక మరియు కాయ తయారీ దశల్లో అధిక సున్నితం",
    current: {
      waterloggingRisk: "మురుగు నీటి పారుదల చాలా ముఖ్యం. 48 గంటలు నీరు నిలిస్తే వేరుబుడిపెలలో ఆక్సిజన్ అందక 40% దిగుబడి తగ్గుతుంది.",
      heavyRainRisk: "పంట కోత దశలో భారీ వర్షాలు పడితే కాయల్లోనే గింజ మొలకెత్తుతుంది.",
      scorchingSunRisk: "కాయ నిండే దశలో వర్షాభావం ఏర్పడితే కాయలు రాలిపోతాయి. 7 రోజులు వర్షం లేకపోతే స్ప్రింక్లర్ తో తడి ఇవ్వండి.",
      sprayWindowNotice: "గిర్డిల్ బీటిల్ మరియు లద్దెపురుగు నివారణకు గాలి తక్కువగా ఉన్న ఉదయం క్లోరాంట్రానిలిప్రోల్ పిచికారీ చేయండి.",
      diseaseWatch: "పసుపు మొజాయిక్ వైరస్ మరియు బొగ్గు కుళ్లు తెగులు."
    },
    newCultivation: {
      optimalSowingWindow: "75 మి.మీ వర్షపాతం నమోదైన 5 రోజుల్లోపు విత్తుకోవాలి.",
      soilSuitability: "సేంద్రియ కర్బనం పుష్కలంగా ఉన్న నల్లరేగడి నేలలు.",
      varietiesRecommended: "జెఎస్ 335, జెఎస్ 20-34, జెఎస్ 20-98, ఎన్ఆర్సి 127.",
      preparationSteps: "వెడల్పు బోదెలు-కాలువల (BBF) పద్ధతి వర్షాభావం మరియు ముంపు రెండింటినీ తట్టుకుంటుంది."
    }
  },
  sugarcane: {
    sensitivity: "ముదిరిన తర్వాత తట్టుకుంటుంది కానీ ప్రారంభంలో సున్నితం",
    current: {
      waterloggingRisk: "వర్షాకాలం మరియు ఈదురుగాలులకు ముందు చెరకు గడలు పడిపోకుండా జడలు అల్లడం (ట్రాష్ ట్విస్ట్) చేయండి.",
      heavyRainRisk: "ఎర్ర కుళ్లు తెగులు వేర్ల ద్వారా వ్యాపించకుండా ప్రధాన మురుగు కాలువలు శుభ్రం చేయండి.",
      scorchingSunRisk: "సాలుల మధ్య చెరకు పిప్పి/ఆకులతో 10 సెం.మీ మల్చింగ్ వేస్తే 40% నీరు ఆదా అవుతుంది మరియు నేల వేడెక్కదు.",
      sprayWindowNotice: "మొవ్వు తొలిచే పురుగు నివారణకు గాలి తక్కువగా ఉన్న సమయాల్లో పిచికారీ చేయండి.",
      diseaseWatch: "ఎర్ర కుళ్లు, కాటుక తెగులు మరియు పొక్కా బోయింగ్ తెగులు."
    },
    newCultivation: {
      optimalSowingWindow: "శరదృతువు నాట్లు: అక్టోబర్ - నవంబర్; వసంతకాల నాట్లు: ఫిబ్రవరి - మార్చి.",
      soilSuitability: "సారవంతమైన, మంచి మురుగు నీటి వసతి కలిగిన లోతైన ఒండ్రు నేలలు.",
      varietiesRecommended: "కో 86032 (నయన), కో 0238, కోవి 09356, 2003వి46.",
      preparationSteps: "సింగిల్ బడ్ లేదా ఎస్ టి పి పద్ధతి ద్వారా విత్తనం మరియు నీరు ఆదా అవుతాయి."
    }
  }
};

export const HINDI_CROP_ADVISORIES = {
  paddy: {
    sensitivity: "नर्सरी में मध्यम, कटाई अवस्था में अत्यधिक संवेदनशील",
    current: {
      waterloggingRisk: "यदि लगातार बारिश 40 मिमी से अधिक हो, तो पौध सड़न रोकने के लिए खेत में जलभराव 5-7 सेमी से कम रखें।",
      heavyRainRisk: "यूरिया और पोटाश का छिड़काव तुरंत रोकें। भारी बारिश से उर्वरक बह जाता है।",
      scorchingSunRisk: "तेज धूप और लू से बचाने के लिए दोपहर में खेत में 3-5 सेमी पानी की पतली परत बनाए रखें।",
      sprayWindowNotice: "यदि अगले 24 घंटों में बारिश की संभावना 40% से अधिक हो तो कीटनाशक छिड़काव न करें। हवा की गति 12 किमी/घंटा से कम होने पर छिड़काव करें।",
      diseaseWatch: "उच्च आर्द्रता (>85%) और 26-30°C तापमान ब्लास्ट और जीवाणु पत्ती झुलसा रोग को बढ़ावा देता है।"
    },
    newCultivation: {
      optimalSowingWindow: "मिट्टी में पर्याप्त नमी मिलने पर अगले 12-18 दिन में बुवाई करें।",
      soilSuitability: "चिकनी दोमट और काली जलोढ़ मिट्टी जिसमें जल धारण क्षमता अधिक हो।",
      varietiesRecommended: "एमटीयू 1061 (इंद्रा - बाढ़ सहनशील), बीपीटी 5204 (सांभा महसूरी), आरएनआर 15048 (तेलंगाना सोना)।",
      preparationSteps: "खेत को अच्छी तरह पडलिंग करें। 10 टन गोबर की खाद प्रति एकड़ डालें और बीज शोधन करें।"
    }
  },
  cotton: {
    sensitivity: "अत्यधिक संवेदनशील (24-36 घंटों में जड़ें घुटकर सूखने लगती हैं)",
    current: {
      waterloggingRisk: "चेतावनी: कपास की फसल पानी का ठहराव बिल्कुल बर्दाश्त नहीं कर सकती। तुरंत नालियां बनाकर पानी निकालें।",
      heavyRainRisk: "फूल आने के समय बारिश से परागकण धुल जाते हैं और कलियां गिर जाती हैं। मौसम साफ होने पर 1% 19:19:19 का छिड़काव करें।",
      scorchingSunRisk: "लू और तेज धूप से कलियां सूखती हैं। यदि सूखा 7 दिन से अधिक रहे तो हल्की सिंचाई करें।",
      sprayWindowNotice: "गुलाबी सुंडी और रस चूसक कीटों के लिए छिड़काव तभी करें जब पत्तियां सूखी हों और हवा शांत हो।",
      diseaseWatch: "नमी और अधिक तापमान से अल्टरनेरिया पत्ती धब्बा और आंतरिक टिंडा सड़न रोग फैलता है।"
    },
    newCultivation: {
      optimalSowingWindow: "खेत में कम से कम 65-75 मिमी वर्षा और 30 सेमी गहराई तक नमी होने पर ही बुवाई करें।",
      soilSuitability: "गहरी काली कपासी मिट्टी (रेगुर) जिसमें उत्तम जल निकासी हो।",
      varietiesRecommended: "बीटी-II संकर किस्में और उच्च घनत्व रोपण प्रणाली (HDPS) उपयुक्त किस्में।",
      preparationSteps: "कीटों के प्यूपा नष्ट करने के लिए गहरी गर्मी की जुताई करें। मेड़ और नाली विधि से बुवाई करें।"
    }
  },
  chilli: {
    sensitivity: "अत्यंत संवेदनशील (जड़ सड़न और उकठा रोग)",
    current: {
      waterloggingRisk: "खेत में पानी भरने से 24 घंटे में पौधे पीले होकर मुरझाने लगते हैं। मुख्य निकास नालियों को तुरंत साफ करें।",
      heavyRainRisk: "फूल खिलने के समय तेज बारिश से फूल और छोटे फल झड़ जाते हैं। कॉपर ऑक्सीक्लोराइड 3 ग्राम/लीटर का छिड़काव करें।",
      scorchingSunRisk: "तेज धूप से मिर्च के फलों पर सन-स्कैल्ड (धूप के धब्बे) हो जाते हैं। दोपहर में सिंचाई से बचें।",
      sprayWindowNotice: "थ्रिप्स और माइट्स के नियंत्रण के लिए सुबह या शाम को शांत मौसम में छिड़काव करें।",
      diseaseWatch: "लगातार बादल और 80% से अधिक आर्द्रता से एंथ्रेक्नोज (फल सड़न) और पाउडरी मिल्ड्यू फैलता है।"
    },
    newCultivation: {
      optimalSowingWindow: "खरीफ रोपाई: जुलाई-अगस्त; रबी रोपाई: अक्टूबर-नवंबर।",
      soilSuitability: "अच्छी जल निकासी वाली रेतीली दोमट या मध्यम काली मिट्टी।",
      varietiesRecommended: "तेजा 4, आर्मूर, ब्याडगी, जी4, यूएस 341।",
      preparationSteps: "ऊंची क्यारियां (Raised Beds) बनाएं और ड्रिप व प्लास्टिक मल्चिंग का उपयोग करें।"
    }
  },
  groundnut: {
    sensitivity: "अंकुरण और सुइयां (पेगिंग) बनने के समय मध्यम संवेदनशीलता",
    current: {
      waterloggingRisk: "सुइयां बनने के समय जलभराव से सुइयां सड़ जाती हैं और दाना नहीं बन पाता। अतिरिक्त पानी तुरंत निकालें।",
      heavyRainRisk: "भारी बारिश से जमीन सख्त हो जाती है। बारिश रुकने पर हल्की गुड़ाई करें।",
      scorchingSunRisk: "सूखा पड़ने पर दाना छोटा रह जाता है। 10 दिन बारिश न हो तो स्प्रिंकलर से सिंचाई करें।",
      sprayWindowNotice: "टिक्का रोग नियंत्रण हेतु टेबुकोनाज़ोल का छिड़काव हवा धीमी होने पर करें।",
      diseaseWatch: "टिक्का पत्ती धब्बा और कॉलर रॉट (तना सड़न) रोग।"
    },
    newCultivation: {
      optimalSowingWindow: "मानसून की पहली 60-70 मिमी बारिश के बाद।",
      soilSuitability: "भुरभुरी लाल रेतीली दोमट मिट्टी जिसमें चूना और जिप्सम पर्याप्त हो।",
      varietiesRecommended: "कदिरी 6, कदिरी लेपाक्षी (K-1812), टीएजी 24, धरणी।",
      preparationSteps: "बुवाई के समय 200 किग्रा/एकड़ जिप्सम डालें। राइजोबियम से बीज उपचार अवश्य करें।"
    }
  }
};

export const STAGE_TRANSLATIONS = {
  te: {
    "Nursery / Transplanting": "నారుమడి / నాట్లు",
    "Tillering & Vegetative": "పిలకల దశ & శాఖీయ పెరుగుదల",
    "Panicle Initiation & Flowering": "వెన్ను వేసే దశ & పూత",
    "Milking & Grain Filling": "పాలుపోసుకునే దశ & గింజ ముదురుట",
    "Maturity & Harvesting": "కోత దశ",
    "Seedling Emergence": "మొలక దశ",
    "Squaring & Vegetative": "కాయ తొడుగు దశ",
    "Flowering & Boll Formation": "పూత & కాయలు ఏర్పడే దశ",
    "Boll Bursting & Picking": "కాయలు పగిలే దశ & పత్తి తీత",
    "Transplanting & Establishment": "నాట్లు & వేరు నిలదొక్కుకునే దశ",
    "Vegetative & Branching": "కొమ్మలు & శాఖీయ పెరుగుదల",
    "Flowering & Fruit Set": "పూత & పిందె కట్టే దశ",
    "Fruit Ripening & Harvesting": "కాయల పక్వత & కోత దశ",
    "Vegetative & Pegging": "శాఖీయ పెరుగుదల & ఊడలు దిగే దశ",
    "Pod Formation & Sizing": "కాయలు ఏర్పడే దశ",
    "Silking & Tasseling": "వెన్ను & కంకి దశ",
    "Grain Hardening": "గింజ ముదురు దశ",
    "Grand Growth": "ప్రధాన పెరుగుదల దశ",
    "Tillering & Jointing": "పిలకలు & కణుపుల దశ",
    "Grain Filling": "గింజ పాలుపోసుకునే దశ"
  },
  hi: {
    "Nursery / Transplanting": "नर्सरी / रोपाई की अवस्था",
    "Tillering & Vegetative": "कल्ले फूटना एवं वानस्पतिक वृद्धि",
    "Panicle Initiation & Flowering": "बाली निकलना एवं पुष्पन अवस्था",
    "Milking & Grain Filling": "दूधिया अवस्था एवं दाना भराव",
    "Maturity & Harvesting": "परिपक्वता एवं कटाई अवस्था",
    "Seedling Emergence": "अंकुरण एवं नवजात अवस्था",
    "Squaring & Vegetative": "वानस्पतिक वृद्धि एवं कली बनना",
    "Flowering & Boll Formation": "फूल आना एवं टिंडे बनना",
    "Boll Bursting & Picking": "टिंडे खिलना एवं कपास चुगाई",
    "Transplanting & Establishment": "रोपाई एवं पौधे जमने की अवस्था",
    "Vegetative & Branching": "वानस्पतिक शाखाएं निकलने की अवस्था",
    "Flowering & Fruit Set": "फूल आना एवं फल बनना",
    "Fruit Ripening & Harvesting": "फल पकना एवं तुड़ाई अवस्था",
    "Vegetative & Pegging": "वानस्पतिक वृद्धि एवं सुइयां (पेग्स) बनना",
    "Pod Formation & Sizing": "फलियां बनना एवं दाना विकास",
    "Silking & Tasseling": "मक्के में मंजर एवं बालियां निकलना",
    "Grain Hardening": "दाना सख्त होने की अवस्था",
    "Grand Growth": "तीव्र वानस्पतिक वृद्धि अवस्था",
    "Tillering & Jointing": "कल्ले निकलना एवं गांठें बनना",
    "Grain Filling": "दाना भराव अवस्था"
  },
  ta: {
    "Nursery / Transplanting": "நாற்றுப்பண்ணை / நடவு நிலை",
    "Tillering & Vegetative": "தூர்கட்டுதல் & வளரும் நிலை",
    "Panicle Initiation & Flowering": "கதிர் உருவாகுதல் & பூக்கும் நிலை",
    "Milking & Grain Filling": "பால் பிடிக்கும் & மணி முதிரும் நிலை",
    "Maturity & Harvesting": "அறுவடை நிலை",
    "Seedling Emergence": "முளைக்கும் நிலை",
    "Squaring & Vegetative": "தளிர் மற்றும் பூ மொட்டு நிலை",
    "Flowering & Boll Formation": "பூ பூத்தல் & காய் உருவாகும் நிலை",
    "Boll Bursting & Picking": "பஞ்சு வெடித்தல் & அறுவடை நிலை",
    "Transplanting & Establishment": "நடவு & வேர் பிடிக்கும் நிலை",
    "Vegetative & Branching": "கிளைத்தல் & வளர்ச்சி நிலை",
    "Flowering & Fruit Set": "பூக்கள் மற்றும் காய் பிடிக்கும் நிலை",
    "Fruit Ripening & Harvesting": "பழம் பழுத்தல் & அறுவடை நிலை",
    "Vegetative & Pegging": "வளர்ச்சி & விழுது இறங்கும் நிலை",
    "Pod Formation & Sizing": "காய் பிடிக்கும் நிலை",
    "Silking & Tasseling": "பூத்தல் & கதிர் உருவாகும் நிலை",
    "Grain Hardening": "தானியம் முதிரும் நிலை"
  },
  kn: {
    "Nursery / Transplanting": "ಸಸಿಮಡಿ / ನಾಟಿ ಹಂತ",
    "Tillering & Vegetative": "ಕವಲೊಡೆಯುವಿಕೆ ಮತ್ತು ಸಸ್ಯ ಬೆಳವಣಿಗೆ",
    "Panicle Initiation & Flowering": "ತೆನೆ ಮೂಡುವಿಕೆ ಮತ್ತು ಹೂಬಿಡುವ ಹಂತ",
    "Milking & Grain Filling": "ಹಾಲು ತುಂಬುವ ಮತ್ತು ಕಾಳು ಗಟ್ಟಿಯಾಗುವ ಹಂತ",
    "Maturity & Harvesting": "ಕೊಯ್ಲು ಹಂತ",
    "Seedling Emergence": "ಮೊಳಕೆ ಒಡೆಯುವ ಹಂತ",
    "Squaring & Vegetative": "ಮೊಗ್ಗು ಬಿಡುವ ಹಂತ",
    "Flowering & Boll Formation": "ಹೂ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ",
    "Boll Bursting & Picking": "ಹತ್ತಿ ಕಾಯಿ ಒಡೆಯುವ ಮತ್ತು ಬಿಡಿಸುವ ಹಂತ",
    "Transplanting & Establishment": "ನಾಟಿ ಮತ್ತು ಬೇರೂರುವ ಹಂತ",
    "Vegetative & Branching": "ಕೊಂಬೆ ಒಡೆಯುವಿಕೆ ಹಂತ",
    "Flowering & Fruit Set": "ಹೂವು ಮತ್ತು ಕಾಯಿ ಹಂತ",
    "Fruit Ripening & Harvesting": "ಹಣ್ಣು ಪಕ್ವತೆ ಮತ್ತು ಕಟಾವು ಹಂತ"
  }
};

export function getLocalizedStage(stage, langCode = 'en') {
  if (!stage) return "";
  if (STAGE_TRANSLATIONS[langCode]?.[stage]) {
    return STAGE_TRANSLATIONS[langCode][stage];
  }
  // Fallback checks
  for (const code of ['te', 'hi', 'ta', 'kn']) {
    if (langCode === code && STAGE_TRANSLATIONS[code]) {
      const match = Object.keys(STAGE_TRANSLATIONS[code]).find(k => stage.includes(k) || k.includes(stage));
      if (match) return STAGE_TRANSLATIONS[code][match];
    }
  }
  return stage;
}

export function getLocalizedCropAdvisory(crop, langCode = 'en') {
  if (langCode === 'te' && TELUGU_CROP_ADVISORIES[crop.id]) {
    const teData = TELUGU_CROP_ADVISORIES[crop.id];
    return {
      waterloggingSensitivity: teData.sensitivity,
      current: teData.current,
      newCultivation: teData.newCultivation
    };
  }

  if (langCode === 'hi' && HINDI_CROP_ADVISORIES[crop.id]) {
    const hiData = HINDI_CROP_ADVISORIES[crop.id];
    return {
      waterloggingSensitivity: hiData.sensitivity,
      current: hiData.current,
      newCultivation: hiData.newCultivation
    };
  }

  return {
    waterloggingSensitivity: crop.waterloggingSensitivity,
    current: crop.currentCropAdvisory,
    newCultivation: crop.newCultivationAdvisory
  };
}


