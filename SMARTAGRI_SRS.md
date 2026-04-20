# SmartAgri – Software Requirements Specification (SRS)

> **Version:** 1.0 **Date:** 2026‑04‑17 **Prepared by:** Antigravity (AI‑assisted)  

---

## 1. Introduction

### 1.1 Purpose
The **SmartAgri** platform provides small‑holder and commercial farmers with a unified, AI‑driven dashboard for:

* Real‑time crop‑disease and pest detection (Gemini Vision API)
* Dynamic, sow‑date‑aware crop‑growth calendar
* Smart weather‑advisory alerts that influence daily tasks (e.g., “delay fertilizer if rain > 60 %”)
* Economic profit estimation based on market rates and farm size
* Conversational AgriBot that can answer agronomic questions and navigate the UI

The SRS defines the functional and non‑functional requirements, external interfaces, data models, and constraints needed to build, maintain, and extend this system.

### 1.2 Scope
SmartAgri is a **web‑based SaaS** consisting of:

| Layer | Technology | Primary Responsibility |
|------|------------|------------------------|
| Front‑end | React + Vite, MUI, custom CSS | UI, state handling, API consumption |
| Back‑end | FastAPI (Python) + Uvicorn | REST endpoints, Gemini Vision integration, authentication |
| Data store | Supabase (PostgreSQL) | User profiles, crop metadata, persisted schedules |
| External services | Gemini 1.5 Flash, OpenWeatherMap | Image analysis, weather data |
| CI/CD (future) | Docker, GitHub Actions | Automated builds & deployments |

### 1.3 Definitions, Acronyms & Abbreviations

| Term | Definition |
|------|------------|
| **AI** | Artificial Intelligence (LLMs, Vision models) |
| **API** | Application Programming Interface |
| **CRUD** | Create, Read, Update, Delete |
| **CTA** | Call‑to‑Action |
| **SRS** | Software Requirements Specification |
| **UI** | User Interface |
| **UX** | User Experience |
| **MVP** | Minimum Viable Product (current release) |
| **SIM** | “Simulator” fallback mode when Gemini API key is missing |

### 1.4 References
* Gemini Vision API documentation – https://ai.google.dev/gemini-api
* OpenWeatherMap API – https://openweathermap.org/api
* Supabase docs – https://supabase.com/docs

---

## 2. Overall Description

### 2.1 Product Perspective
SmartAgri is a **stand‑alone web application** that can be hosted on any cloud VM (or container platform). It does **not** depend on any legacy monolith; all components communicate via HTTP/JSON.

### 2.2 User Classes & Characteristics

| Role | Description | Primary Activities |
|------|-------------|--------------------|
| **Farmer (registered)** | Has a Supabase account, owns one or two crops | Upload field images, view daily tasks, receive weather alerts, run profit estimator |
| **Farmer (guest)** | Visits the site without login | Browse marketing pages, view demo “Simulator” results |
| **Admin** | Supabase admin, can manage users & data | View logs, reset API keys, update static datasets |

### 2.3 Operating Environment

| Component | OS / Runtime | Dependencies |
|-----------|--------------|--------------|
| Front‑end | Browser (Chrome/Edge/Firefox) | Node ≥ 20, Vite, React 18, MUI v5 |
| Back‑end | Windows (development) / Linux (production) | Python 3.11, FastAPI, uvicorn, google‑generativeai, python‑multipart |
| Database | Supabase (PostgreSQL) | Managed service – no local install |
| External APIs | HTTPS | Gemini Vision, OpenWeatherMap |

### 2.4 Design Constraints
* **Theme Switching** – CSS variables defined in `:root` and `[data-theme='dark']`. Light theme must remain readable (contrast fixed in SRS).  
* **Stateless Backend** – All session data stored in Supabase; the FastAPI server must be horizontally scalable.  
* **Rate Limits** – Gemini Vision API limited to 60 req/min; the backend must implement a simple request‑throttling queue.  
* **No Direct File System Writes** – All persistent data must go through Supabase; only static assets are bundled at build time.

### 2.5 Assumptions & Dependencies
* Users have a stable internet connection for image upload and weather fetches.  
* The Gemini API key is stored in `.env` (`GEMINI_API_KEY`). If missing, the system automatically runs in **Simulator** mode.  
* Weather data is fetched from OpenWeatherMap; a valid API key (`VITE_OPENWEATHER_API_KEY`) is required for production.

---

## 3. System Features

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| **F‑001** | **AI Disease & Pest Detection** | Upload a leaf/crop image → Gemini Vision returns JSON with disease name, confidence, and treatment. | Must |
| **F‑002** | **Dynamic Crop Calendar** | Generates a scrollable timeline based on the user’s actual sowing date. | Must |
| **F‑003** | **Smart Weather Advisor** | Real‑time rain, wind, temperature alerts that influence “Today's Work” (e.g., “Delay fertilizer”). | Must |
| **F‑004** | **Economic Profit Estimator** | Uses crop economics JSON + market price API to compute expected revenue per acre. | Should |
| **F‑005** | **AgriBot Conversational Assistant** | Multi‑model LLM (Groq → Gemini → DeepSeek) answers agronomic queries and can navigate UI (`[NAVIGATE:/path]`). | Should |
| **F‑006** | **User Profile & Multi‑Crop Management** | Store up to two active crops per user, with local persistence and recycle‑bin for deleted crops. | Must |
| **F‑007** | **Theme Switching (Dark/Light)** | Dark theme is default; light theme must maintain contrast for all UI elements. | Must |
| **F‑008** | **Simulator Mode** | When API keys are missing, the system returns realistic mock responses for demo purposes. | Must |
| **F‑009** | **Responsive Design** | UI adapts to mobile, tablet, and desktop viewports. | Must |
| **F‑010** | **Export / Print Report** | Users can download a PDF summary of the current crop status, disease detection, and profit estimate. | Could |

---

## 4. External Interface Requirements

### 4.1 User Interfaces
| Screen | Key Elements |
|--------|--------------|
| **Login / Register** | Supabase auth forms, error handling, theme‑aware styling |
| **Dashboard (ActionHome)** | Progress ring, “Today’s Work” card, Weather Advisor badge, crop calendar, AgriBot chat |
| **Disease Detection Modal** | Image upload field, preview, result card (disease, confidence, treatment) |
| **Weather Center** | Current temperature, humidity, wind, rain probability, 5‑day forecast grid |
| **Features Page** | Grid of feature cards (icons, titles, descriptions) – CTA removed per request |

### 4.2 Hardware Interfaces
None – the system runs entirely in the browser and on a standard server.

### 4.3 Software Interfaces
| Interface | Protocol | Endpoint | Description |
|-----------|----------|----------|-------------|
| **Front‑end → Back‑end** | HTTP/JSON | `POST /detect/detect` | Receives multipart image, returns `{disease, confidence, treatment}` |
| **Front‑end → Weather Service** | HTTP/JSON | `GET /services/weather?location=…` (internal) | Calls OpenWeatherMap, returns current weather + alert object |
| **Front‑end → Supabase** | REST (via supabase-js) | `profiles`, `user_crops`, `binned_crops` tables | CRUD for user data |
| **Back‑end → Gemini** | HTTPS (google‑generativeai SDK) | `gemini_client.analyze_image` | Sends image bytes, receives structured JSON |
| **Back‑end → OpenWeatherMap** | HTTPS | `weatherService.fetchWeatherAndAlerts` | Retrieves geo‑coordinates then 5‑day forecast |

### 4.4 Communication Requirements
* All API calls must include a **Bearer token** (`supabase.auth.session().access_token`) for authenticated routes.  
* CORS is configured to allow origins `http://localhost:5173` (dev) and `https://smartagri.example.com` (prod).  

---

## 5. System Architecture
```mermaid
flowchart LR
    subgraph Browser
        UI[React UI] -->|fetch| API[FastAPI]
        UI -->|fetch| Weather[Weather Service]
        UI -->|fetch| Supabase[Supabase JS]
    end
    subgraph Server
        API -->|call| Gemini[Gemini Vision API]
        API -->|call| Cache[In‑memory cache (TTL 1h)]
    end
    Weather -->|call| OWM[OpenWeatherMap API]
    Supabase -->|store| PG[PostgreSQL]
    style UI fill:#39FF6A,stroke:#0A0D0B,color:#fff
    style API fill:#0A0D0B,stroke:#39FF6A,color:#fff
    style Gemini fill:#fff,stroke:#39FF6A,color:#0A0D0B
    style OWM fill:#fff,stroke:#39FF6A,color:#0A0D0B
    style PG fill:#fff,stroke:#39FF6A,color:#0A0D0B
```
*The diagram shows the separation of concerns: the front‑end interacts only with the back‑end and external services via well‑defined HTTP endpoints.*

---

## 6. Functional Requirements

| ID | Description | Input | Processing | Output |
|----|-------------|-------|------------|--------|
| **FR‑001** | Upload image for disease detection | JPEG/PNG file (≤ 5 MB) | Validate MIME, forward to Gemini, parse JSON | `{disease, confidence, treatment}` |
| **FR‑002** | Generate crop calendar | Crop type, sowing date | Load `crop_process.json`, compute stage start/end days, create scrollable list | UI component with day‑by‑day tasks |
| **FR‑003** | Provide weather advisory | User location string (e.g., “Nizamabad, Telangana”) | Call OpenWeatherMap → compute rain probability, wind speed, temperature → select alert rule | `alert` object with `title`, `message`, `severity`, colors |
| **FR‑004** | Compute profit estimate | Crop ID, farm size (acres) | Load `crop_data.json` economics, fetch market price (if available) → apply 25 % cost factor → calculate revenue | `{expectedYield, grossRevenue, netProfit, monthlyBreakdown}` |
| **FR‑005** | AgriBot conversation | Text query | Route to LLM stack → if response contains `[NAVIGATE:/path]` trigger UI navigation | Text reply + optional navigation command |
| **FR‑006** | Persist user profile | Email, password, optional location | Supabase `profiles` insert/update | Session token |
| **FR‑007** | Theme toggle | UI toggle click | Store preference in `localStorage` → apply CSS variables | Updated UI colors |
| **FR‑008** | Simulator fallback | Missing API key or Gemini error | Return pre‑canned disease result (e.g., “Leaf Spot – 92 %”) | Same schema as real detection |
| **FR‑009** | Export PDF report | Current crop state | Generate HTML → `html2pdf` library → download file | `SmartAgri_Report_<date>.pdf` |

---

## 7. Non‑Functional Requirements

| Category | Requirement | Rationale |
|----------|-------------|-----------|
| **Performance** | API response ≤ 2 s for detection (including Gemini latency) | Keeps UI fluid; Gemini average latency ~1 s |
| **Scalability** | Stateless FastAPI; can run behind a load balancer with ≥ 5 instances | Supports seminar demo and future production load |
| **Reliability** | 99.5 % uptime for the back‑end (excluding external API downtime) | Critical for real‑time farming decisions |
| **Security** | All endpoints require JWT from Supabase; HTTPS enforced | Protect user data and API keys |
| **Usability** | Contrast ratio ≥ 4.5:1 for all text in Light Theme (WCAG AA) | Fixed by using `var(--text-main)` for all foreground text |
| **Maintainability** | Code organized by feature (frontend) and by service (backend) with unit tests ≥ 80 % coverage | Simplifies future enhancements |
| **Portability** | Dockerfile provided for both front‑end and back‑end | Enables one‑click deployment |
| **Internationalization** | All UI strings stored in `i18n` JSON (currently English) | Future multilingual support |
| **Backup & Recovery** | Supabase automatic daily backups; manual export option | Prevent data loss |

---

## 8. Data Requirements

| Entity | Attributes | Storage |
|--------|------------|---------|
| **User** | `id`, `email`, `hashed_password`, `location`, `theme_preference` | Supabase `profiles` |
| **Crop** | `id`, `cropName`, `startDate`, `userId` | Supabase `user_crops` (JSON) |
| **Recycle Bin** | `cropId`, `deletedAt` | Supabase `binned_crops` |
| **Weather Cache** | `key`, `timestamp`, `data` (JSON) | Browser `localStorage` (TTL 1 h) |
| **Detection Log** | `userId`, `timestamp`, `imageHash`, `resultJSON` | Optional server‑side log file (`logs/detection.log`) |

---

## 9. System Constraints
* **API Rate Limits** – Gemini: 60 req/min; OpenWeatherMap: 60 req/min (free tier). The back‑end must queue excess requests and return a “please wait” message.
* **File Size** – Image uploads limited to 5 MB to avoid excessive bandwidth.
* **Browser Compatibility** – Must work on the latest two versions of Chrome, Edge, and Firefox.

---

## 10. Future Enhancements (Roadmap)
1. **Offline Edge Model** – Ship a TensorFlow Lite model for on‑device disease detection (no internet).
2. **Multi‑Crop Support** – Allow unlimited active crops with pagination.
3. **IoT Integration** – Pull soil‑moisture sensor data via MQTT.
4. **Multilingual AgriBot** – Add Hindi, Telugu, and Marathi language packs.
5. **Marketplace Integration** – Directly order recommended agro‑chemicals from partner vendors.

---

## 11. Appendices

### 11.1 Glossary
* **Sow Date** – The calendar day the farmer plants the seed.
* **Stage** – A growth phase defined in `crop_process.json` (e.g., “Vegetative”).
* **Alert Severity** – `success` (optimal), `warning` (caution), `error` (critical).

### 11.2 References to Source Files
| File | Relevance |
|------|-----------|
| `frontend/src/pages/ActionHome.jsx` | Implements “Today’s Work”, weather advisor badge, and detection UI. |
| `frontend/src/services/weatherService.js` | Generates smart weather alerts based on OpenWeatherMap data. |
| `backend/app/gemini_client.py` | Handles Gemini Vision calls and simulator fallback. |
| `frontend/src/pages/FeaturesPage.jsx` | Features grid (CTA removed per request). |
| `frontend/src/pages/ActionHome.css` | Theme variables (`:root` and `[data-theme='dark']`). |
| `.env` | Stores `GEMINI_API_KEY` and `VITE_OPENWEATHER_API_KEY`. |

---

*End of SRS*
