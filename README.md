# 🌾 Aakash AI: Gram Panchayat-Level Hyper-Local Weather & Agro-Advisory System

An advanced, vernacular AI/ML agro-meteorological forecasting engine and autonomous emergency alert system designed for all **13,326 Gram Panchayats** across the **26 Districts** of Andhra Pradesh, India.

---

## 🚀 Key Highlights & Capabilities

### 1. Complete Andhra Pradesh Gram Panchayat Registry (13,326 Panchayats)
- **Comprehensive Coverage**: Covers all **26 newly reorganized AP districts** and **679 mandals** (taluks).
- **Physical Elevation & Terrain Downscaling**: Integrated with **ISRO Bhuvan / SRTM 30m DEM** high-resolution digital elevation models, lapse rate physics, slope, aspect, and soil profiles.
- **IMD Grid Downscaling**: Downscales coarse **25km IMD grid forecasts** down to **1km hyper-local village resolution**.
- **Instant Search Engine**: Sub-5ms search across all 13,326 Panchayats by village name, native Telugu script (e.g. `మారేడుమిల్లి`, `అరకు`), mandal, or 6-digit postal PIN code.

### 2. Autonomous Emergency Disaster Call Sentinel & Smartphone HUD
- **24x7 Agro-Hazard Sentinel**: Continuously evaluates real-time telemetry against critical crop thresholds:
  - 🌧️ Flash Flood / Waterlogging: Localized rainfall > 35mm
  - 💧 Soil Saturation: Soil moisture saturation > 85%
  - ☀️ Scorching Heatwave: Canopy temperatures > 38.5°C
  - 💨 Squall / Lodging Risk: Wind gusts > 45 km/h
- **Realistic Incoming Call HUD**: Bypasses browser autoplay restrictions using Web Audio API synthesis and an interactive smartphone incoming call UI with ringing audio, caller ID, vibrating animation, and one-tap **"Answer Call (కాల్ ఎత్తండి)"**.
- **Vernacular Spoken Advisory**: Reads actionable emergency advisories in native languages (Telugu, English, Hindi, Tamil, Kannada, Marathi, Punjabi, Bengali) with synchronized live text transcripts.

### 3. Comprehensive Multilingual Farmer Experience
- **8 Indian Languages Supported**: Telugu (తెలుగు), English, Hindi (हिन्दी), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), Marathi (मराठी), Punjabi (ਪੰਜਾਬੀ), Bengali (বাংলা).
- **Aakash Vani Voice Assistant**: Multilingual conversational voice assistant providing instant weather clarity, crop protection tips, and spray advisories.
- **Horizon Forecasts**: 3-day hourly telemetry, 7-day trend analysis, and 30-day agro-climatic outlook.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Atmospheric Downscaling Engine**: Physical Lapse Rate Modelling ($-6.5^\circ\text{C} / 1000\text{m}$), Orographic Precipitation Amplification, SRTM 30m DEM Elevation
- **Voice & Speech Engine**: Native Web Speech API + High-Fidelity Streaming TTS Proxy with Vernacular Phonetic Numbers
- **Audio Telephony**: Web Audio API Dual-Tone Multi-Frequency (440Hz + 480Hz) Ringtone Synthesizer

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/aakash-ai-panchayat-weather.git
cd aakash-ai-panchayat-weather

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your web browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 📜 Attribution & Data Acknowledgement
- **Weather Data**: India Meteorological Department (IMD)
- **Topography & Elevation**: ISRO Bhuvan / SRTM DEM 30m
- **Soil Classification**: ICAR - National Bureau of Soil Survey and Land Use Planning
