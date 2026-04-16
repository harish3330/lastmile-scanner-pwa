# LastMile Scanner PWA - Base Setup

A clean, minimal, and modular Progressive Web Application for last-mile delivery operations. This is the foundation where 10+ developers can independently work on separate modules.

## 📋 Project Overview

**Last-Mile Scanner PWA** is an offline-first Progressive Web Application designed to optimize last-mile delivery operations in supply chain environments.

The application enables delivery agents to perform parcel scanning, geo-tracking, warehouse validation, and data capture even in low or no connectivity conditions. It ensures operational continuity by storing critical data locally and synchronizing with backend systems when connectivity is restored.

## 🎯 Status: Foundation Complete ✅

- ✅ App runs successfully
- ✅ Modular architecture ready
- ✅ All 10 modules with placeholders
- ✅ Full routing configured
- ✅ PWA setup complete
- ✅ Backend API ready
- ✅ No heavy logic (clean foundation)

## 🏗️ Project Structure

```
lastmile-scanner-pwa/
├── frontend/                 # React + Vite PWA
│   ├── src/
│   │   ├── core/            # Routes & theme
│   │   ├── pages/           # Home, Dashboard
│   │   ├── components/      # Navbar, Sidebar
│   │   ├── modules/         # 10 independent modules
│   │   │   ├── pwa/         # Service Worker setup
│   │   │   ├── ui/          # UI Components
│   │   │   ├── storage/     # IndexedDB wrapper
│   │   │   ├── sync/        # Offline queue & sync
│   │   │   ├── scanner/     # QR/Barcode scanner
│   │   │   ├── camera/      # Image capture
│   │   │   ├── gps/         # Location tracking
│   │   │   ├── geofence/    # Boundary detection
│   │   │   ├── ml/          # ML API integration
│   │   │   └── integrations/ # OTP, WhatsApp, UPI
│   │   ├── services/        # API calls
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Helpers
│   ├── public/              # PWA assets (manifest, sw)
│   └── package.json
│
├── backend/                  # Flask API
│   ├── app/
│   │   ├── __init__.py       # App factory
│   │   └── routes/           # Modular routes
│   ├── app.py               # Entry point
│   └── requirements.txt
│
└── README.md                # This file
```

## 🎨 Module Details

Each module has 3 files:
- **index.js** - Exports
- **ModulePage.jsx** - Placeholder UI
- **moduleService.js** - Placeholder functions with TODO comments

### 10 Modules

1. **PWA** 📱 - Service Worker & PWA setup
2. **UI** 🎨 - UI Components & theming
3. **Storage** 💾 - IndexedDB wrapper
4. **Sync** 🔄 - Offline queue & sync
5. **Scanner** 📦 - QR/Barcode scanning
6. **Camera** 📷 - Image capture
7. **GPS** 📍 - Location tracking
8. **Geofence** 🗺️ - Boundary detection
9. **ML** 🤖 - ML API integration
10. **Integrations** 🔌 - OTP, WhatsApp, UPI

### Core Features
QR and Barcode scanning (offline capable)

Local data storage using IndexedDB with sync support

Real-time geo-tagging and last-known location tracking

Geo-fencing for warehouse boundary detection

Warehouse camera integration via APIs

Machine learning-based parcel counting and worker verification

Centralized data aggregation and processing

WhatsApp integration for alerts and notifications

Low-latency operations optimized for field usage

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (frontend)
- Python 3.8+ (backend)

### Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Opens at `http://localhost:3000`

### Setup Backend
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```
Runs at `http://localhost:5000`

## 🧩 Module Development Rules

### ✅ DO
- Work **only** inside your module folder
- Create placeholder functions with `// TODO` comments
- Keep services minimal and focused
- Use module's `index.js` for exports
- Test your module page independently
- Check dashboard at `/dashboard` for all modules

### ❌ DON'T
- Implement complex business logic yet
- Create dependencies between modules
- Import from other modules
- Add heavy libraries
- Share state across modules

## 🔌 API Integration

Frontend calls backend via `src/services/api.js`:

```javascript
import { healthCheck } from './services/api.js';
const status = await healthCheck();
```

Available endpoints:
- `GET /api/health` - Server status
- `GET /api/test/` - Test endpoint
- `POST /api/test/ping` - Ping test

## 📊 Dashboard

Visit `http://localhost:3000/dashboard` to see all 10 modules with quick navigation.

## 📦 Technology Stack

**Frontend:**
- React 18 + Vite 4
- React Router v6
- CSS (no frameworks)
- Service Workers & PWA APIs

**Backend:**
- Flask 2.3
- Flask-CORS
- Python 3.8+

## 🔄 Development Workflow

1. **Phase 1 (Complete)** ✅ - Foundation setup
2. **Phase 2** - Individual module development
3. **Phase 3** - Module integration
4. **Phase 4** - Testing & optimization
5. **Phase 5** - Deployment

## 📋 File Structure Legend

```
modules/module-name/
├── index.js              # export { default as ModulePage } from './ModulePage'
├── ModulePage.jsx        # React component (shows "Module Loaded")
└── moduleService.js      # Service functions (all TODO placeholders)
```

Each module is **completely independent** - no cross-module imports!

### System Requirements
### Functional Requirements

Scan QR and barcode data without internet

Store scanned and operational data locally

Synchronize data when connectivity is available

Capture and log user location continuously

Store last-known location when GPS is unavailable

Detect warehouse entry and exit using geo-fencing

Integrate with stationary warehouse cameras

Detect workers and parcel count using ML models

Provide API access for external systems

Send alerts via WhatsApp integration

### Non-Functional Requirements

Response time as function specific

Offline-first architecture with high reliability

Scalable and modular system design

Secure API communication over HTTPS

Consistent and user-friendly interface

Data integrity and fault tolerance

Architecture (High-Level)

PWA Frontend (mobile-first interface)

Service Worker (offline caching and background tasks)

IndexedDB (local data persistence)

Synchronization Engine (offline-to-online sync)

Backend API Layer (data processing and control)

Machine Learning Module (computer vision processing)

External Integration Layer (WhatsApp API, Camera APIs)

### Technology Stack
Frontend

HTML, CSS, JavaScript (PWA standards)

Service Workers

IndexedDB

Camera and Geolocation APIs

Backend

Python (Flask or FastAPI)

RESTful API architecture

PostgreSQL or MongoDB

Machine Learning

OpenCV

YOLO (object detection models)

### Integrations

WhatsApp Business API

Camera API integrations

UPI Payment Gateway

Development Workflow

Repository managed using GitHub

Feature-based task allocation via Issues

Branch-based development strategy

Structured commit history for traceability and accountability

### Versioning Strategy

main → stable production branch

feature/* → feature-specific development

v1 → initial functional implementation

v2 → optimized and integrated release

### Target Users

Supply chain and logistics companies

Last-mile delivery service providers

Warehouse operators and managers

### Future Scope

Advanced analytics dashboard

AI-based route optimization

Predictive supply chain insights

On-device machine learning capabilities

Real-time monitoring and admin control panel
