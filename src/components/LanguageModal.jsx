import React from 'react';
import { Globe, Check, X, Sparkles, Volume2 } from 'lucide-react';
import { LANGUAGES, TRANSLATIONS } from '../data/translations';
import { speechService } from '../utils/speechService';

export default function LanguageModal({
  isOpen,
  onClose,
  currentLang = 'en',
  onSelectLanguage,
  onSelectLang,
  onLanguageChange
}) {
  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const handleLanguageClick = (lang) => {
    const callback = onSelectLanguage || onSelectLang || onLanguageChange;
    if (callback) {
      callback(lang.code);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('aakash_preferred_lang', lang.code);
    }
    
    // Quick confirmation voice feedback
    const sampleConfirmations = {
      en: "English selected. Welcome to Aakash AI.",
      te: "తెలుగు ఎంచుకోబడింది. ఆకాశ్ AI కి స్వాగతం.",
      hi: "हिंदी चुनी गई। आकाश AI में आपका स्वागत है।",
      ta: "தமிழ் தேர்ந்தெடுக்கப்பட்டது. ஆகாஷ் AI-க்கு நல்வரவு.",
      mr: "मराठी निवडली. आकाश AI मध्ये आपले स्वागत आहे.",
      kn: "ಕನ್ನಡ ಆಯ್ಕೆಯಾಗಿದೆ. ಆಕಾಶ್ AI ಗೆ ಸುಸ್ವಾಗತ.",
      pa: "ਪੰਜਾਬੀ ਚੁਣੀ ਗਈ। ਆਕਾਸ਼ AI ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ।",
      bn: "বাংলা নির্বাচন করা হয়েছে। আকাশ AI তে স্বাগতম।"
    };

    const confirmText = sampleConfirmations[lang.code] || sampleConfirmations.en;
    speechService.speak(confirmText, lang.speechLang);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-scale-up">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-800 text-white p-5 sm:p-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Globe className="w-6 h-6 text-emerald-200 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">
                  {t.chooseDisplayLang || 'Select Display Language'}
                </h3>
                <span className="text-[11px] bg-white/20 text-emerald-100 px-2 py-0.5 rounded-full font-medium">
                  {t.eightLanguages || '8 Languages'}
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-1">
                మీ భాషను ఎంచుకోండి • अपनी भाषा चुनें • Choose language for Weather & Voice
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 bg-slate-50 space-y-4">
          <p className="text-xs text-slate-600 font-medium">
            {t.selectLanguageModalDesc || 'Please choose your preferred language. All forecasts, voice advisories, automated call alerts, and SMS will be provided in this language:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageClick(lang)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400'
                      : 'bg-white hover:bg-emerald-50/60 text-slate-800 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                    }`}>
                      {lang.code.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base leading-tight">
                          {lang.nativeName}
                        </span>
                        <span className={`text-xs ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          ({lang.name})
                        </span>
                      </div>
                      <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                        {lang.sub}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-white text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            {{
              te: 'ఎంచుకున్న భాషకు స్వయంచాలకంగా వాయిస్ అసిస్టెంట్ మరియు కాల్స్ మారుతాయి',
              hi: 'चुनी गई भाषा में वॉयस असिस्टेंट और कॉल तुरंत अनुकूलित हो जाएंगे',
              ta: 'தேர்வு செய்த மொழிக்கு குரல் உதவியாளர் உடனடியாக மாறும்',
              kn: 'ಆಯ್ಕೆಮಾಡಿದ ಭಾಷೆಗೆ ಧ್ವನಿ ಸಹಾಯಕ ತಕ್ಷಣ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆ',
              mr: 'निवडलेल्या भाषेत व्हॉइस असिस्टंट आणि कॉल्स तत्काळ सुरू होतील',
              pa: 'ਚੁਣੀ ਗਈ ਭਾਸ਼ਾ ਵਿੱਚ ਵਾਇਸ ਅਸਿਸਟੈਂਟ ਤੁਰੰਤ ਬਦਲ ਜਾਵੇਗਾ',
              bn: 'নির্বাচিত ভাষায় ভয়েস অ্যাসিস্ট্যান্ট অবিলম্বে রূপান্তরিত হবে',
              en: 'Speech synthesis and alerts automatically switch to chosen language'
            }[currentLang] || 'Speech synthesis and alerts automatically switch to chosen language'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            {t.close || 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
}
