# 🌾 Aakash AI: Gram Panchayat-Level Hyper-Local Weather & Agro-Advisory System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=for-the-badge&logo=github&logoColor=white)](https://tejakandula20.github.io/Aakash-AI/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/TejaKandula20/Aakash-AI/actions)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Panchayats Covered](https://img.shields.io/badge/Coverage-13%2C326%20Panchayats-orange?style=for-the-badge)](https://tejakandula20.github.io/Aakash-AI/)

> **Smart India Hackathon Prototype**: AI/ML Downscaled Gram Panchayat Weather Forecasts, Multilingual Voice Assistant, Privacy-Preserving Farmer Registry, and Automated Agro-Alerts for all 13,326 Gram Panchayats in Andhra Pradesh.

---

## 🌐 Live Application

The production application is deployed and publicly accessible on GitHub Pages:

### 👉 **[https://tejakandula20.github.io/Aakash-AI/](https://tejakandula20.github.io/Aakash-AI/)**

- **Live URL**: `https://tejakandula20.github.io/Aakash-AI/`
- **Compiled Production Bundle**: Included directly in [`dist/`](./dist)
- **Deployment Status**: Active via GitHub Pages & automated GitHub Actions workflow

---

## 🚀 Key Highlights & Capabilities

### 1. Complete Andhra Pradesh Gram Panchayat Registry (13,326 Panchayats)
- **Comprehensive Coverage**: Covers all **26 newly reorganized AP districts** and **679 mandals** (taluks).
- **Physical Elevation & Terrain Downscaling**: Integrated with **ISRO Bhuvan / SRTM 30m DEM** high-resolution digital elevation models, lapse rate physics, slope, aspect, and soil profiles.
- **IMD Grid Downscaling**: Downscales coarse **25km IMD grid forecasts** down to **1km hyper-local village resolution**.
- **Instant Search Engine**: Sub-5ms search across all 13,326 Panchayats by village name, native Telugu script (e.g. `మారేడుమిల్లి`, `అరకు`), mandal, or 6-digit postal PIN code.

### 2. Privacy-Preserving Farmer Registry & Panchayat-Wide Alert Module
- **Zero PII & 100% Privacy Compliance**: No Aadhaar, government databases, or real personal information is collected or stored. Uses realistic synthetic records with masked phone numbers (`+91 98480 •••••`).
- **Dynamic Panchayat Linking**: Select any of the 13,326 Panchayats to view its local registered demo farmers, communication preferences (SMS / Automated Voice Call / Both), and preferred vernacular language.
- **Panchayat-Wide Emergency Alert Pipeline**: Trigger automated mass alerts during critical agro-climatic events:
  - Simulated SMS delivery pipeline with carrier delivery reports.
  - Automated interactive voice telephony simulation with live call state tracking.
  - Frequency capping (1 call/day) and 3-attempt re-dial retry mechanism.
  - Complete delivery statistics: Total Targeted, SMS Sent/Failed, Calls Initiated, Calls Answered & Unanswered.

### 3. AI/ML Localization Engine (Judge Mode)
- **Multi-Source Ingestion Pipeline**:
  - `IMD Grid Forecast (25km)` + `Historical Weather` + `Sentinel-2 NDVI` + `Soil Moisture` + `SRTM 30m Elevation` + `Land-Cover Classification`
  - `Feature Engineering` (lapse rate adjustment, terrain roughness, slope aspect, orographic index)
  - `XGBoost / Gradient Boosted Trees` downscaling model
  - `Panchayat-Level Forecast (1km)` $\rightarrow$ `Agronomic Risk Assessment` $\rightarrow$ `Localized Crop Advisory`
- **Neutral Comparison**: Objective benchmark between coarse district-level baseline forecasts and Aakash AI's 1km hyper-local localized forecast.
- **Explainable AI (XAI)**: Feature contribution breakdown (Orographic Lift, Elevation Lapse Rate, Soil Moisture Deficit, Canopy Microclimate).

### 4. Autonomous Emergency Disaster Call Sentinel & Smartphone HUD
- **24x7 Agro-Hazard Sentinel**: Continuously evaluates real-time telemetry against critical crop thresholds:
  - 🌧️ Flash Flood / Waterlogging: Localized rainfall > 35mm
  - 💧 Soil Saturation: Soil moisture saturation > 85%
  - ☀️ Scorching Heatwave: Canopy temperatures > 38.5°C
  - 💨 Squall / Lodging Risk: Wind gusts > 45 km/h
- **Realistic Incoming Call HUD**: Bypasses browser autoplay restrictions using Web Audio API synthesis and an interactive smartphone incoming call UI with ringing audio, caller ID, vibrating animation, and one-tap **"Answer Call (కాల్ ఎత్తండి)"**.
- **Vernacular Spoken Advisory**: Reads actionable emergency advisories in native languages with synchronized live text transcripts. Speech chunks calibrated to $\le 85$ characters for natural acoustic pacing.

### 5. Comprehensive Multilingual Farmer Experience
- **8 Indian Languages Supported**: Telugu (తెలుగు), English, Hindi (हिन्दी), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), Marathi (मराठी), Punjabi (ਪੰਜਾਬੀ), Bengali (বাংলা).
- **Aakash Vani Voice Assistant**: Conversational multilingual voice assistant providing instant weather clarity, crop protection tips, and spray advisories.
- **Horizon Forecasts**: 3-day hourly telemetry, 7-day trend analysis, and 30-day agro-climatic outlook.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Atmospheric Downscaling Engine**: Physical Lapse Rate Modelling ($-6.5^\circ\text{C} / 1000\text{m}$), Orographic Precipitation Amplification, SRTM 30m DEM Elevation
- **Voice & Speech Engine**: Web Speech API + High-Fidelity Streaming TTS with Vernacular Phonetic Numbers
- **Audio Telephony**: Web Audio API Dual-Tone Multi-Frequency (440Hz + 480Hz) Ringtone Synthesizer
- **CI/CD & Hosting**: GitHub Pages + GitHub Actions Workflow (`.github/workflows/deploy.yml`)

---

## 📂 Repository Structure

```
├── dist/                      # Pre-compiled production build ready for deployment
│   ├── assets/                # Minified JavaScript and CSS bundles
│   ├── index.html             # Production HTML entry point
│   ├── 404.html               # SPA routing fallback for GitHub Pages
│   └── .nojekyll              # Bypass Jekyll processing on GitHub Pages
├── .github/
│   └── workflows/
│       └── deploy.yml         # Automated GitHub Actions deployment pipeline
├── src/
│   ├── components/            # React UI components (FarmerRegistry, JudgeMode, Map, HUD, etc.)
│   ├── data/                  # 13,326 AP Panchayats, Farmer Registry data, weather telemetry
│   ├── App.jsx                # Main application component
│   └── index.css              # Tailwind CSS styles
├── public/                    # Static assets
├── vite.config.js             # Vite configuration with relative base ('./')
└── package.json               # Project dependencies and build scripts
```

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/TejaKandula20/Aakash-AI.git
cd Aakash-AI

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
