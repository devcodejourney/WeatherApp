# Weather · App

A modern, installable **Progressive Web App (PWA)** for real-time meteorological telemetry, detailed 5-day forecasts, humidity index tracking, and severe weather push notifications. Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Vite**, and **Workbox (`vite-plugin-pwa`)**, with **Light Mode** as the default theme and an instant **Dark Mode** toggle.

---

## Features

- **Real-Time Weather Telemetry**
  - Live conditions powered by the Open-Meteo Forecast & Geocoding APIs (no API key required) with automatic 5-minute polling.
  - Current temperature, feels-like temperature, daily high/low, sunrise/sunset in the city's local timezone, wind speed & compass direction, barometric pressure, visibility, and a 24-hour trajectory strip.
  - City search, GPS geolocation lookup, recent city quick-switching, and instant **°C / °F** (and **km/h / mph**) unit conversion across all cards and alert thresholds.

- **Humidity Index Tracking**
  - Computes **Relative Humidity (%)**, **Magnus-Tetens Dew Point**, **Steadman/Rothfusz Heat Index**, and **Water Vapor Pressure (hPa)**.
  - Classifies atmospheric comfort across five bands (`Dry`, `Comfortable`, `Humid`, `Muggy`, `Oppressive`) with an interactive 24-hour humidity trend bar chart.

- **Detailed 5-Day Daily Forecast**
  - Interactive 5-day selector with temperature range bars, average humidity, peak precipitation probability, max wind speed, and average pressure.
  - Selecting any day opens its 3-hour interval breakdown table (`Time`, `Condition`, `Temp`, `Humidity`, `Wind`, `Precip`).

- **Severe Weather Alerts & Push Notifications**
  - Real-time rule evaluation for convective thunderstorms, heavy precipitation (`>= 80%`), high wind gusts, excessive heat index, and elevated humidity thresholds.
  - Customizable threshold sliders persisted in `localStorage`.
  - Browser `Notification` permission management, Service Worker notification dispatch (`public/sw-notifications.js`), a **Send Test Alert** trigger, and an automatic in-app toast fallback when browser notifications are blocked.

- **True Progressive Web App (PWA)**
  - Complete Web App Manifest (`name: "Weather · App"`, `short_name: "Weather"`, `display: "standalone"`, `start_url: "/"`, `theme_color: "#0ea5e9"`).
  - Full icon set (`192x192`, `512x512`, `maskable 512x512`, `180x180` Apple touch icon, and vector `icon.svg`).
  - Workbox precaching + `NetworkFirst` runtime caching, `localStorage` weather snapshots, offline seed fallbacks, and an **Offline Mode** status banner.
  - In-app **Install App** button supporting `beforeinstallprompt` on Chromium/Android and guided instructions for iOS Safari / desktop browsers.

- **Light & Dark Theme**
  - **Light Mode** enabled by default (`#f8fafc` canvas, `#ffffff` surfaces) with a persistent **Light / Dark** segmented toggle (`#090d16` obsidian-slate dark mode) restored before first paint.

---

## Tech Stack

- **Framework**: React 19, TypeScript
- **Build Tooling**: Vite 8, `vite-plugin-pwa` (Workbox)
- **Styling & Typography**: Tailwind CSS v4 (`@tailwindcss/vite`), Plus Jakarta Sans, DM Sans, JetBrains Mono
- **Icons**: `lucide-react`
- **Weather Data**: Open-Meteo Geocoding & Forecast APIs
- **Testing**: Node built-in test runner (`node:test`) with `tsx`

---

## Project Structure

```text
├── index.html                        # Entry HTML with PWA meta tags & theme bootstrap
├── package.json                      # Dependencies and npm scripts
├── tsconfig.json                     # TypeScript configuration (includes vite-plugin-pwa types)
├── vite.config.ts                    # Vite + VitePWA manifest & Workbox configuration
├── public/
│   ├── apple-touch-icon.png          # 180x180 iOS Safari home screen icon
│   ├── icon.svg                      # Vector application icon
│   ├── pwa-192x192.png               # 192x192 standard PWA icon
│   ├── pwa-512x512.png               # 512x512 standard PWA icon
│   ├── pwa-maskable-512x512.png      # 512x512 maskable icon with safe-zone padding
│   └── sw-notifications.js           # Service Worker push & notificationclick handlers
└── src/
    ├── App.tsx                       # Root dashboard layout and state coordination
    ├── index.css                     # Tailwind CSS v4 config, dark variant & font tokens
    ├── main.tsx                      # React mount & Service Worker registration
    ├── components/
    │   ├── CurrentConditionsCard.tsx # Hero conditions, solar times, metrics & 24h strip
    │   ├── DailyForecastPanel.tsx    # 5-day selector & 3-hour interval breakdown table
    │   ├── HumidityIndexPanel.tsx    # Dew point, heat index, vapor pressure & 24h curve
    │   ├── LoadingSkeleton.tsx       # Geometry-matched loading skeleton
    │   ├── OfflineIndicator.tsx      # Offline connectivity status banner
    │   ├── PWAInstallButton.tsx      # Install prompt trigger & iOS/desktop guide modal
    │   ├── PushAlertToast.tsx        # In-app notification toast fallback
    │   ├── SearchToolbar.tsx         # City search, GPS, recent cities, theme & unit toggles
    │   ├── SevereAlertsPanel.tsx     # Active weather advisories & threshold configuration
    │   ├── TopNav.tsx                # Sticky 3-zone top navigation bar
    │   └── WeatherGlyph.tsx          # Condition-to-icon mapper
    ├── hooks/
    │   ├── useOnlineStatus.ts        # Online/offline connectivity listener
    │   ├── usePWAInstall.ts          # beforeinstallprompt & standalone detection
    │   ├── usePushAlerts.ts          # Notification permissions & alert dispatch history
    │   └── useTheme.ts               # Light (default) / Dark theme state & persistence
    ├── types/
    │   └── weather.ts                # Meteorological, forecast & alert TypeScript types
    └── utils/
        ├── weatherApi.ts             # Open-Meteo client, localStorage cache & fallback
        ├── weatherCalculations.ts    # Pure dew point, heat index, aggregation & alert logic
        └── weatherCalculations.test.ts # Unit test suite for weather calculations
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+ and **npm**

### Installation

```bash
npm install
```

### Development Server

Starts the Vite dev server on `http://localhost:3000` with the PWA service worker enabled in development mode:

```bash
npm run dev
```

### Production Build & Preview

```bash
npm run build
npm run preview
```

### Type Checking & Unit Tests

```bash
# TypeScript check
npm run lint

# Run meteorological calculation & alert unit tests
npx --yes tsx --test src/utils/weatherCalculations.test.ts
```

---

## PWA & Offline Behavior

1. **Manifest & Service Worker**: Generated automatically by `vite-plugin-pwa` at `/manifest.webmanifest` with `devOptions.enabled: true` so installability and caching can be tested in both development and production builds.
2. **Offline Resilience**: Static assets and recent Open-Meteo responses are cached via Workbox and `localStorage`. When connectivity drops, the **Offline Mode** indicator appears and cached/reference data remains accessible.
3. **Push Notifications**: Click **Enable Push Alerts** in the **Severe Weather Alerts & Push Notifications** panel to grant browser notification permissions, then adjust thresholds or click **Send Test Alert** to verify notification delivery.
