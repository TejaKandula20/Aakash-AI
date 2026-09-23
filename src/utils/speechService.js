// Web Speech API wrapper with Comprehensive Multilingual Vernacular Phonetic Engine

const HINDI_0_TO_100 = [
  "शून्य", "एक", "दो", "तीन", "चार", "पांच", "छह", "सात", "आठ", "नौ", "दस",
  "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस",
  "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताईस", "अट्ठाईस", "उनतीस", "तीस",
  "इकतीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड़तीस", "उनतालीस", "चालीस",
  "इकतालीस", "बयालीस", "तैंतालीस", "चवालीस", "पैंतालीस", "छियालीस", "सैंतालीस", "अड़तालीस", "उनचास", "पचास",
  "इक्यावन", "बावन", "तिरपन", "चौवन", "पचपन", "छप्पन", "सत्तावन", "अट्ठावन", "उनसठ", "साठ",
  "इकसठ", "बासठ", "तिरसठ", "चौंसठ", "पैंसठ", "छियासठ", "सड़सठ", "अड़सठ", "उनहत्तर", "सत्तर",
  "इकहत्तर", "बहत्तर", "तिहत्तर", "चौहत्तर", "पचहत्तर", "छिहत्तर", "सतहत्तर", "अठहत्तर", "उन्यासी", "अस्सी",
  "इक्यासी", "बयासी", "तिरासी", "चौरासी", "पचासी", "छियासी", "सत्तासी", "अट्ठासी", "नवासी", "नब्बे",
  "इक्यानवे", "बानवे", "तिobjectरानवे", "चौरानवे", "पंचानवे", "छियानवे", "सत्तानवे", "अट्ठानवे", "निन्यानवे", "सौ"
];
HINDI_0_TO_100[93] = "तिरानवे";

// Number to Words for Indian Languages
export function numberToWords(num, lang = 'te') {
  num = Math.floor(Math.abs(num));
  if (isNaN(num)) return "";

  if (lang.startsWith('te')) return numberToTelugu(num);
  if (lang.startsWith('hi')) return numberToHindi(num);
  if (lang.startsWith('ta')) return numberToTamil(num);
  if (lang.startsWith('kn')) return numberToKannada(num);
  if (lang.startsWith('mr')) return numberToHindi(num); // Marathi uses Devanagari numbers
  if (lang.startsWith('pa')) return numberToHindi(num);
  if (lang.startsWith('bn')) return numberToBengali(num);
  return numberToEnglish(num);
}

function numberToTelugu(num) {
  const ones = ["సున్నా", "ఒకటి", "రెండు", "మూడు", "నాలుగు", "ఐదు", "ఆరు", "ఏడు", "ఎనిమిది", "తొమ్మిది"];
  const teens = ["పది", "పదకొండు", "పన్నెండు", "పదమూడు", "పద్నాలుగు", "పదిహేను", "పదహారు", "పదిహేడు", "పద్దెనిమిది", "పంతొమ్మిది"];
  const tens = ["", "", "ఇరవై", "ముప్పై", "నలభై", "యాభై", "అరవై", "డెబ్బై", "ఎనభై", "తొంభై"];

  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const rem = num % 10;
    const ten = Math.floor(num / 10);
    return rem === 0 ? tens[ten] : `${tens[ten]} ${ones[rem]}`;
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rem = num % 100;
    const hundredPrefix = hundred === 1 ? "నూరు" : `${ones[hundred]} వందల`;
    if (rem === 0) return hundred === 1 ? "నూరు" : `${ones[hundred]} వందలు`;
    return `${hundredPrefix} ${numberToTelugu(rem)}`;
  }
  if (num < 100000) {
    const thousand = Math.floor(num / 1000);
    const rem = num % 1000;
    const thousandPrefix = `${numberToTelugu(thousand)} వేల`;
    if (rem === 0) return `${numberToTelugu(thousand)} వేలు`;
    return `${thousandPrefix} ${numberToTelugu(rem)}`;
  }
  return num.toString();
}

function numberToHindi(num) {
  if (num <= 100) return HINDI_0_TO_100[num];
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rem = num % 100;
    const hundredWord = `${HINDI_0_TO_100[hundred]} सौ`;
    if (rem === 0) return hundredWord;
    return `${hundredWord} ${HINDI_0_TO_100[rem]}`;
  }
  if (num < 100000) {
    const thousand = Math.floor(num / 1000);
    const rem = num % 1000;
    const thousandWord = `${numberToHindi(thousand)} हज़ार`;
    if (rem === 0) return thousandWord;
    return `${thousandWord} ${numberToHindi(rem)}`;
  }
  return num.toString();
}

function numberToTamil(num) {
  const ones = ["பூஜ்ஜியம்", "ஒன்று", "இரண்டு", "மூன்று", "நான்கு", "ஐந்து", "ஆறு", "ஏழு", "எட்டு", "ஒன்பது"];
  const teens = ["பத்து", "பதினொன்று", "பன்னிரண்டு", "பதிமூன்று", "பதினான்கு", "பதினைந்து", "பதினாறு", "பதினேழு", "பதினெட்டு", "பத்தொன்பது"];
  const tens = ["", "", "இருபது", "முப்பது", "நாற்பது", "ஐம்பது", "அறுபது", "எழுபது", "எண்பது", "தொண்ணூறு"];

  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const rem = num % 10;
    const ten = Math.floor(num / 10);
    return rem === 0 ? tens[ten] : `${tens[ten]} ${ones[rem]}`;
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rem = num % 100;
    const hundredWord = hundred === 1 ? "நூறு" : `${ones[hundred]} நூறு`;
    if (rem === 0) return hundredWord;
    return `${hundredWord} ${numberToTamil(rem)}`;
  }
  return num.toString();
}

function numberToKannada(num) {
  const ones = ["ಸೊನ್ನೆ", "ಒಂದು", "ಎರಡು", "ಮೂರು", "ನಾಲ್ಕು", "ಐದು", "ಆರು", "ಏಳು", "ಎಂಟು", "ಒಂಬತ್ತು"];
  const teens = ["ಹತ್ತು", "ಹನ್ನೊಂದು", "ಹನ್ನೆರಡು", "ಹದಿಮೂರು", "ಹದಿನಾಲ್ಕು", "ಹದಿನೈದು", "ಹದಿನಾರು", "ಹದಿನೇಳು", "ಹದಿನೆಂಟು", "ಹತ್ತೊಂಬತ್ತು"];
  const tens = ["", "", "ಇಪ್ಪತ್ತು", "ಮೂವತ್ತು", "ನಾಲ್ವತ್ತು", "ಐವತ್ತು", "ಅರವತ್ತು", "ಎಪ್ಪತ್ತು", "ಎಂಬತ್ತು", "ತೊಂಬತ್ತು"];

  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const rem = num % 10;
    const ten = Math.floor(num / 10);
    return rem === 0 ? tens[ten] : `${tens[ten]} ${ones[rem]}`;
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rem = num % 100;
    const hundredWord = hundred === 1 ? "ನೂರು" : `${ones[hundred]} ನೂರು`;
    if (rem === 0) return hundredWord;
    return `${hundredWord} ${numberToKannada(rem)}`;
  }
  return num.toString();
}

function numberToBengali(num) {
  const ones = ["শূন্য", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়"];
  const teens = ["দশ", "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ"];
  const tens = ["", "", "কুড়ি", "তিরিশ", "চল্লিশ", "পঞ্চাশ", "ষাট", "সত্তর", "আশি", "নব্বই"];

  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const rem = num % 10;
    const ten = Math.floor(num / 10);
    return rem === 0 ? tens[ten] : `${tens[ten]} ${ones[rem]}`;
  }
  return num.toString();
}

function numberToEnglish(num) {
  const ones = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const rem = num % 10;
    const ten = Math.floor(num / 10);
    return rem === 0 ? tens[ten] : `${tens[ten]} ${ones[rem]}`;
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rem = num % 100;
    if (rem === 0) return `${ones[hundred]} hundred`;
    return `${ones[hundred]} hundred and ${numberToEnglish(rem)}`;
  }
  return num.toString();
}

// Convert all numeric digits and units in text into spoken vernacular words for the selected language
export function convertMultilingualPhonetics(text, lang = 'te') {
  if (!text) return "";
  let result = text;
  const langKey = lang.split('-')[0].toLowerCase();

  // 1. First, insert spaces between numbers and attached units/symbols (e.g. 45mm -> 45 mm, 38.5°C -> 38.5 °C)
  result = result.replace(/(\d+(?:\.\d+)?)\s*(°C|°|mm|km\/h|%|kPa|cm)/gi, (m, p1, p2) => p1 + " " + p2 + " ");

  // 2. Expand weather & agricultural units into spoken vernacular words
  if (langKey === 'te') {
    result = result
      .replace(/°C|°/g, " డిగ్రీల సెల్సియస్ ")
      .replace(/\bmm\b|మిల్లీమీటర్లు|మి\.మీ/gi, " మిల్లీమీటర్లు ")
      .replace(/\bkm\/h\b|కిమీ\/గం|కి\.మీ/gi, " కిలోమీటర్ల వేగం ")
      .replace(/%/g, " శాతం ")
      .replace(/\bAM\b/gi, " ఉదయం ")
      .replace(/\bPM\b/gi, " సాయంత్రం ")
      .replace(/\bhrs?\b|\bhours?\b/gi, " గంటలు ")
      .replace(/\bcm\b/gi, " సెంటీమీటర్లు ")
      .replace(/\bkPa\b/gi, " కిలో పాస్కల్ ")
      .replace(/\bVPD\b/gi, " గాలి ఆవిరి ఒత్తిడి ");
  } else if (langKey === 'hi') {
    result = result
      .replace(/°C|°/g, " डिग्री सेल्सियस ")
      .replace(/\bmm\b|मिमी|मि\.మీ/gi, " मिलीमीटर ")
      .replace(/\bkm\/h\b|किमी\/घंटा/gi, " किलोमीटर प्रति घंटा ")
      .replace(/%/g, " प्रतिशत ")
      .replace(/\bAM\b/gi, " सुबह ")
      .replace(/\bPM\b/gi, " शाम ")
      .replace(/\bhrs?\b|\bhours?\b/gi, " घंटे ")
      .replace(/\bcm\b/gi, " सेंटीमीटर ")
      .replace(/\bkPa\b/gi, " किलो पास्कल ")
      .replace(/\bVPD\b/gi, " वाष्प दबाव ");
  } else if (langKey === 'ta') {
    result = result
      .replace(/°C|°/g, " டிகிரி செல்சியஸ் ")
      .replace(/\bmm\b/gi, " மில்லிமீட்டர் ")
      .replace(/\bkm\/h\b/gi, " கிலோமீட்டர் வேகம் ")
      .replace(/%/g, " சதவீதம் ")
      .replace(/\bAM\b/gi, " காலை ")
      .replace(/\bPM\b/gi, " மாலை ")
      .replace(/\bhrs?\b|\bhours?\b/gi, " மணிநேரம் ")
      .replace(/\bcm\b/gi, " சென்டிமீட்டர் ");
  } else if (langKey === 'kn') {
    result = result
      .replace(/°C|°/g, " ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್ ")
      .replace(/\bmm\b/gi, " ಮಿಲಿಮೀಟರ್ ")
      .replace(/\bkm\/h\b/gi, " ಕಿಲೋಮೀಟರ್ ವೇಗ ")
      .replace(/%/g, " ಪ್ರತಿಶತ ")
      .replace(/\bAM\b/gi, " ಬೆಳಿಗ್ಗೆ ")
      .replace(/\bPM\b/gi, " ಸಂಜೆ ")
      .replace(/\bhrs?\b|\bhours?\b/gi, " ಗಂಟೆಗಳು ")
      .replace(/\bcm\b/gi, " ಸೆಂಟಿಮೀಟರ್ ");
  } else if (langKey === 'mr') {
    result = result
      .replace(/°C|°/g, " अंश सेल्सिअस ")
      .replace(/\bmm\b/gi, " मिलिमीटर ")
      .replace(/\bkm\/h\b/gi, " किलोमीटर प्रति तास ")
      .replace(/%/g, " टक्के ")
      .replace(/\bAM\b/gi, " सकाळी ")
      .replace(/\bPM\b/gi, " संध्याकाळी ");
  } else if (langKey === 'bn') {
    result = result
      .replace(/°C|°/g, " ডিগ্রি সেলসিয়াস ")
      .replace(/\bmm\b/gi, " মিলিমিটার ")
      .replace(/\bkm\/h\b/gi, " কিলোমিটার প্রতি ঘণ্টা ")
      .replace(/%/g, " শতাংশ ");
  } else if (langKey === 'pa') {
    result = result
      .replace(/°C|°/g, " ਡਿਗਰੀ ਸੈਲਸੀਅਸ ")
      .replace(/\bmm\b/gi, " ਮਿਲੀਮੀਟਰ ")
      .replace(/\bkm\/h\b/gi, " ਕਿਲੋਮੀਟਰ ਪ੍ਰਤੀ ਘੰਟਾ ")
      .replace(/%/g, " ਪ੍ਰਤੀਸ਼ਤ ");
  } else {
    // English default
    result = result
      .replace(/°C|°/g, " degrees Celsius ")
      .replace(/\bmm\b/gi, " millimeters ")
      .replace(/\bkm\/h\b/gi, " kilometers per hour ")
      .replace(/%/g, " percent ")
      .replace(/\bhrs?\b/gi, " hours ")
      .replace(/\bcm\b/gi, " centimeters ");
  }

  // 3. Replace decimals (e.g., 38.5 -> ముప్పై ఎనిమిది పాయింట్ ఐదు / अड़तीस दशमलव पांच)
  const pointWord = langKey === 'te' ? "పాయింట్" : langKey === 'hi' ? "दशमलव" : langKey === 'ta' ? "புள்ளி" : langKey === 'kn' ? "ಬಿಂದು" : "point";

  result = result.replace(/(\d+)\.(\d+)/g, (match, whole, dec) => {
    const wholeWords = numberToWords(parseInt(whole, 10), langKey);
    const decDigits = dec.split('').map(d => numberToWords(parseInt(d, 10), langKey)).join(' ');
    return `${wholeWords} ${pointWord} ${decDigits}`;
  });

  // 4. Replace integers (e.g. 450, 38, 24, 14)
  result = result.replace(/\b(\d+)\b/g, (match, num) => {
    const parsed = parseInt(num, 10);
    if (!isNaN(parsed) && parsed <= 99999) {
      return numberToWords(parsed, langKey);
    }
    return match;
  });

  return result.replace(/\s+/g, ' ').trim();
}

function splitTextIntoChunks(text, maxLen = 170) {
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length <= maxLen) return [text];

  const sentences = text.match(/[^.!?।\n]+[.!?।\n]*/g) || [text];
  const chunks = [];
  let current = "";

  for (const s of sentences) {
    if ((current + " " + s).trim().length <= maxLen) {
      current = (current + " " + s).trim();
    } else {
      if (current) chunks.push(current);
      if (s.length > maxLen) {
        const words = s.split(" ");
        let sub = "";
        for (const w of words) {
          if ((sub + " " + w).trim().length <= maxLen) {
            sub = (sub + " " + w).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        current = sub;
      } else {
        current = s.trim();
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(c => c && c.trim().length > 0);
}

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSpeaking = false;
    this.recognition = null;
    this.currentAudio = null;
    this.audioQueue = [];

    if (typeof window !== 'undefined') {
      if (this.synth) {
        this.synth.onvoiceschanged = () => {
          this.voices = this.synth.getVoices();
        };
        this.voices = this.synth.getVoices();
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
  }

  unlock() {
    this.init();
    if (typeof window === 'undefined') return;
    if (this.synth) {
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
      } catch (e) {}
    }
  }

  getBestVoiceForLang(langCode) {
    if (!this.voices || this.voices.length === 0) {
      if (this.synth) this.voices = this.synth.getVoices();
    }

    const targetPrefix = langCode.split('-')[0].toLowerCase();

    // Specific protection for Telugu: NEVER select Hindi voice!
    if (targetPrefix === 'te') {
      let teluguVoice = this.voices.find(v => 
        v.lang.toLowerCase() === 'te-in' || 
        v.lang.toLowerCase().startsWith('te') ||
        v.name.toLowerCase().includes('telugu')
      );
      if (teluguVoice) return teluguVoice;

      let indianEnVoice = this.voices.find(v => 
        (v.lang.toLowerCase() === 'en-in' || v.name.toLowerCase().includes('india')) &&
        !v.lang.toLowerCase().startsWith('hi') &&
        !v.name.toLowerCase().includes('hindi')
      );
      if (indianEnVoice) return indianEnVoice;

      let nonHindiVoice = this.voices.find(v => !v.lang.toLowerCase().startsWith('hi') && !v.name.toLowerCase().includes('hindi'));
      if (nonHindiVoice) return nonHindiVoice;
    }

    // Exact match for requested language
    let match = this.voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (match) return match;

    // Secondary prefix match
    match = this.voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
    if (match) return match;

    // Match by language name in voice name
    const langNames = {
      te: 'telugu',
      hi: 'hindi',
      ta: 'tamil',
      kn: 'kannada',
      mr: 'marathi',
      bn: 'bengali',
      pa: 'punjabi',
      en: 'english'
    };
    if (langNames[targetPrefix]) {
      match = this.voices.find(v => v.name.toLowerCase().includes(langNames[targetPrefix]));
      if (match) return match;
    }

    // Default voice
    return this.voices.find(v => v.default) || this.voices[0] || null;
  }

  speak(text, langCode = 'te-IN', onStart = null, onEnd = null, onError = null) {
    // 1. Cancel any currently playing speech or audio
    this.stop();

    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    const langPrefix = langCode.split('-')[0].toLowerCase();

    // Multilingual phonetic conversion: converts digits, decimals, and units into vernacular words
    const processedText = convertMultilingualPhonetics(text, langCode);

    // Split text into sequential natural chunks for smooth streaming
    const chunks = splitTextIntoChunks(processedText, 170);

    this.isSpeaking = true;
    if (onStart) onStart();

    let currentIndex = 0;
    this.audioQueue = chunks;

    const playNextChunk = () => {
      if (!this.isSpeaking) return; // User stopped speech

      if (currentIndex >= chunks.length) {
        this.isSpeaking = false;
        this.currentAudio = null;
        if (onEnd) onEnd();
        return;
      }

      const chunk = chunks[currentIndex];
      currentIndex++;

      try {
        // High-fidelity native pronunciation via local streaming proxy with direct Google TTS fallback
        const proxyUrl = `/api/tts?q=${encodeURIComponent(chunk)}&tl=${langPrefix}`;
        const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${langPrefix}&client=tw-ob`;
        
        let audio = new Audio(proxyUrl);
        this.currentAudio = audio;

        audio.onended = () => {
          playNextChunk();
        };

        audio.onerror = (err) => {
          console.warn("Proxy audio failed, attempting direct Google TTS:", err);
          const directAudio = new Audio(directUrl);
          this.currentAudio = directAudio;
          directAudio.onended = () => {
            playNextChunk();
          };
          directAudio.onerror = (err2) => {
            console.warn("Direct audio also failed, falling back to Web Speech API:", err2);
            const remainingText = chunks.slice(currentIndex - 1).join(" ");
            this.speakViaSpeechSynthesis(remainingText, langCode, null, onEnd, onError);
          };
          directAudio.play().catch(() => {
            const remainingText = chunks.slice(currentIndex - 1).join(" ");
            this.speakViaSpeechSynthesis(remainingText, langCode, null, onEnd, onError);
          });
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Audio play() interrupted/prevented:", err);
            const directAudio = new Audio(directUrl);
            this.currentAudio = directAudio;
            directAudio.onended = () => playNextChunk();
            directAudio.onerror = () => {
              const remainingText = chunks.slice(currentIndex - 1).join(" ");
              this.speakViaSpeechSynthesis(remainingText, langCode, null, onEnd, onError);
            };
            directAudio.play().catch(() => {
              const remainingText = chunks.slice(currentIndex - 1).join(" ");
              this.speakViaSpeechSynthesis(remainingText, langCode, null, onEnd, onError);
            });
          });
        }
      } catch (err) {
        console.warn("Exception in audio playback, falling back:", err);
        this.speakViaSpeechSynthesis(processedText, langCode, null, onEnd, onError);
      }
    };

    playNextChunk();
  }

  speakViaSpeechSynthesis(processedText, langCode, onStart, onEnd, onError) {
    if (!this.synth) {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.lang = langCode;
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const voice = this.getBestVoiceForLang(langCode);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        console.warn("Speech synthesis error:", e);
        if (onError) onError(e);
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch (err) {
      this.isSpeaking = false;
      if (onError) onError(err);
      if (onEnd) onEnd();
    }
  }

  stop() {
    this.isSpeaking = false;
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    this.audioQueue = [];

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }

  listen(langCode = 'te-IN', onResult, onError, onEnd) {
    if (!this.recognition) {
      if (onError) onError(new Error("Speech recognition not supported in this browser."));
      return;
    }

    try {
      this.recognition.lang = langCode;

      this.recognition.onresult = (event) => {
        if (event.results && event.results.length > 0 && event.results[0].length > 0) {
          const transcript = event.results[0][0].transcript;
          if (onResult) onResult(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (onError) onError(event);
      };

      this.recognition.onend = () => {
        if (onEnd) onEnd();
      };

      this.recognition.start();
    } catch (e) {
      console.warn("Recognition start failed or already active:", e);
      if (onError) onError(e);
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }
}

export const speechService = new SpeechService();
