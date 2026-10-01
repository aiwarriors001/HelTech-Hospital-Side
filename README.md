# 🏥 HelTech — Hospital Command Center & Telemedicine EHR Suite

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend%20EHR-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Agora RTC](https://img.shields.io/badge/Agora%20RTC-Telemedicine-099DFD?style=for-the-badge&logo=agora&logoColor=white)](https://www.agora.io/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**HelTech Hospital-Side** is an advanced, production-grade Hospital Information System (HIS) and Electronic Health Record (EHR) platform. Engineered for tertiary medical centers, multi-specialty clinics, and emergency triage hubs, it provides real-time clinical workflows, live WebRTC video consultations with automatic telephony dispatch, intelligent appointment scheduling, digital prescription registries, and hospital-certified PDF export.

---

## 🌟 Key Functional Modules

### 1. 📊 Executive Dashboard & Real-Time Analytics
- **Live Clinical Vitals**: Real-time counter of admitted patients, active consults, and pending reviews.
- **Visual Analytics**: Interactive weekly and monthly appointment trends via `Chart.js`.
- **Triage Action Center**: One-click approval and dynamic slot rescheduling for incoming consultation requests.
- **Recent Registries**: Direct preview of the latest doctor-issued prescriptions with dosage and timing indicators.

### 2. 📅 Intelligent Appointment Management
- **Two-Tier Workflows**: Distinct workspaces for **Pending Requests** and **Confirmed Scheduled Visits**.
- **Walk-In Registration**: Instant front-desk patient intake form with auto-assigned doctor, department, and attender details.
- **Smart Rescheduling**: Non-destructive slot adjustment with live time-picker and automated patient status updates.
- **Departmental Filtering**: Categorized by General Medicine, Cardiology, Orthopedics, Pediatrics, ENT, and more.

### 3. 📹 CareConnect™ Telemedicine Suite
- **Agora WebRTC Integration**: Ultra-low-latency HD audio/video consultation with hardware camera and microphone controls.
- **Automated Call Dispatch Webhook**: Automatically notifies external IVR, SIP phone bridges, or Cloudflare worker endpoints upon call initiation.
- **Live Consultation Notes & Prescription**: Doctors can take clinical notes, issue prescriptions, and specify dosages directly during active video calls.
- **Call Session Persistence**: Syncs with Supabase `call_details` for end-to-end call duration and doctor logs.

### 4. 👥 Patient EHR Management & Medical Report Export
- **Comprehensive Patient Dossier**: Detailed profiles containing UHID, contact info, blood group, and emergency attender credentials.
- **Simulated Multi-Parameter Telemetry**: Blood pressure, heart rate, oxygen saturation ($SpO_2$), and body temperature tracking.
- **Certified PDF Generation**: Single-click export of official, printable clinical medical reports formatted with hospital headers, doctor credentials, and Rx regimens using `jspdf`.

### 5. 💊 Digital Prescription Registry & Formulary
- **Unified Schema**: Consolidated `prescribed_medicines` and dosage `timing` fields with automatic fallbacks to ensure database integrity.
- **Quick Drug Formulary**: 1-click preset chips for commonly prescribed medications (Amoxicillin, Paracetamol, Pantoprazole, Cetirizine, Metformin, Azithromycin).
- **Printable Rx Slips**: Clean thermal slip / A4 print modal formatted with hospital branding, diagnosis, dosage intervals, and physician signatures.
- **Real-Time Search & Filters**: Search across patient names, doctors, medications, or diseases with instant time filtering (Today vs. Recent 7 Days).

### 6. 🏢 Hospital Profile & Wayfinding Concierge
- **Facility Credentials**: NABH & JCI accreditation showcase, license registry, clinical leadership directory, and trauma center metrics.
- **Interactive Campus Wayfinding**: Detailed navigational guide for Gates 1–3, parking levels (P1–P4), and the rooftop air ambulance helipad.
- **Campus FAQ AI Assistant**: Rule-based virtual assistant answering visitor questions on emergency hotlines, visiting hours, ICU capacity, and clinical specialties.

### 7. 🔐 Hospital Staff Authentication
- **Secure Access Guard**: Protected route architecture ensuring only authorized hospital personnel can view clinical records.
- **Supabase Auth**: Email/password authentication, Google OAuth SSO integration, and password visibility toggles.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 7.3 |
| **Routing** | React Router v7 |
| **State & Data Sync** | React Context (`DataContext`, `AuthContext`), Supabase Realtime Channels |
| **Backend & Database** | Supabase (PostgreSQL, Realtime, Auth, Storage) |
| **Telemedicine WebRTC** | Agora RTC SDK (`agora-rtc-sdk-ng`) |
| **Telephony Webhook** | Cloudflare Tunnel / External Webhook Bridge |
| **UI Components & Icons** | Phosphor Icons (`@phosphor-icons/react`), Framer Motion |
| **Charts & PDF** | Chart.js, react-chartjs-2, jsPDF, html2canvas |
| **PWA & Offline** | Vite Plugin PWA (`vite-plugin-pwa`), Workbox |
| **Notifications** | React Hot Toast |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Hare-Prasath-A-P-01/Hospital-Side.git
   cd Hospital-Side
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_AGORA_APP_ID=your-agora-app-id
   VITE_CALLING_WEBHOOK_BASE_URL=https://your-webhook-endpoint.com
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```

6. **Preview Production Build:**
   ```bash
   npm run preview
   ```

---

## 🗄️ Database Architecture (Supabase Tables)

- **`appointments`**: Patient name, contact, doctor, appointment date/time, status (`pending`, `confirmed`, `completed`), and symptoms.
- **`prescriptions`**: Patient name, doctor, diagnosis, `prescribed_medicines`, `timing`, dosage, and doctor instructions.
- **`call_details`**: Telemedicine session logs, caller info, duration, status (`pending`, `active`, `completed`), and channel identifier.
- **`patients`**: In-patient and outpatient records, emergency attenders, and demographics.

---

## 📱 Progressive Web App (PWA) Support

HelTech is fully configured as a Progressive Web App:
- Auto-updates via Workbox service workers.
- Configured 6MB offline asset precaching.
- Installable on mobile and desktop OS.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
