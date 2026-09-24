// Weather data generator for Aakash AI
export function getWeatherDataForPanchayat(panchayat = {}) {
  const p = panchayat || {};
  const elev = p.elevationMeters || 100;
  const isHilly = elev > 300;
  const terrain = p.terrainType || "Alluvial Plains & Coastal Delta";
  const isCoastal = terrain.includes("Coastal");
  const isArid = terrain.includes("Arid") || p.district === "YSR Kadapa" || p.district === "Jodhpur";
  const isDelta = terrain.includes("Delta") || terrain.includes("Alluvial");

  // Local temperature calculation based on standard lapse rate (approx 6.5°C per 1000m) + terrain microclimate
  const baseCoarseTemp = isArid ? 39 : isCoastal ? 33 : 34;
  const elevCooling = (elev / 1000) * 6.5;
  const downscaledTemp = Math.round((baseCoarseTemp - elevCooling) * 10) / 10;
  const feelsLike = isCoastal ? Math.round(downscaledTemp + 6) : Math.round(downscaledTemp + 2);

  const pName = p.name || 'Maredumilli Gram Panchayat';
  const pLocalName = p.localName || pName;
  const pTerrain = terrain;
  const pId = p.id || 'ap-asr-maredumilli';

  // Precipitation simulation based on elevation, topography, and seasonal moisture
  let currentRainMm = 0;
  let rainProb = 20;
  let currentCondition = "Partly Cloudy";
  let alertTriggerType = null; // 'waterlogging' | 'heavy_rain' | 'scorching_sun' | null

  if (pId === "ap-asr-maredumilli") {
    currentRainMm = 38.5;
    rainProb = 92;
    currentCondition = "Heavy Orographic Downpour";
    alertTriggerType = "waterlogging";
  } else if (pId === "ts-khammam-rural") {
    currentRainMm = 45.0;
    rainProb = 88;
    currentCondition = "Intense Thunderstorm Squall";
    alertTriggerType = "waterlogging";
  } else if (pId === "ap-kadapa-pulivendula" || pId === "ts-adilabad-rural" || pId === "rj-jodhpur-mandore") {
    currentRainMm = 0;
    rainProb = 5;
    currentCondition = "Scorching Sun / Severe Heat";
    alertTriggerType = "scorching_sun";
  } else if (pId === "ts-warangal-geesugonda") {
    currentRainMm = 28.0;
    rainProb = 75;
    currentCondition = "Afternoon Convective Rain";
    alertTriggerType = "heavy_rain";
  } else if (isHilly) {
    currentRainMm = 18.2;
    rainProb = 70;
    currentCondition = "Passing Mountain Showers";
  } else if (isCoastal) {
    currentRainMm = 6.5;
    rainProb = 45;
    currentCondition = "Humid Coastal Squall";
  } else {
    currentRainMm = 2.0;
    rainProb = 35;
    currentCondition = "Scattered Clouds";
  }

  // Atmospheric explainability ('Why it rains')
  let whyItRains = {
    headline: "Low Pressure & Local Terrain Convergence",
    atmosphericReason: "A cyclonic circulation in the Bay of Bengal is pumping moisture-laden southeasterly winds inland across the Eastern Ghats.",
    topographicFactor: `Because ${pName} sits at ${elev}m elevation (${pTerrain}), rising air cools rapidly (adiabatic expansion), condensing moisture into localized rainclouds 4 hours before the regional plain receives showers.`,
    farmerExplanation: "High atmospheric humidity combined with local ground heating is forcing moist air up your village hills, creating dense rain clouds directly over your panchayat by this afternoon.",
    actionRecommendation: "Immediately halt pesticide spraying as rain will wash off chemicals. Keep field drainage channels clear to prevent water stagnation in low-lying crop furrows.",
    local: {
      te: {
        headline: "అల్పపీడనం & స్థానిక కొండల ప్రాంతీయ వర్షపాత ప్రభావం",
        atmosphericReason: "బంగాళాఖాతంలో ఏర్పడిన వాయుగుండం కారణంగా తూర్పు కనుమల మీదుగా తేమతో కూడిన ఆగ్నేయ గాలులు బలంగా వీస్తున్నాయి.",
        topographicFactor: `${panchayat.localName || panchayat.name} సముద్ర మట్టానికి ${elev} మీటర్ల ఎత్తులో ఉండటం వల్ల, పైకి లేచే గాలి త్వరగా చల్లబడి, మైదాన ప్రాంతాల కంటే 4 గంటల ముందే ఇక్కడ దట్టమైన వర్షపు మబ్బులు ఏర్పడుతున్నాయి.`,
        farmerExplanation: "గాలిలో అధిక తేమ మరియు స్థానిక కొండల ఎత్తు ప్రభావం వల్ల మీ గ్రామ పంచాయతీ పరిధిలో నేరుగా వర్షపు మబ్బులు దట్టంగా అలుముకుంటున్నాయి.",
        actionRecommendation: "వర్షానికి మందులు కొట్టుకుపోయే అవకాశం ఉన్నందున పిచికారీని వెంటనే నిలిపివేయండి. చేలల్లో నీరు నిలవకుండా మురుగు కాలువలను సిద్ధం చేసుకోండి."
      },
      hi: {
        headline: "कम दबाव और स्थानीय स्थलाकृतिक अभिसरण",
        atmosphericReason: "बंगाल की खाड़ी में चक्रवाती परिसंचरण के कारण पूर्वी घाट के ऊपर से नमी युक्त दक्षिण-पूर्वी हवाएं चल रही हैं।",
        topographicFactor: `${panchayat.name} समुद्र तल से ${elev} मीटर ऊंचाई पर स्थित होने के कारण, ऊपर उठने वाली हवा तेजी से ठंडी होकर मैदानी क्षेत्रों से 4 घंटे पहले ही स्थानीय वर्षा बादल बनाती है।`,
        farmerExplanation: "हवा में उच्च नमी और स्थानीय भू-तापन के कारण आपके गांव की पहाड़ियों पर दोपहर तक घने वर्षा बादल बन रहे हैं।",
        actionRecommendation: "कीटनाशक छिड़काव तुरंत रोकें क्योंकि बारिश से दवा धुल जाएगी। जलभराव रोकने के लिए खेतों की जल निकासी नालियां खुली रखें।"
      },
      ta: {
        headline: "குறைந்த காற்றழுத்தம் மற்றும் உள்ளூர் நிலப்பரப்பு குவிதல்",
        atmosphericReason: "வங்காள விரிகுடாவில் நிலவும் சுழற்சி காரணமாக கிழக்கு தொடர்ச்சி மலைகள் வழியாக ஈரப்பதக் காற்று வீசுகிறது.",
        topographicFactor: `${panchayat.name} கடல் மட்டத்திலிருந்து ${elev} மீ உயரத்தில் உள்ளதால், காற்று விரைவாக குளிர்ந்து சமவெளியை விட 4 மணிநேரம் முன்னதாகவே மழை மேகங்களை உருவாக்குகிறது.`,
        farmerExplanation: "காற்றின் ஈரப்பதம் மற்றும் உள்ளூர் வெப்பம் காரணமாக உங்கள் கிராமத்தின் மீது பிற்பகலில் அடர்ந்த மழை மேகங்கள் உருவாகின்றன.",
        actionRecommendation: "மழை நீரில் மருந்து அடித்துச் செல்லப்படும் என்பதால் தெளிப்புப் பணியை உடனே நிறுத்துங்கள். வடிகால்களைச் சீரமைக்கவும்."
      },
      kn: {
        headline: "ವಾಯುಭಾರ ಕುಸಿತ ಮತ್ತು ಸ್ಥಳೀಯ ಭೂಪ್ರದೇಶದ ಪ್ರಭಾವ",
        atmosphericReason: "ಬಂಗಾಳಕೊಲ್ಲಿಯ ಚಂಡಮಾರುತದ ಪ್ರಭಾವದಿಂದ ಪೂರ್ವ ಘಟ್ಟಗಳ ಮೂಲಕ ತೇವಾಂಶ ಭರಿತ ಗಾಳಿ ಬೀಸುತ್ತಿದೆ.",
        topographicFactor: `${panchayat.name} ಸಮುದ್ರ ಮಟ್ಟದಿಂದ ${elev} ಮೀಟರ್ ಎತ್ತರದಲ್ಲಿರುವುದರಿಂದ, ಮೈದಾನ ಪ್ರದೇಶಗಳಿಗಿಂತ 4 ಗಂಟೆ ಮೊದಲೇ ಮಳೆ ಮೋಡಗಳು ದಟ್ಟವಾಗುತ್ತವೆ.`,
        farmerExplanation: "ಗಾಳಿಯಲ್ಲಿನ ತೇವಾಂಶ ಮತ್ತು ಸ್ಥಳೀಯ ಬಿಸಿಯಿಂದಾಗಿ ನಿಮ್ಮ ಗ್ರಾಮ ಪಂಚಾಯತ್ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಮಧ್ಯಾಹ್ನ ದಟ್ಟ ಮಳೆ ಮೋಡಗಳು ಆವರಿಸಲಿವೆ.",
        actionRecommendation: "ಮಳೆಯಿಂದಾಗಿ ಔಷಧಿ ಕೊಚ್ಚಿ ಹೋಗುವುದರಿಂದ ಕ್ರಿಮಿನಾಶಕ ಸಿಂಪಡಣೆಯನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ. ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ತೆರೆಯಿರಿ."
      },
      mr: {
        headline: "कमी दाबाचा पट्टा आणि स्थानिक भूप्रदेश प्रभाव",
        atmosphericReason: "बंगालच्या उपसागरातील चक्राकार वाऱ्यांमुळे पूर्व घाटावरून बाष्पयुक्त वारे वाहत आहेत.",
        topographicFactor: `${panchayat.name} समुद्रसपाटीपासून ${elev} मीटर उंचीवर असल्याने मैदानी भागापेक्षा ४ तास आधीच स्थानिक ढग तयार होत आहेत.`,
        farmerExplanation: "हवेतील आर्द्रता आणि स्थानिक उष्णतेमुळे दुपारपर्यंत तुमच्या गावावर थेट पावसाचे दाट ढग तयार होत आहेत.",
        actionRecommendation: "कीटकनाशक फवारणी त्वरित थांबवा कारण पावसाने औषध वाहून जाईल. शेतातील पाण्याचा निचरा मोकळा ठेवा."
      },
      pa: {
        headline: "ਘੱਟ ਦਬਾਅ ਅਤੇ ਸਥਾਨਕ ਭੂਗੋਲਿਕ ਪ੍ਰਭਾਵ",
        atmosphericReason: "ਬੰਗਾਲ ਦੀ ਖਾੜੀ ਦੇ ਚੱਕਰਵਾਤੀ ਪ੍ਰਭਾਵ ਕਾਰਨ ਨਮੀ ਵਾਲੀਆਂ ਹਵਾਵਾਂ ਤੇਜ਼ੀ ਨਾਲ ਵਹਿ ਰਹੀਆਂ ਹਨ।",
        topographicFactor: `${panchayat.name} ਸਮੁੰਦਰ ਤਲ ਤੋਂ ${elev} ਮੀਟਰ ਉੱਚਾਈ 'ਤੇ ਹੋਣ ਕਾਰਨ ਮੈਦਾਨੀ ਇਲਾਕਿਆਂ ਨਾਲੋਂ 4 ਘੰਟੇ ਪਹਿਲਾਂ ਮੀਂਹ ਦੇ ਬੱਦਲ ਬਣ ਰਹੇ ਹਨ।`,
        farmerExplanation: "ਹਵਾ ਵਿੱਚ ਨਮੀ ਅਤੇ ਸਥਾਨਕ ਗਰਮੀ ਕਾਰਨ ਦੁਪਹਿਰ ਤੱਕ ਤੁਹਾਡੀ ਪੰਚਾਇਤ ਉੱਤੇ ਸੰਘਣੇ ਮੀਂਹ ਦੇ ਬੱਦਲ ਛਾ ਰਹੇ ਹਨ।",
        actionRecommendation: "ਕੀਟਨਾਸ਼ਕ ਦਾ ਛਿੜਕਾਅ ਤੁਰੰਤ ਰੋਕੋ ਕਿਉਂਕਿ ਮੀਂਹ ਨਾਲ ਦਵਾਈ ਵਹਿ ਜਾਵੇਗੀ। ਖੇਤਾਂ ਵਿੱਚੋਂ ਪਾਣੀ ਦੀ ਨਿਕਾਸੀ ਸਾਫ਼ ਰੱਖੋ।"
      },
      bn: {
        headline: "নিম্নচাপ এবং স্থানীয় ভূপ্রকৃতির প্রভাব",
        atmosphericReason: "বঙ্গোপসাগরে ঘূর্ণাবর্তের কারণে পূর্বঘাট পর্বতমালার উপর দিয়ে আর্দ্র দক্ষিণ-পূর্ব বায়ু প্রবাহিত হচ্ছে।",
        topographicFactor: `${panchayat.name} সমুদ্রপৃষ্ঠ থেকে ${elev} মিটার উচ্চতায় অবস্থানের কারণে সমতলের ৪ ঘণ্টা আগেই স্থানীয় বৃষ্টির মেঘ সৃষ্টি হচ্ছে।` ,
        farmerExplanation: "বাতাসে অতিরিক্ত আর্দ্রতা ও স্থানীয় উত্তাপের ফলে দুপুর নাগাদ আপনার পঞ্চায়েতের উপর ঘন বৃষ্টির মেঘ জমছে।",
        actionRecommendation: "বৃষ্টিতে ওষুধ ধুয়ে যাওয়ার ঝুঁকিতে কীটনাশক স্প্রে বন্ধ রাখুন। জমিতে জল নিষ্কাশনের ব্যবস্থা পরিষ্কার রাখুন।"
      }
    }
  };

  if (alertTriggerType === "scorching_sun") {
    whyItRains = {
      headline: "Sub-tropical High Pressure & Solar Insolation",
      atmosphericReason: "Clear cloudless sky with sinking dry continental airmass allowing 94% direct solar radiation to strike topsoil.",
      topographicFactor: `Semi-arid basin topography causes thermal trap: ground surface temperatures hit 46°C with relative humidity dropping below 28%.`,
      farmerExplanation: "No cloud cover and strong hot winds are sucking moisture out of your soil and crop leaves at triple the normal speed.",
      actionRecommendation: "Do not apply chemical fertilizers or herbicides today. Run light drip irrigation in early morning or after 6 PM to prevent flower dropping in standing crops.",
      local: {
        te: {
          headline: "ఉపఉష్ణమండల అధిక పీడనం & తీవ్రమైన ఎండ వేడిమి ప్రభావం",
          atmosphericReason: "మేఘాలు లేని నిర్మలమైన ఆకాశం మరియు పొడి భూభాగ గాలుల వల్ల 94% ప్రత్యక్ష సూర్యరశ్మి నేలపై పడుతోంది.",
          topographicFactor: `వర్షాభావ మైదాన ప్రాంత భౌగోళిక పరిస్థితుల వల్ల నేల ఉష్ణోగ్రత 46°C కి చేరుతోంది మరియు గాలిలో తేమ 28% కంటే తక్కువగా పడిపోయింది.`,
          farmerExplanation: "మబ్బులు లేకపోవడం మరియు తీవ్రమైన వేడి గాలుల వల్ల మీ నేలలోని తేమ మరియు పంట ఆకుల నుండి నీరు సాధారణం కంటే మూడు రెట్లు వేగంగా ఆవిరైపోతోంది.",
          actionRecommendation: "ఈరోజు రసాయన ఎరువులు లేదా కలుపు మందులు వాడవద్దు. పూత రాలిపోకుండా ఉండేందుకు ఉదయం లేదా సాయంత్రం 6 గంటల తర్వాత తేలికపాటి నీరు అందించండి."
        },
        hi: {
          headline: "उपोष्णकटिबंधीय उच्च दबाव व तीव्र सौर ताप",
          atmosphericReason: "बिना बादलों का साफ आसमान और शुष्क महाद्वीपीय हवाएं जिससे 94% सीधी धूप मिट्टी पर पड़ रही है।",
          topographicFactor: `अर्ध-शुष्क घाटी स्थलाकृति के कारण सतह का तापमान 46°C तक पहुंच रहा है और आर्द्रता 28% से कम हो गई है।`,
          farmerExplanation: "बादल न होने और तेज गर्म हवाओं से मिट्टी और फसलों की पत्तियों की नमी सामान्य से 3 गुना तेजी से सूख रही है।",
          actionRecommendation: "आज रासायनिक उर्वरक या खरपतवार नाशक न डालें। फूल झड़ने से रोकने के लिए सुबह या शाम 6 बजे बाद हल्की ड्रिप सिंचाई करें।"
        },
        ta: {
          headline: "அதிக காற்றழுத்தம் & கடும் சூரிய வெப்ப அலை",
          atmosphericReason: "மேகமற்ற வானம் மற்றும் வறண்ட நிலக்காற்று காரணமாக 94% நேரடி சூரிய கதிர்வீச்சு நிலத்தில் விழுகிறது.",
          topographicFactor: `வறண்ட நிலப்பரப்பு காரணமாக நிலத்தின் வெப்பநிலை 46°C ஆக உயர்ந்து காற்றில் ஈரப்பதம் 28% ஆகக் குறைந்துள்ளது.`,
          farmerExplanation: "மேகமூட்டம் இல்லாததாலும் அனல் காற்று வீசுவதாலும் பயிர்களின் ஈரப்பதம் 3 மடங்கு வேகமாக ஆவியாகிறது.",
          actionRecommendation: "இன்று உரங்கள் அல்லது பூச்சிக்கொல்லிகள் இட வேண்டாம். பூ உதிர்வதைத் தடுக்க காலை அல்லது மாலை 6 மணிக்கு மேல் லேசான நீர் பாய்ச்சவும்."
        },
        kn: {
          headline: "ಉಪೋಷ್ಣವಲಯದ ಅಧಿಕ ಒತ್ತಡ & ತೀವ್ರ ಸೂರ್ಯನ ತಾಪಮಾನ",
          atmosphericReason: "ಮೋಡವಿಲ್ಲದ ಶುಭ್ರ ಆಕಾಶ ಮತ್ತು ಒಣ ಭೂಗಾಳಿಯ ಕಾರಣ 94% ನೇರ ಸೂರ್ಯನ ಶಾಖ ಮಣ್ಣಿಗೆ ತಲುಪುತ್ತಿದೆ.",
          topographicFactor: `ಅರೆ-ಶುಷ್ಕ ಕಣಿವೆ ಪ್ರದೇಶದ ಕಾರಣ ನೆಲದ ಉಷ್ಣಾಂಶವು 46°C ತಲುಪಿದ್ದು ಗಾಳಿಯ ತೇವಾಂಶವು 28% ಕ್ಕಿಂತ ಕಡಿಮೆಯಾಗಿದೆ.`,
          farmerExplanation: "ಮೋಡಗಳಿಲ್ಲದೆ ಬಿಸಿ ಗಾಳಿ ಬೀಸುತ್ತಿರುವುದರಿಂದ ನಿಮ್ಮ ಮಣ್ಣಿನ ಮತ್ತು ಬೆಳೆಯ ಎಲೆಗಳ ತೇವಾಂಶವು 3 ಪಟ್ಟು ವೇಗವಾಗಿ ಆವಿಯಾಗುತ್ತಿದೆ.",
          actionRecommendation: "ಇಂದು ರಾಸಾಯನಿಕ ಗೊಬ್ಬರ ಅಥವಾ ಕಳೆನಾಶಕ ಬಳಸಬೇಡಿ. ಹೂವು ಉದುರುವುದನ್ನು ತಡೆಯಲು ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ 6 ರ ನಂತರ ಹನಿ ನೀರಾವರಿ ನೀಡಿ."
        },
        mr: {
          headline: "उपोष्णकटिबंधीय उच्च दाब आणि तीव्र सूर्यप्रकाश",
          atmosphericReason: "निरभ्र आकाश आणि कोरड्या भूभागातील वाऱ्यांमुळे ९४% थेट सूर्यप्रकाश जमिनीवर पडत आहे.",
          topographicFactor: `अर्ध-शुष्क खोऱ्याच्या रचनेमुळे जमिनीचे तापमान ४६°C पर्यंत पोहोचले असून हवेतील आर्द्रता २८% च्या खाली घसरली आहे.` ,
          farmerExplanation: "ढग नसल्यामुळे व उष्ण वाऱ्यांमुळे जमिनीतील व पिकांच्या पानांतील ओलावा नेहमीपेक्षा ३ पट वेगाने सुकत आहे.",
          actionRecommendation: "आज रासायनिक खते किंवा तणनाशके वापरू नका. फुले गळणे टाळण्यासाठी सकाळी किंवा संध्याकाळी ६ नंतर हलके पाणी द्या."
        },
        pa: {
          headline: "ਉਪ-ਤਪਤਖੰਡੀ ਉੱਚ ਦਬਾਅ ਅਤੇ ਤਿੱਖੀ ਧੁੱਪ",
          atmosphericReason: "ਸਾਫ਼ ਅਸਮਾਨ ਅਤੇ ਖੁਸ਼ਕ ਹਵਾਵਾਂ ਕਾਰਨ 94% ਸਿੱਧੀ ਧੁੱਪ ਜ਼ਮੀਨ 'ਤੇ ਪੈ ਰਹੀ ਹੈ।",
          topographicFactor: `ਖੁਸ਼ਕ ਇਲਾਕੇ ਕਾਰਨ ਜ਼ਮੀਨੀ ਤਾਪਮਾਨ 46°C ਤੱਕ ਪਹੁੰਚ ਗਿਆ ਹੈ ਅਤੇ ਹਵਾ ਵਿੱਚ ਨਮੀ 28% ਤੋਂ ਹੇਠਾਂ ਆ ਗਈ ਹੈ।`,
          farmerExplanation: "ਬੱਦਲ ਨਾ ਹੋਣ ਅਤੇ ਤੇਜ਼ ਗਰਮ ਹਵਾਵਾਂ ਕਾਰਨ ਮਿੱਟੀ ਅਤੇ ਫ਼ਸਲਾਂ ਦੀ ਨਮੀ 3 ਗੁਣਾ ਤੇਜ਼ੀ ਨਾਲ ਉੱਡ ਰਹੀ ਹੈ।",
          actionRecommendation: "ਅੱਜ ਖਾਦ ਜਾਂ ਨਦੀਨਨਾਸ਼ਕ ਨਾ ਪਾਓ। ਫੁੱਲ ਡਿੱਗਣ ਤੋਂ ਬਚਾਉਣ ਲਈ ਸਵੇਰੇ ਜਾਂ ਸ਼ਾਮ 6 ਵਜੇ ਤੋਂ ਬਾਅਦ ਹਲਕਾ ਪਾਣੀ ਲਗਾਓ।"
        },
        bn: {
          headline: "উপক্রান্তীয় উচ্চ চাপ ও প্রচণ্ড সূর্যের উত্তাপ",
          atmosphericReason: "মেঘমুক্ত পরিষ্কার আকাশ এবং শুষ্ক বাতাসের কারণে ৯৪% সরাসরি সৌর বিকিরণ মাটির ওপর পড়ছে।",
          topographicFactor: `আধা-শুষ্ক অববাহিকার কারণে মাটির তাপমাত্রা ৪৬°C এ পৌঁছেছে এবং বাতাসের আর্দ্রতা ২৮% এর নিচে নেমেছে।`,
          farmerExplanation: "মেঘ না থাকা এবং গরম বাতাসের কারণে মাটি ও ফসলের পাতার আর্দ্রতা স্বাভাবিকের চেয়ে ৩ গুণ দ্রুত বাষ্পীভূত হচ্ছে।",
          actionRecommendation: "আজ জমিতে রাসায়নিক সার বা আগাছানাশক দেবেন না। ফুল ঝরা রোধ করতে সকালে বা সন্ধ্যা ৬টার পর হালকা জলসেচ দিন।"
        }
      }
    };
  }

  // Full 1-Hour Interval Forecast across 3 Days (24 hours each = 72 total hourly points)
  const generateHourlyForecast = () => {
    const days = ["Today", "Tomorrow", "Day 3"];
    const points = [];

    days.forEach((dayLabel, dayIndex) => {
      const dayTempDelta = dayIndex === 0 ? 0 : dayIndex === 1 ? -0.5 : 1.0;
      const dayRainDelta = dayIndex === 0 ? 0 : dayIndex === 1 ? -5 : -10;

      for (let h = 0; h < 24; h++) {
        const period = h >= 12 ? "PM" : "AM";
        const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const timeStr = `${String(displayH).padStart(2, '0')}:00 ${period}`;

        // Diurnal solar curve (lowest at 5:30 AM, peak at 2:30 PM)
        const diurnalFactor = Math.max(0, Math.sin(((h - 5.5) / 14) * Math.PI));
        const minTemp = downscaledTemp - (isArid ? 6 : 4) + dayTempDelta;
        const maxTemp = downscaledTemp + (isArid ? 4 : 3) + dayTempDelta;
        const hourTemp = Math.round((minTemp + (maxTemp - minTemp) * Math.pow(diurnalFactor, 1.2)) * 10) / 10;

        let hourRainProb = Math.max(5, Math.min(95, rainProb + dayRainDelta));
        let hourRainMm = 0;
        let condition = "Partly Cloudy";

        if (h >= 13 && h <= 18) {
          hourRainProb = Math.min(95, hourRainProb + 15);
          if (currentRainMm > 15) {
            hourRainMm = Math.round((currentRainMm * 0.35 + (h === 15 ? 4.5 : 1.2)) * 10) / 10;
            condition = isHilly ? "Heavy Orographic Downpour" : "Intense Thunderstorm Squall";
          } else if (currentRainMm > 2) {
            hourRainMm = Math.round((currentRainMm * 0.25) * 10) / 10;
            condition = "Afternoon Convective Rain";
          } else {
            condition = isArid ? "Scorching Sun / Severe Heat" : "Partly Sunny & Humid";
          }
        } else if (h >= 6 && h < 13) {
          hourRainProb = Math.max(5, hourRainProb - 10);
          hourRainMm = isCoastal && h >= 8 ? 0.8 : 0;
          condition = hourRainMm > 0 ? "Humid Coastal Squall" : h >= 9 && isArid ? "Scorching Sun / Severe Heat" : "Partly Cloudy";
        } else {
          hourRainProb = Math.max(5, hourRainProb - 15);
          hourRainMm = h <= 21 && currentRainMm > 20 ? 1.5 : 0;
          condition = hourRainMm > 0 ? "Passing Mountain Showers" : "Clear Sky";
        }

        const baseRH = isCoastal ? 82 : isHilly ? 78 : isArid ? 38 : 65;
        const humidity = Math.min(96, Math.max(22, Math.round(baseRH + (1 - diurnalFactor) * 22)));
        const baseWind = isHilly ? 16 : isCoastal ? 18 : 10;
        const wind = Math.round(baseWind + (h >= 12 && h <= 17 ? 6 : -3));

        let sprayWindow = "Safe";
        if (hourRainProb >= 40 || hourRainMm >= 1.0 || wind >= 18) {
          sprayWindow = "Prohibited";
        } else if (hourRainProb >= 25 || wind >= 14) {
          sprayWindow = "Risky";
        } else if (h >= 6 && h <= 10 && wind <= 10) {
          sprayWindow = "Optimal Spray Window";
        }

        const irrigation = (hourRainProb >= 40 || hourRainMm >= 2.0) ? "Hold / Drain" : "Normal";

        points.push({
          day: dayLabel,
          time: timeStr,
          hour: h,
          temp: Math.round(hourTemp),
          condition,
          rainProb: Math.round(hourRainProb),
          rainMm: hourRainMm,
          humidity,
          wind,
          sprayWindow,
          irrigation
        });
      }
    });

    return points;
  };

  const threeDayHourly = generateHourlyForecast();

  // 1-Week (7-Day) Forecast
  const oneWeekForecast = [
    {
      day: "Today",
      date: "22 Sep",
      condition: currentCondition,
      maxTemp: Math.round(downscaledTemp + 2),
      minTemp: Math.round(downscaledTemp - 4),
      rainProb: rainProb,
      expectedRainMm: currentRainMm,
      windSpeed: "14-22 km/h",
      soilMoisture: "82% (Saturated)",
      pestRisk: "Medium-High",
      farmActivity: currentRainMm > 20 ? "🚨 Clear drainage ditches immediately. Avoid urea top-dressing." : "Light weeding permitted; hold irrigation."
    },
    {
      day: "Wednesday",
      date: "23 Sep",
      condition: rainProb > 50 ? "Scattered Thunderstorms" : "Partly Sunny",
      maxTemp: Math.round(downscaledTemp + 1),
      minTemp: Math.round(downscaledTemp - 5),
      rainProb: Math.max(25, rainProb - 15),
      expectedRainMm: currentRainMm > 20 ? 12.0 : 4.0,
      windSpeed: "12-18 km/h",
      soilMoisture: "78%",
      pestRisk: "Medium",
      farmActivity: "Check for fungal spot on lower leaves; postpone foliar spray until afternoon."
    },
    {
      day: "Thursday",
      date: "24 Sep",
      condition: "Clear & Sunny",
      maxTemp: Math.round(downscaledTemp + 3),
      minTemp: Math.round(downscaledTemp - 3),
      rainProb: 20,
      expectedRainMm: 0.5,
      windSpeed: "8-12 km/h",
      soilMoisture: "65%",
      pestRisk: "Low",
      farmActivity: "✅ Highly optimal window for insecticide/fungicide spray. Safe for harvesting early vegetables."
    },
    {
      day: "Friday",
      date: "25 Sep",
      condition: "Warm Sunshine",
      maxTemp: Math.round(downscaledTemp + 4),
      minTemp: Math.round(downscaledTemp - 2),
      rainProb: 15,
      expectedRainMm: 0,
      windSpeed: "7-10 km/h",
      soilMoisture: "58%",
      pestRisk: "Low",
      farmActivity: "Provide scheduled canal/borewell irrigation for cotton and maize crops."
    },
    {
      day: "Saturday",
      date: "26 Sep",
      condition: "Humid & Breezy",
      maxTemp: Math.round(downscaledTemp + 3),
      minTemp: Math.round(downscaledTemp - 3),
      rainProb: 35,
      expectedRainMm: 2.5,
      windSpeed: "11-15 km/h",
      soilMoisture: "60%",
      pestRisk: "Low-Medium",
      farmActivity: "Inter-cultivation and tractor plowing recommended."
    },
    {
      day: "Sunday",
      date: "27 Sep",
      condition: "Passing Clouds",
      maxTemp: Math.round(downscaledTemp + 2),
      minTemp: Math.round(downscaledTemp - 4),
      rainProb: 40,
      expectedRainMm: 5.0,
      windSpeed: "10-14 km/h",
      soilMoisture: "64%",
      pestRisk: "Medium",
      farmActivity: "Monitor paddy nurseries for stem borer moths; inspect cotton leaf underside."
    },
    {
      day: "Monday",
      date: "28 Sep",
      condition: "Localized Evening Showers",
      maxTemp: Math.round(downscaledTemp + 1),
      minTemp: Math.round(downscaledTemp - 4),
      rainProb: 55,
      expectedRainMm: 9.0,
      windSpeed: "13-17 km/h",
      soilMoisture: "70%",
      pestRisk: "Medium",
      farmActivity: "Secure harvested grain bags in waterproof sheds."
    }
  ];

  // 1-Month (Agro-Meteorological Seasonal Outlook)
  const oneMonthOutlook = {
    monthlySummary: {
      totalExpectedRainMm: isHilly ? 245 : isArid ? 45 : 140,
      historicalAverageRainMm: isHilly ? 210 : isArid ? 55 : 125,
      rainfallDeviation: isHilly ? "+16.7% (Above Normal)" : isArid ? "-18.2% (Dry Spell Warning)" : "+12.0% (Normal)",
      rainyDaysCount: isHilly ? 16 : isArid ? 4 : 11,
      averageDayTemp: Math.round(downscaledTemp + 1),
      averageNightTemp: Math.round(downscaledTemp - 5),
      overallSuitability: isArid ? "Deficit Risk - Requires Drip Scheduling" : "Highly Favorable for Kharif Maturation & Rabi Pre-Sowing"
    },
    weeks: [
      {
        weekNumber: "Week 1 (Sep 22 - Sep 28)",
        theme: "Active Convective Shower Phase",
        expectedRainfall: isHilly ? "65 - 85 mm" : isArid ? "5 - 10 mm" : "35 - 50 mm",
        soilMoistureTrend: "High (75 - 85%)",
        drySpellRisk: "Very Low",
        heatStressRisk: "Low",
        cultivationAdvisory: "Soil moisture is plentiful. Excellent for transplanting late paddy and booster vegetative growth in cotton and maize. Avoid fertilizer application right before thunderstorm days."
      },
      {
        weekNumber: "Week 2 (Sep 29 - Oct 05)",
        theme: "Monsoon Break / Transition Window",
        expectedRainfall: isHilly ? "20 - 35 mm" : isArid ? "0 - 2 mm" : "10 - 20 mm",
        soilMoistureTrend: "Gradual decline to 60%",
        drySpellRisk: "Moderate",
        heatStressRisk: "Moderate (Temp +2°C)",
        cultivationAdvisory: "Rain activity pauses. Ideal 5-day window for field operations: mechanical weeding, foliar pesticide spray, and soil aeration. Start preparing nurseries for Rabi season."
      },
      {
        weekNumber: "Week 3 (Oct 06 - Oct 12)",
        theme: "Post-Monsoon Thunderstorm Activity",
        expectedRainfall: isHilly ? "50 - 70 mm" : isArid ? "15 - 25 mm" : "30 - 45 mm",
        soilMoistureTrend: "Replenished to 72%",
        drySpellRisk: "Low",
        heatStressRisk: "Low",
        cultivationAdvisory: "Localized evening squalls likely due to retreat winds. Cotton farmers should harvest open bolls before week 3 rains to prevent boll discolouration and lint damage."
      },
      {
        weekNumber: "Week 4 (Oct 13 - Oct 20)",
        theme: "Cooling Dew Period & Rabi Sowing Window",
        expectedRainfall: isHilly ? "15 - 25 mm" : isArid ? "0 - 5 mm" : "10 - 18 mm",
        soilMoistureTrend: "Optimal 55 - 65% in seed zone",
        drySpellRisk: "Low",
        heatStressRisk: "Very Low (Night temp drops 4°C)",
        cultivationAdvisory: "Optimal soil temperature and moisture for commencing Rabi crop sowing (Bengal gram/Chickpea, Rabi Sorghum, Mustard, Groundnut). Seed treatment with Trichoderma recommended."
      }
    ]
  };

  // Coarse vs Downscaled comparison metrics for judges
  const coarseModelComparison = {
    districtName: panchayat.district,
    coarseModelResolution: "25 km x 25 km (Regional NWP)",
    downscaledResolution: "1 km x 1 km (Aakash AI Downscaled)",
    coarseForecast: {
      temp: baseCoarseTemp,
      rainChance: isHilly ? 35 : 30,
      rainMm: isHilly ? 6.0 : 4.0,
      windSpeed: "10 km/h",
      microAlert: "None (District Average Green)"
    },
    downscaledForecast: {
      temp: downscaledTemp,
      rainChance: rainProb,
      rainMm: currentRainMm,
      windSpeed: isHilly ? "22 km/h" : "14 km/h",
      microAlert: alertTriggerType ? `${alertTriggerType.toUpperCase().replace('_', ' ')} ALERT` : "Normal Farm Operations"
    },
    deltaAnalysis: {
      elevationDifference: `Panchayat elevation is ${elev}m vs District HQ flat elevation of 45m.`,
      tempVariance: `${Math.abs(Math.round((downscaledTemp - baseCoarseTemp)*10)/10)}°C variance due to lapse rate and vegetative canopy.`,
      rainVariance: `${Math.abs(Math.round((currentRainMm - (isHilly ? 6.0 : 4.0))*10)/10)} mm difference from local orographic lift.`,
      judgeVerdict: "Generic district forecast misses hyper-local flash storms and micro-droughts, risking millions in crop damage."
    }
  };

  return {
    panchayat,
    current: {
      temp: downscaledTemp,
      feelsLike: feelsLike,
      condition: currentCondition,
      rainProb: rainProb,
      rainMm: currentRainMm,
      humidity: isCoastal ? 88 : isHilly ? 85 : isArid ? 34 : 72,
      windSpeed: isHilly ? 22 : 14,
      windDirection: "SE",
      uvIndex: isArid ? 9 : 5,
      soilMoisture: isHilly ? 82 : isArid ? 29 : 68,
      dewPoint: Math.round(downscaledTemp - 3),
      alertTriggerType: alertTriggerType
    },
    whyItRains,
    threeDayHourly,
    oneWeekForecast,
    oneMonthOutlook,
    coarseModelComparison
  };
}

export const WEATHER_CONDITIONS_LOCALIZED = {
  "Heavy Orographic Downpour": {
    en: "Heavy Orographic Downpour",
    te: "భారీ పర్వత ప్రాంత కుంభవృష్టి",
    hi: "भारी पर्वतीय मूसलाधार बारिश",
    ta: "கடும் மலைத்தொடர் கனமழை",
    kn: "ಭಾರೀ ಪರ್ವತ ಮಳೆ",
    mr: "जोरदार पर्वतीय मुसळधार पाऊस",
    pa: "ਭਾਰੀ ਪਹਾੜੀ ਮੀਂਹ",
    bn: "ভারী পার্বত্য মুষলধারে বৃষ্টি"
  },
  "Intense Thunderstorm Squall": {
    en: "Intense Thunderstorm Squall",
    te: "తీవ్ర ఉరుములు మెరుపులతో కూడిన తుఫాను",
    hi: "तीव्र गरज-चमक के साथ तूफान",
    ta: "தீவிர இடி மின்னல் புயல்",
    kn: "ತೀವ್ರ ಗುಡುಗು ಮಿಂಚಿನ ಬಿರುಗಾಳಿ",
    mr: "तीव्र वादळी पाऊस",
    pa: "ਭਾਰੀ ਗਰਜ ਨਾਲ ਤੂਫਾਨ",
    bn: "তীব্র বজ্রবিদ্যুৎ সহ ঝড়"
  },
  "Scorching Sun / Severe Heat": {
    en: "Scorching Sun / Severe Heat",
    te: "తీవ్రమైన ఎండ వేడిమి / వడగాలులు",
    hi: "भीषण धूप / तीव्र लू",
    ta: "கொளுத்தும் வெயில் / தீவிர வெப்பம்",
    kn: "ಸುಡುವ ಬಿಸಿಲು / ತೀವ್ರ ಶಾಖ",
    mr: "कडक ऊन / तीव्र उष्णता",
    pa: "ਤਿੱਖੀ ਧੁੱਪ / ਭਾਰੀ ਗਰਮੀ",
    bn: "প্রখর রোদ / তীব্র তাপপ্রবাহ"
  },
  "Afternoon Convective Rain": {
    en: "Afternoon Convective Rain",
    te: "మధ్యాహ్న ఉరుముల వర్షం",
    hi: "दोपहर की संवहनीय वर्षा",
    ta: "பிற்பகல் வெப்பச் சலன மழை",
    kn: "ಮಧ್ಯಾಹ್ನದ ಉಷ್ಣ ಸಂವಹನ ಮಳೆ",
    mr: "दुपारचा संवहनीय पाऊस",
    pa: "ਦੁਪਹਿਰ ਦੀ ਕੰਵੈਕਟਿਵ ਵਰਖਾ",
    bn: "দুপুরের পরিচলন বৃষ্টিপাত"
  },
  "Passing Mountain Showers": {
    en: "Passing Mountain Showers",
    te: "కొండల మీదుగా వెళ్లే జల్లులు",
    hi: "पहाड़ी फुहारें",
    ta: "கடந்து செல்லும் மலைச்சாரல்",
    kn: "ಹಾದುಹೋಗುವ ಪರ್ವತ ಜಲ್ಲೆಗಳು",
    mr: "पर्वतीय पावसाच्या सरी",
    pa: "ਪਹਾੜੀ ਹਲਕੀ ਵਰਖਾ",
    bn: "পাহাড়ি ক্ষণস্থায়ী বৃষ্টি"
  },
  "Humid Coastal Squall": {
    en: "Humid Coastal Squall",
    te: "తేమతో కూడిన తీరప్రాంత ఈదురుగాలులు",
    hi: "आर्द्र तटीय झोंकेदार बारिश",
    ta: "ஈரப்பதக் கடலோரக் காற்றுமழை",
    kn: "ತೇವಾಂಶಭರಿತ ಕರಾವಳಿ ಬಿರುಗಾಳಿ",
    mr: "दमट किनारपट्टी वादळ",
    pa: "ਨਮੀ ਵਾਲੀ ਤੱਟਵਰਤੀ ਹਵਾ",
    bn: "আর্দ্র উপকূলীয় দমকা বৃষ্টি"
  },
  "Scattered Clouds": {
    en: "Scattered Clouds",
    te: "చెదురుమదురు మేఘాలు",
    hi: "छिटपुट बादल",
    ta: "சிதறிய மேகங்கள்",
    kn: "ಚದುರಿದ ಮೋಡಗಳು",
    mr: "विखुरलेले ढग",
    pa: "ਖਿੱਲਰੇ ਬੱਦਲ",
    bn: "বিক্ষিপ্ত মেঘ"
  },
  "Partly Cloudy": {
    en: "Partly Cloudy",
    te: "పాక్షికంగా మేఘావృతం",
    hi: "आंशिक रूप से बादल",
    ta: "பகுதி மேகமூட்டம்",
    kn: "ಭಾಗಶಃ ಮೋಡ",
    mr: "अंशतः ढगाळ",
    pa: "ਅੰਸ਼ਕ ਤੌਰ 'ਤੇ ਬੱਦਲਵਾਈ",
    bn: "আংশিক মেঘলা"
  },
  "Scattered Showers": {
    en: "Scattered Showers",
    te: "అక్కడక్కడా వర్షపు జల్లులు",
    hi: "छिटपुट बौछारें",
    ta: "ஆங்காங்கே மழைச்சாரல்",
    kn: "ಅಲ್ಲಲ್ಲಿ ಮಳೆ ಹನಿಗಳು",
    mr: "विखुरलेल्या पावसाच्या सरी",
    pa: "ਕਿਤੇ-ਕਿਤੇ ਫੁਹਾਰਾਂ",
    bn: "বিক্ষিপ্ত বৃষ্টিপাত"
  },
  "Moderate Convective Rain": {
    en: "Moderate Convective Rain",
    te: "మితమైన వర్షపాతం",
    hi: "मध्यम वर्षा",
    ta: "மிதமான மழை",
    kn: "ಮಧ್ಯಮ ಮಳೆ",
    mr: "मध्यम पाऊस",
    pa: "ਦਰਮਿਆਨਾ ਮੀਂਹ",
    bn: "মাঝারি বৃষ্টি"
  },
  "Overcast Passing Clouds": {
    en: "Overcast Passing Clouds",
    te: "దట్టమైన కమ్ముకున్న మేఘాలు",
    hi: "घने बादल",
    ta: "மூடிய மேகங்கள்",
    kn: "ದಟ್ಟ ಮೋಡಗಳು",
    mr: "दाट ढगाळ वातावरण",
    pa: "ਸੰਘਣੇ ਬੱਦਲ",
    bn: "ঘন মেঘলা আকাশ"
  },
  "Partly Sunny & Humid": {
    en: "Partly Sunny & Humid",
    te: "ఎండ మరియు గాలిలో తేమ",
    hi: "धूप व उमस",
    ta: "வெயில் மற்றும் ஈரப்பதம்",
    kn: "ಬಿಸಿಲು ಮತ್ತು ತೇವಾಂಶ",
    mr: "ऊन आणि दमट हवामान",
    pa: "ਧੁੱਪ ਅਤੇ ਨਮੀ",
    bn: "রোদ ও আর্দ্রতা"
  },
  "Sunny & Pleasant": {
    en: "Sunny & Pleasant",
    te: "ఆహ్లాదకరమైన ఎండ",
    hi: "सुहावनी धूप",
    ta: "இதமான வெயில்",
    kn: "ಆಹ್ಲಾದಕರ ಬಿಸಿಲು",
    mr: "आल्हाददायक ऊन",
    pa: "ਸੁਹਾਵਣੀ ਧੁੱਪ",
    bn: "মনোরম রোদ"
  },
  "Clear Sky & Moderate Heat": {
    en: "Clear Sky & Moderate Heat",
    te: "నిర్మలమైన ఆకాశం & సాధారణ వేడి",
    hi: "साफ आसमान व सामान्य गर्मी",
    ta: "தெளிவான வானம் மற்றும் மிதமான வெப்பம்",
    kn: "ಸ್ವಚ್ಛ ಆಕಾಶ ಮತ್ತು ಸಾಮಾನ್ಯ ಶಾಖ",
    mr: "निरभ्र आकाश व सामान्य उष्णता",
    pa: "ਸਾਫ਼ ਅਸਮਾਨ ਅਤੇ ਦਰਮਿਆਨੀ ਗਰਮੀ",
    bn: "পরিষ্কার আকাশ ও সাধারণ গরম"
  },
  "Light Drizzle & Overcast": {
    en: "Light Drizzle & Overcast",
    te: "తేలికపాటి తుంపర & మేఘాలు",
    hi: "हल्की बूंदाबांदी व बादल",
    ta: "லேசான தூறல் & மேகமூட்டம்",
    kn: "ಹಗುರ ತುಂತುರು & ಮೋಡ",
    mr: "हलकी भुरभुर व ढगाळ",
    pa: "ਹਲਕੀ ਬੂੰਦਾ-ਬਾਂਦੀ",
    bn: "হালকা গুঁড়ি গুঁড়ি বৃষ্টি"
  },
  "Clear & Dry": {
    en: "Clear & Dry",
    te: "నిర్మలం & పొడి వాతావరణం",
    hi: "साफ व शुष्क मौसम",
    ta: "தெளிவான வறண்ட வானிலை",
    kn: "ಸ್ವಚ್ಛ ಮತ್ತು ಒಣ ಹವೆ",
    mr: "निरभ्र व कोरडे हवामान",
    pa: "ਸਾਫ਼ ਅਤੇ ਖੁਸ਼ਕ",
    bn: "পরিষ্কার ও শুষ্ক আবহাওয়া"
  },
  "Clear Sky": {
    en: "Clear Sky",
    te: "నిర్మలమైన ఆకాశం",
    hi: "साफ आसमान",
    ta: "தெளிவான வானம்",
    kn: "ಸ್ವಚ್ಛ ಆಕಾಶ",
    mr: "निरभ्र आकाश",
    pa: "ਸਾਫ਼ ਅਸਮਾਨ",
    bn: "পরিষ্কার আকাশ"
  },
  "Mainly Clear": {
    en: "Mainly Clear",
    te: "ఎక్కువగా నిర్మలం",
    hi: "मुख्यतः साफ",
    ta: "பெரும்பாலும் தெளிவானது",
    kn: "ಹೆಚ್ಚಾಗಿ ಸ್ಪಷ್ಟ",
    mr: "मुख्यत्वे निरभ्र",
    pa: "ਮੁੱਖ ਤੌਰ 'ਤੇ ਸਾਫ਼",
    bn: "প্রধানত পরিষ্কার"
  },
  "Overcast": {
    en: "Overcast",
    te: "పూర్తిగా మేఘావృతం",
    hi: "बादल छाए रहेंगे",
    ta: "முழு மேகமூட்டம்",
    kn: "ದಟ್ಟ ಮೋಡಕವಿದ",
    mr: "ढगाळ आकाश",
    pa: "ਪੂਰੀ ਤਰ੍ਹਾਂ ਬੱਦਲਵਾਈ",
    bn: "মেঘলা আকাশ"
  },
  "Fog": {
    en: "Fog",
    te: "పొగమంచు",
    hi: "कोहरा",
    ta: "மூடுபனி",
    kn: "ಮಂಜು",
    mr: "धुके",
    pa: "ਧੁੰਦ",
    bn: "কুয়াশা"
  },
  "Drizzle": {
    en: "Drizzle",
    te: "చిరుజల్లులు",
    hi: "बूंदाबांदी",
    ta: "தூறல்",
    kn: "ತುಂತುರು ಮಳೆ",
    mr: "भुरभुर पाऊस",
    pa: "ਹਲਕੀ ਬੂੰਦਾ-ਬਾਂਦੀ",
    bn: "গুঁড়ি গুঁড়ি বৃষ্টি"
  },
  "Rain": {
    en: "Rain",
    te: "వర్షం",
    hi: "बारिश",
    ta: "மழை",
    kn: "ಮಳೆ",
    mr: "पाऊस",
    pa: "ਮੀਂਹ",
    bn: "বৃষ্টি"
  },
  "Rain Showers": {
    en: "Rain Showers",
    te: "వర్షపు జల్లులు",
    hi: "वर्षा की बौछारें",
    ta: "மழைச்சாரல்",
    kn: "ಮಳೆ ಸುರಿಮಳೆ",
    mr: "पावसाच्या सरी",
    pa: "ਮੀਂਹ ਦੀਆਂ ਫੁਹਾਰਾਂ",
    bn: "বৃষ্টির ধারা"
  },
  "Thunderstorm": {
    en: "Thunderstorm",
    te: "ఉరుములతో కూడిన తుఫాను",
    hi: "गरज के साथ तूफान",
    ta: "இடியுடன் கூடிய மழை",
    kn: "ಗುಡುಗು ಸಹಿತ ಮಳೆ",
    mr: "वादळी पाऊस",
    pa: "ਗਰਜ ਨਾਲ ਤੂਫ਼ਾਨ",
    bn: "বজ্রবিদ্যুৎ সহ ঝড়"
  }
};

export function getLocalizedCondition(condName, lang = 'en') {
  if (!condName) return "";
  const match = WEATHER_CONDITIONS_LOCALIZED[condName];
  if (match && match[lang]) return match[lang];
  return condName;
}

export function getLocalizedWhyItRains(whyItRains, langCode = 'en') {
  if (!whyItRains) return null;
  if (langCode === 'en') {
    return {
      headline: whyItRains.headline,
      atmosphericReason: whyItRains.atmosphericReason,
      topographicFactor: whyItRains.topographicFactor,
      farmerExplanation: whyItRains.farmerExplanation,
      actionRecommendation: whyItRains.actionRecommendation
    };
  }
  if (whyItRains.local && whyItRains.local[langCode]) {
    return whyItRains.local[langCode];
  }
  return {
    headline: whyItRains.headline,
    atmosphericReason: whyItRains.atmosphericReason,
    topographicFactor: whyItRains.topographicFactor,
    farmerExplanation: whyItRains.farmerExplanation,
    actionRecommendation: whyItRains.actionRecommendation
  };
}

