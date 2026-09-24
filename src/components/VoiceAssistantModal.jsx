import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Send, Radio } from 'lucide-react';
import { speechService } from '../utils/speechService';
import { LANGUAGES } from '../data/translations';
import { getLocalizedWhyItRains } from '../data/weatherData';

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  currentLang,
  onLanguageChange,
  selectedPanchayat,
  weatherData,
  t
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const langObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  // Quick farmer query presets across all 8 supported languages
  const sampleQueries = {
    te: [
      "ఈరోజు మా పంచాయతీలో వర్షం పడుతుందా?",
      "ఇక్కడ వర్షం ఎందుకు పడుతోంది?",
      "రేపు ప్రత్తి చేనుకి మందు కొట్టవచ్చా?",
      "వరి చేనులో నీరు నిలిస్తే ఏం చేయాలి?",
      "వచ్చే వారం, నెల రోజుల వాతావరణం ఎలా ఉంది?"
    ],
    hi: [
      "क्या आज हमारी पंचायत में बारिश होगी?",
      "यहाँ बारिश क्यों हो रही है?",
      "क्या कल कपास की फसल पर छिड़काव कर सकते हैं?",
      "खेत में पानी भरने पर क्या उपाय करें?",
      "आने वाले 1 सप्ताह और 1 महीने का मौसम कैसा रहेगा?"
    ],
    ta: [
      "இன்று எங்கள் பஞ்சாயத்தில் மழை பெய்யுமா?",
      "இங்கு ஏன் மழை பெய்கிறது?",
      "நாளை பருத்தி பயிருக்கு மருந்து தெளிக்கலாமா?",
      "வயலில் தண்ணீர் தேங்கினால் என்ன செய்வது?",
      "அடுத்த ஒரு வாரம் மற்றும் ஒரு மாத வானிலை எப்படி இருக்கும்?"
    ],
    kn: [
      "ಇಂದು ನಮ್ಮ ಪಂಚಾಯಿತಿಯಲ್ಲಿ ಮಳೆ ಬರುತ್ತದೆಯೇ?",
      "ಇಲ್ಲಿ ಮಳೆ ಏಕೆ ಬೀಳುತ್ತಿದೆ?",
      "ನಾಳೆ ಹತ್ತಿ ಬೆಳೆಗೆ ಔಷಧ ಸಿಂಪಡಿಸಬಹುದೇ?",
      "ಹೊಲದಲ್ಲಿ ನೀರು ನಿಂತರೆ ಏನು ಮಾಡಬೇಕು?",
      "ಮುಂದಿನ 1 ವಾರ ಮತ್ತು 1 ತಿಂಗಳ ಹವಾಮಾನ ಹೇಗಿದೆ?"
    ],
    mr: [
      "आज आमच्या पंचायतमध्ये पाऊस पडेल का?",
      "येथे पाऊस का पडत आहे?",
      "उद्या कापूस पिकावर फवारणी करू शकतो का?",
      "शेतात पाणी साचल्यास काय करावे?",
      "पुढील १ आठवडा व १ महिन्याचा हवामान अंदाज काय आहे?"
    ],
    pa: [
      "ਕੀ ਅੱਜ ਸਾਡੀ ਪੰਚਾਇਤ ਵਿੱਚ ਮੀਂਹ ਪਵੇਗਾ?",
      "ਇੱਥੇ ਮੀਂਹ ਕਿਉਂ ਪੈ ਰਿਹਾ ਹੈ?",
      "ਕੀ ਕੱਲ੍ਹ ਨਰਮੇ ਦੀ ਫ਼ਸਲ 'ਤੇ ਸਪਰੇਅ ਕਰ ਸਕਦੇ ਹਾਂ?",
      "ਖੇਤ ਵਿੱਚ ਪਾਣੀ ਭਰ ਜਾਣ 'ਤੇ ਕੀ ਕਰੀਏ?",
      "ਅਗਲੇ 1 ਹਫ਼ਤੇ ਅਤੇ 1 ਮਹੀਨੇ ਦਾ ਮੌਸਮ ਕਿਹੋ ਜਿਹਾ ਰਹੇਗਾ?"
    ],
    bn: [
      "আজ কি আমাদের পঞ্চায়েতে বৃষ্টি হবে?",
      "এখানে কেন বৃষ্টি হচ্ছে?",
      "কাল কি তুলো ফসলে ওষুধ স্প্রে করা যাবে?",
      "জমিতে জল জমে গেলে কী করব?",
      "আগামী ১ সপ্তাহ এবং ১ মাসের আবহাওয়া কেমন থাকবে?"
    ],
    en: [
      "Will it rain in our panchayat today?",
      "Why is it raining here?",
      "Can I spray pesticide on cotton tomorrow?",
      "What to do for field waterlogging?",
      "How is next 1 week and 1 month weather outlook?"
    ]
  };

  const currentQueries = sampleQueries[currentLang] || sampleQueries.en;
  const lastGreetedLangRef = useRef('');

  // On open or language switch, greet the farmer proactively in their selected vernacular language
  useEffect(() => {
    if (isOpen) {
      if (lastGreetedLangRef.current !== currentLang) {
        lastGreetedLangRef.current = currentLang;
        const greeting = t.voiceGreeting;
        setChatHistory([
          {
            sender: 'ai',
            text: greeting,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        // Speak out greeting in farmer's selected language
        speechService.speak(
          greeting,
          langObj.speechLang,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } else {
      lastGreetedLangRef.current = '';
      speechService.stop();
      speechService.stopListening();
      setIsSpeaking(false);
      setIsListening(false);
    }

    return () => {
      speechService.stop();
      speechService.stopListening();
    };
  }, [isOpen, currentLang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSpeaking]);

  if (!isOpen) return null;

  // Generate intelligent answers based on hyper-local downscaled panchayat data
  const handleQuery = (queryText) => {
    if (!queryText.trim()) return;

    const userMsg = {
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputText('');

    // Answer generation logic across 8 Indian languages
    let answerText = "";
    const lower = queryText.toLowerCase();
    const pName = selectedPanchayat.localName || selectedPanchayat.name;
    const elev = selectedPanchayat.elevationMeters || 100;
    const rainMm = weatherData.current.rainMm;
    const prob = weatherData.current.rainProb;
    const temp = weatherData.current.temp;
    const humidity = weatherData.current.humidity;
    const wind = weatherData.current.windSpeed;
    const soilMoist = weatherData.current.soilMoisture;
    const weekRain = weatherData.oneWeekForecast ? weatherData.oneWeekForecast.reduce((acc, d) => acc + d.expectedRainMm, 0).toFixed(1) : "12.0";
    const monthRain = weatherData.oneMonthOutlook ? weatherData.oneMonthOutlook.monthlySummary.totalExpectedRainMm : "65.0";
    const rainyDays = weatherData.oneMonthOutlook ? weatherData.oneMonthOutlook.monthlySummary.rainyDaysCount : "7";

    const localWhy = getLocalizedWhyItRains(weatherData.whyItRains, currentLang) || weatherData.whyItRains;

    const isWhyQuery = lower.includes("why") || lower.includes("ఎందుకు") || lower.includes("क्यों") || lower.includes("ஏன்") || lower.includes("ಏಕೆ") || lower.includes("का") || lower.includes("ਕਿਉਂ") || lower.includes("কেন");
    const isRainQuery = lower.includes("rain") || lower.includes("వర్షం") || lower.includes("बारिश") || lower.includes("மழை") || lower.includes("ಮಳೆ") || lower.includes("पाऊस") || lower.includes("ਮੀਂਹ") || lower.includes("বৃষ্টি");
    const isSprayQuery = lower.includes("spray") || lower.includes("పిచికారీ") || lower.includes("छिड़काव") || lower.includes("మందు") || lower.includes("தெளி") || lower.includes("ಸಿಂಪಡ") || lower.includes("फवारणी") || lower.includes("ਸਪਰੇਅ") || lower.includes("স্প্রে");
    const isWaterlogQuery = lower.includes("waterlog") || lower.includes("ముంపు") || lower.includes("जलभराव") || lower.includes("నీరు నిలి") || lower.includes("தண்ணீர் தேங்க") || lower.includes("ನೀರು ನಿಂತರೆ") || lower.includes("पाणी साच") || lower.includes("ਪਾਣੀ ਭਰ") || lower.includes("জল জমে");
    const isLongTermQuery = lower.includes("week") || lower.includes("month") || lower.includes("వారం") || lower.includes("నెల") || lower.includes("हफ्ता") || lower.includes("महीना") || lower.includes("வாரம்") || lower.includes("மாத") || lower.includes("ವಾರ") || lower.includes("ತಿಂಗಳ") || lower.includes("आठवडा") || lower.includes("हਫ਼ਤੇ") || lower.includes("সপ্তাহ") || lower.includes("মাস");

    if (isRainQuery) {
      if (isWhyQuery) {
        // Explain why it rains based on local elevation & atmospheric convergence
        if (currentLang === 'te') {
          answerText = `${pName} లో ${localWhy.farmerExplanation} మీ పంచాయతీ సముద్ర మట్టానికి ${elev} మీటర్ల ఎత్తులో ఉండటం వల్ల మబ్బులు త్వరగా దట్టంగా మారి స్థానికంగా వర్షం కురుస్తుంది. సలహా: ${localWhy.actionRecommendation}`;
        } else if (currentLang === 'hi') {
          answerText = `${selectedPanchayat.name} में ${localWhy.farmerExplanation} यह पंचायत ${elev} मीटर ऊंचाई पर स्थित है, जिससे स्थानीय बादल तेजी से घने होते हैं। सलाह: ${localWhy.actionRecommendation}`;
        } else if (currentLang === 'ta') {
          answerText = `${selectedPanchayat.name} பகுதியில் ${localWhy.farmerExplanation} உங்கள் கிராமம் ${elev} மீ உயரத்தில் உள்ளதால் மேகங்கள் விரைவாகக் கூடுகின்றன. ஆலோசனை: ${localWhy.actionRecommendation}`;
        } else if (currentLang === 'kn') {
          answerText = `${selectedPanchayat.name} ನಲ್ಲಿ ${localWhy.farmerExplanation} ನಿಮ್ಮ ಗ್ರಾಮವು ${elev} ಮೀಟರ್ ಎತ್ತರದಲ್ಲಿರುವುದರಿಂದ ಮೋಡಗಳು ವೇಗವಾಗಿ ದಟ್ಟವಾಗುತ್ತವೆ. ಸಲಹೆ: ${localWhy.actionRecommendation}`;
        } else if (currentLang === 'mr') {
          answerText = `${selectedPanchayat.name} मध्ये ${localWhy.farmerExplanation} हे गाव ${elev} मीटर उंचीवर असल्याने ढग वेगाने दाट होतात. सल्ला: ${localWhy.actionRecommendation}`;
        } else if (currentLang === 'pa') {
          answerText = `${selectedPanchayat.name} ਵਿੱਚ ${localWhy.farmerExplanation} ਤੁਹਾਡਾ ਪਿੰਡ ${elev} ਮੀਟਰ ਦੀ ਉਚਾਈ 'ਤੇ ਹੋਣ ਕਰਕੇ ਬੱਦਲ ਤੇਜ਼ੀ ਨਾਲ ਸੰਘਣੇ ਹੁੰਦੇ ਹਨ। ਸਲਾਹ: ${localWhy.actionRecommendation}`;
        } else if (currentLang === 'bn') {
          answerText = `${selectedPanchayat.name} এ ${localWhy.farmerExplanation} আপনার পঞ্চায়েত ${elev} মিটার উচ্চতায় অবস্থিত হওয়ায় মেঘ দ্রুত ঘনীভূত হয়। পরামর্শ: ${localWhy.actionRecommendation}`;
        } else {
          answerText = `In ${selectedPanchayat.name}: ${localWhy.farmerExplanation} Due to ${elev}m elevation, moisture condenses rapidly. Advice: ${localWhy.actionRecommendation}`;
        }
      } else {
        // Will it rain today
        if (currentLang === 'te') {
          answerText = `ఈరోజు ${pName} లో ${prob}% వర్ష సూచన ఉంది. సుమారు ${rainMm} mm వర్షపాతం పడవచ్చు. ప్రస్తుత ఉష్ణోగ్రత ${temp}°C.`;
        } else if (currentLang === 'hi') {
          answerText = `आज ${selectedPanchayat.name} में ${prob}% बारिश की संभावना है। लगभग ${rainMm} mm बारिश हो सकती है। वर्तमान तापमान ${temp}°C है।`;
        } else if (currentLang === 'ta') {
          answerText = `இன்று ${selectedPanchayat.name} பகுதியில் ${prob}% மழை வாய்ப்புள்ளது. சுமார் ${rainMm} mm மழை பெய்யக்கூடும். தற்போதைய வெப்பநிலை ${temp}°C.`;
        } else if (currentLang === 'kn') {
          answerText = `ಇಂದು ${selectedPanchayat.name} ನಲ್ಲಿ ${prob}% ಮಳೆಯಾಗುವ ಸಂಭವವಿದೆ. ಸುಮಾರು ${rainMm} mm ಮಳೆಯಾಗಬಹುದು. ಪ್ರಸ್ತುತ ತಾಪಮಾನ ${temp}°C.`;
        } else if (currentLang === 'mr') {
          answerText = `आज ${selectedPanchayat.name} मध्ये ${prob}% पावसाची शक्यता आहे. सुमारे ${rainMm} mm पाऊस पडू शकतो. सध्याचे तापमान ${temp}°C आहे.`;
        } else if (currentLang === 'pa') {
          answerText = `ਅੱਜ ${selectedPanchayat.name} ਵਿੱਚ ${prob}% ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਲਗਭਗ ${rainMm} mm ਮੀਂਹ ਪੈ ਸਕਦਾ ਹੈ। ਮੌਜੂਦਾ ਤਾਪਮਾਨ ${temp}°C ਹੈ।`;
        } else if (currentLang === 'bn') {
          answerText = `আজ ${selectedPanchayat.name} এ ${prob}% বৃষ্টির সম্ভাবনা রয়েছে। প্রায় ${rainMm} mm বৃষ্টি হতে পারে। বর্তমান তাপমাত্রা ${temp}°C.`;
        } else {
          answerText = `Today in ${selectedPanchayat.name}, there is a ${prob}% chance of rain with approximately ${rainMm} mm precipitation expected. Temperature is ${temp}°C.`;
        }
      }
    } else if (isSprayQuery) {
      const isSafe = prob < 40 && wind < 18;
      if (currentLang === 'te') {
        answerText = isSafe 
          ? `రేపు ఉదయం 6:30 నుండి 9:30 వరకు గాలి వేగం ${wind} km/h మాత్రమే ఉన్నందున మందు పిచికారీకి అత్యంత అనుకూలం.`
          : `రేపు వర్షం పడే అవకాశం ${prob}% ఉన్నందున మందు పిచికారీని వాయిదా వేయండి. వర్షానికి మందు కొట్టుకుపోతుంది.`;
      } else if (currentLang === 'hi') {
        answerText = isSafe
          ? `कल सुबह 6:30 से 9:30 बजे तक कीटनाशक छिड़काव के लिए बहुत अच्छा समय है। हवा की गति केवल ${wind} km/h रहेगी।`
          : `कल ${prob}% बारिश का अनुमान है, इसलिए छिड़काव न करें। बारिश से दवा धुल जाएगी।`;
      } else if (currentLang === 'ta') {
        answerText = isSafe
          ? `நாளை காலை 6:30 முதல் 9:30 வரை காற்றின் வேகம் ${wind} km/h மட்டுமே உள்ளதால் மருந்து தெளிக்க உகந்தது.`
          : `நாளை ${prob}% மழை வாய்ப்புள்ளதால் தெளிப்புப் பணியை ஒத்திவைக்கவும்.`;
      } else if (currentLang === 'kn') {
        answerText = isSafe
          ? `ನಾಳೆ ಬೆಳಿಗ್ಗೆ 6:30 ರಿಂದ 9:30 ರವರೆಗೆ ಗಾಳಿಯ ವೇಗ ${wind} km/h ಮಾತ್ರ ಇರುವುದರಿಂದ ಔಷಧಿ ಸಿಂಪಡಣೆಗೆ ಉತ್ತಮ ಸಮಯ.`
          : `ನಾಳೆ ${prob}% ಮಳೆಯ ಸಂಭವವಿರುವುದರಿಂದ ಸಿಂಪಡಣೆ ಮಾಡಬೇಡಿ.`;
      } else if (currentLang === 'mr') {
        answerText = isSafe
          ? `उद्या सकाळी ६:३० ते ९:३० पर्यंत वाऱ्याचा वेग फक्त ${wind} km/h असल्याने फवारणीसाठी उत्तम वेळ आहे.`
          : `उद्या ${prob}% पावसाची शक्यता असल्याने फवारणी पुढे ढकला.`;
      } else if (currentLang === 'pa') {
        answerText = isSafe
          ? `ਕੱਲ੍ਹ ਸਵੇਰੇ 6:30 ਤੋਂ 9:30 ਵਜੇ ਤੱਕ ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ ਕੇਵਲ ${wind} km/h ਹੋਣ ਕਰਕੇ ਸਪਰੇਅ ਲਈ ਢੁਕਵਾਂ ਸਮਾਂ ਹੈ।`
          : `ਕੱਲ੍ਹ ${prob}% ਮੀਂਹ ਦਾ ਖ਼ਤਰਾ ਹੈ, ਇਸ ਲਈ ਸਪਰੇਅ ਨਾ ਕਰੋ।`;
      } else if (currentLang === 'bn') {
        answerText = isSafe
          ? `কাল সকাল ৬:৩০ থেকে ৯:৩০ পর্যন্ত বাতাসের গতি মাত্র ${wind} km/h থাকায় কীটনাশক স্প্রে করার উপযুক্ত সময়।`
          : `কাল ${prob}% বৃষ্টির সম্ভাবনা রয়েছে, তাই স্প্রে বন্ধ রাখুন।`;
      } else {
        answerText = isSafe
          ? `Tomorrow morning between 6:30 AM to 9:30 AM is an optimal spraying window with calm wind speeds of ${wind} km/h.`
          : `Spraying is NOT recommended tomorrow as there is a ${prob}% rain probability which will wash off chemicals.`;
      }
    } else if (isWaterlogQuery) {
      if (currentLang === 'te') {
        answerText = `ముంపు నివారణకు వెంటనే మీ పొలం గట్లు తెంపి నీటిని బయటకు వదలండి. నేలలో తేమ ${soilMoist}% గా ఉంది. పంట వేళ్లు కుళ్లిపోకుండా యూరియా వేయడం వెంటనే ఆపండి.`;
      } else if (currentLang === 'hi') {
        answerText = `जलभराव से बचाव के लिए तुरंत खेत की मेड़ों को काटकर पानी की निकासी करें। मिट्टी में नमी ${soilMoist}% है। जड़ों को गलने से बचाने के लिए यूरिया का छिड़काव तुरंत रोकें।`;
      } else if (currentLang === 'ta') {
        answerText = `வயலில் தேங்கிய நீரை வெளியேற்ற வரப்புகளைத் திறந்து விடுங்கள். மண்ணின் ஈரப்பதம் ${soilMoist}% ஆக உள்ளது. வேர் அழுகலைத் தடுக்க யூரியா இடுவதை நிறுத்தவும்.`;
      } else if (currentLang === 'kn') {
        answerText = `ನೀರು ನಿಲ್ಲುವುದನ್ನು ತಡೆಯಲು ತಕ್ಷಣ ಬದುಗಳನ್ನು ತೆರೆದು ನೀರು ಹರಿದುಹೋಗಲು ಬಿಡಿ. ಮಣ್ಣಿನ ತೇವಾಂಶ ${soilMoist}% ಇದೆ. ಬೇರು ಕೊಳೆಯುವುದನ್ನು ತಪ್ಪಿಸಲು ಯೂರಿಯಾ ನಿಲ್ಲಿಸಿ.`;
      } else if (currentLang === 'mr') {
        answerText = `पाण्याचा निचरा करण्यासाठी त्वरित बांध फोडून पाणी बाहेर काढा. जमिनीतील ओलावा ${soilMoist}% आहे. मुळे सडण्यापासून वाचवण्यासाठी युरिया देणे थांबवा.`;
      } else if (currentLang === 'pa') {
        answerText = `ਖੇਤ ਵਿੱਚੋਂ ਪਾਣੀ ਕੱਢਣ ਲਈ ਤੁਰੰਤ ਵੱਟਾਂ ਕੱਟੋ। ਮਿੱਟੀ ਵਿੱਚ ਨਮੀ ${soilMoist}% ਹੈ। ਜੜ੍ਹਾਂ ਗਲਣ ਤੋਂ ਬਚਾਉਣ ਲਈ ਯੂਰੀਆ ਪਾਉਣਾ ਬੰਦ ਕਰੋ।`;
      } else if (currentLang === 'bn') {
        answerText = `জল নিষ্কাশনের জন্য অবিলম্বে আইল কেটে জল বার করে দিন। মাটিতে আর্দ্রতা ${soilMoist}%। শিকড় পচা রোধ করতে ইউরিয়া প্রয়োগ বন্ধ রাখুন।`;
      } else {
        answerText = `To mitigate waterlogging, immediately open drainage cuts along field bunds. Soil saturation is at ${soilMoist}%. Suspend nitrogen fertilizer to prevent root damage.`;
      }
    } else if (isLongTermQuery) {
      if (currentLang === 'te') {
        answerText = `రాగల 7 రోజుల్లో మొత్తం ${weekRain} mm వర్షం కురిసే అవకాశం ఉంది. రాబోయే 1 నెలలో మొత్తం ${monthRain} mm వర్షపాతం మరియు ${rainyDays} వర్షపు రోజులు నమోదవుతాయి.`;
      } else if (currentLang === 'hi') {
        answerText = `अगले 7 दिनों में कुल ${weekRain} mm बारिश का अनुमान है। पूरे महीने में ${monthRain} mm वर्षा और ${rainyDays} वर्षा दिवस रहने की संभावना है।`;
      } else if (currentLang === 'ta') {
        answerText = `அடுத்த 7 நாட்களில் மொத்தம் ${weekRain} mm மழை பெய்ய வாய்ப்புள்ளது. அடுத்த 1 மாதத்தில் ${monthRain} mm மழை மற்றும் ${rainyDays} மழை நாட்கள் எதிர்பார்க்கப்படுகிறது.`;
      } else if (currentLang === 'kn') {
        answerText = `ಮುಂದಿನ 7 ದಿನಗಳಲ್ಲಿ ಒಟ್ಟು ${weekRain} mm ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ. ಮುಂದಿನ 1 ತಿಂಗಳಲ್ಲಿ ${monthRain} mm ಮಳೆ ಮತ್ತು ${rainyDays} ಮಳೆ ದಿನಗಳು ದಾಖಲಾಗಲಿವೆ.`;
      } else if (currentLang === 'mr') {
        answerText = `पुढील ७ दिवसांत एकूण ${weekRain} mm पाऊस पडण्याचा अंदाज आहे. पुढील एका महिन्यात ${monthRain} mm पाऊस व ${rainyDays} पावसाचे दिवस अपेक्षित आहेत.`;
      } else if (currentLang === 'pa') {
        answerText = `ਅਗਲੇ 7 ਦਿਨਾਂ ਵਿੱਚ ਕੁੱਲ ${weekRain} mm ਮੀਂਹ ਪੈਣ ਦਾ ਅਨੁਮਾਨ ਹੈ। ਅਗਲੇ 1 ਮਹੀਨੇ ਵਿੱਚ ${monthRain} mm ਵਰਖਾ ਅਤੇ ${rainyDays} ਬਰਸਾਤੀ ਦਿਨ ਹੋਣਗੇ।`;
      } else if (currentLang === 'bn') {
        answerText = `আগামী ৭ দিনে মোট ${weekRain} mm বৃষ্টিপাতের সম্ভাবনা রয়েছে। পরবর্তী ১ মাসে মোট ${monthRain} mm বৃষ্টি এবং ${rainyDays} টি বৃষ্টিবহুল দিন থাকবে।`;
      } else {
        answerText = `Over the next 7 days, cumulative rainfall of ${weekRain} mm is projected. The 1-month seasonal outlook expects ${monthRain} mm total precipitation across ${rainyDays} rainy days.`;
      }
    } else {
      // General agricultural snapshot
      if (currentLang === 'te') {
        answerText = `${pName} కోసం ఆకాశ్ AI నివేదిక: ప్రస్తుత ఉష్ణోగ్రత ${temp}°C, గాలిలో తేమ ${humidity}%, వర్ష సూచన ${prob}%. మీరు మీ ప్రస్తుత పంట లేదా కొత్త పంట సాగు గురించి ఏదైనా అడగవచ్చు.`;
      } else if (currentLang === 'hi') {
        answerText = `${selectedPanchayat.name} के लिए आकाश AI रिपोर्ट: वर्तमान तापमान ${temp}°C, आर्द्रता ${humidity}%, और बारिश की संभावना ${prob}% है। आप अपनी खड़ी फसल या नई बुवाई के बारे में कुछ भी पूछ सकते हैं।`;
      } else if (currentLang === 'ta') {
        answerText = `${selectedPanchayat.name} பஞ்சாயத்து ஆகாஷ் AI அறிக்கை: வெப்பநிலை ${temp}°C, ஈரப்பதம் ${humidity}%, மழை வாய்ப்பு ${prob}%. உங்கள் பயிர் பராமரிப்பு பற்றி கேட்கலாம்.`;
      } else if (currentLang === 'kn') {
        answerText = `${selectedPanchayat.name} ಆಕಾಶ್ AI ವರದಿ: ತಾಪಮಾನ ${temp}°C, ತೇವಾಂಶ ${humidity}%, ಮಳೆ ಸಂಭವ ${prob}%. ನಿಮ್ಮ ಬೆಳೆ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು.`;
      } else if (currentLang === 'mr') {
        answerText = `${selectedPanchayat.name} साठी आकाश AI अहवाल: तापमान ${temp}°C, आर्द्रता ${humidity}%, पावसाची शक्यता ${prob}%. आपण पिकांविषयी प्रश्न विचारू शकता.`;
      } else if (currentLang === 'pa') {
        answerText = `${selectedPanchayat.name} ਲਈ ਆਕਾਸ਼ AI ਰਿਪੋਰਟ: ਤਾਪਮਾਨ ${temp}°C, ਨਮੀ ${humidity}%, ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ${prob}%. ਫ਼ਸਲ ਬਾਰੇ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ।`;
      } else if (currentLang === 'bn') {
        answerText = `${selectedPanchayat.name} এর আকাশ AI রিপোর্ট: তাপমাত্রা ${temp}°C, আর্দ্রতা ${humidity}%, বৃষ্টির সম্ভাবনা ${prob}%. যেকোনো ফসলের তথ্য জানতে পারেন।`;
      } else {
        answerText = `Aakash AI report for ${selectedPanchayat.name}: Current temperature is ${temp}°C, relative humidity is ${humidity}%, and rain risk is ${prob}%. Please ask about standing crop care or new cultivation planning.`;
      }
    }

    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: answerText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      // Speak response with full vernacular phonetic conversion
      speechService.speak(
        answerText,
        langObj.speechLang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }, 350);
  };

  const startVoiceInput = () => {
    // 1. Immediately terminate any active speech before listening to avoid feedback loop
    speechService.stop();
    setIsSpeaking(false);
    setIsListening(true);

    speechService.listen(
      langObj.speechLang,
      (transcript) => {
        setIsListening(false);
        if (transcript && transcript.trim()) {
          handleQuery(transcript);
        }
      },
      (err) => {
        setIsListening(false);
        console.warn("Speech recognition notice:", err?.error || err);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col h-[620px] max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">
                  {t.appTitle} - {currentLang === 'te' ? 'ఆకాశ్ వాణి వాయిస్ అసిస్టెంట్' : 'Aakash Vani Voice Assistant'}
                </h3>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {langObj.nativeName || langObj.name}
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                {currentLang === 'te' 
                  ? `${selectedPanchayat.localName || selectedPanchayat.name} (${selectedPanchayat.elevationMeters} మీ) కోసం మీ మాతృభాషలో మాట్లాడుతుంది`
                  : `Speaks in your mother tongue for ${selectedPanchayat.name} (${selectedPanchayat.elevationMeters}m)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                onClick={toggleSpeech}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white"
                title={currentLang === 'te' ? 'ఆడియో ఆపండి' : 'Stop Audio'}
              >
                <VolumeX className="w-5 h-5 text-amber-300 animate-pulse" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Language Switcher Inside Modal for Easy Testing */}
        <div className="bg-emerald-950 text-white px-3 sm:px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-emerald-900">
          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider shrink-0 mr-1">
            {{
              te: 'వాయిస్ భాష:',
              hi: 'आवाज भाषा:',
              ta: 'குரல் மொழி:',
              kn: 'ಧ್ವನಿ ಭಾಷೆ:',
              mr: 'व्हॉइस भाषा:',
              pa: 'ਵਾਇਸ ਭਾਸ਼ਾ:',
              bn: 'ভয়েস ভাষা:',
              en: 'Voice Lang:'
            }[currentLang] || 'Voice Lang:'}
          </span>
          {LANGUAGES.map((l) => {
            const isSelected = currentLang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => {
                  speechService.stop();
                  if (onLanguageChange) onLanguageChange(l.code);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('aakash_preferred_lang', l.code);
                  }
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-emerald-400 text-slate-950 shadow-md ring-2 ring-emerald-300'
                    : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-800'
                }`}
              >
                {l.nativeName}
              </button>
            );
          })}
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="leading-relaxed flex-1">{msg.text}</p>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => {
                        speechService.stop();
                        speechService.speak(
                          msg.text,
                          langObj.speechLang,
                          () => setIsSpeaking(true),
                          () => setIsSpeaking(false)
                        );
                      }}
                      className="p-1 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 transition-colors shrink-0"
                      title={currentLang === 'te' ? 'ఈ సందేశం వినండి' : 'Listen to this message'}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span
                  className={`text-[9px] mt-1 block text-right font-medium ${
                    msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {/* Pulsing Audio Waveform Indicator when Assistant is Speaking */}
          {isSpeaking && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-100/80 px-3 py-2 rounded-2xl w-fit border border-emerald-300">
              <Volume2 className="w-4 h-4 animate-bounce text-emerald-700" />
              <span className="font-semibold">
                {currentLang === 'te' 
                  ? 'ఆకాశ్ వాణి స్వచ్ఛమైన తెలుగులో మాట్లాడుతోంది...' 
                  : `Aakash Vani is speaking in ${langObj.name}...`}
              </span>
              <div className="flex items-center gap-0.5 ml-2">
                <span className="w-1 h-3 bg-emerald-600 animate-pulse"></span>
                <span className="w-1 h-5 bg-emerald-700 animate-pulse delay-75"></span>
                <span className="w-1 h-2 bg-emerald-500 animate-pulse delay-150"></span>
                <span className="w-1 h-4 bg-emerald-800 animate-pulse delay-100"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Farmer Query Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto scrollbar-none flex gap-2">
          {currentQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQuery(q)}
              className="shrink-0 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            >
              💬 {q}
            </button>
          ))}
        </div>

        {/* Input Bar with Mic & Send */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          {/* Mic Button */}
          <button
            onClick={isListening ? () => speechService.stopListening() : startVoiceInput}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25'
            }`}
            title="Speak your question"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery(inputText)}
            placeholder={isListening ? t.micListening : t.askVoicePrompt}
            className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* Send Button */}
          <button
            onClick={() => handleQuery(inputText)}
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-slate-900 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
