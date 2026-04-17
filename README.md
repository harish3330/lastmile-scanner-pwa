# Smart Parcel Tracking & Delivery System

> **Member 2 Deliverable** — UI + Admin Dashboard + Version Control

A Progressive Web Application for offline-first last-mile delivery operations.

## 🚀 Quick Start

```bash
cd parcel-tracker
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📱 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/scan` | Scan | QR/Barcode scanner with animated scan zone |
| `/delivery` | Delivery | Delivery management with status tracking |
| `/warehouse` | Warehouse | Zone capacity, camera feeds & ML detection |
| `/payment` | Payment | Cash collection & mismatch detection |
| `/admin/delivery-logs` | Delivery Logs | Full delivery event history + chart |
| `/admin/location-logs` | Location Logs | GPS tracking & agent positions |
| `/admin/payment-status` | Payment Status | Transaction overview & mismatch report |

## 🏗️ Tech Stack

- **React 19** with Vite
- **react-router-dom** — client-side routing
- **recharts** — data visualization
- **lucide-react** — icons

## 👥 Team Branching

See [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md) for full details.

```
main ← develop ← feature/member-2-ui
                ← feature/member-1-pwa
                ← feature/member-3-indexeddb
                ...
```

## 📁 Project Structure

```
parcel-tracker/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── ScanPage.jsx
│   │   ├── DeliveryPage.jsx
│   │   ├── WarehousePage.jsx
│   │   ├── PaymentPage.jsx
│   │   └── admin/
│   │       ├── DeliveryLogs.jsx
│   │       ├── LocationLogs.jsx
│   │       └── PaymentStatus.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── package.json
```
