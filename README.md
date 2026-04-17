# Smart Parcel Tracking & Delivery System

> **Member 2 Deliverable** — UI + Admin Dashboard + Version Control

A modern, offline-capable Progressive Web Application for last-mile delivery operations and multi-agent administration.

## 🚀 Quick Start

```bash
cd parcel-tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 Pages & Features

| Route | Page | Description |
|-------|------|-------------|
| `/` | Login | Mock authentication view |
| `/delivery-dashboard`| Agent Dashboard | Unified mobile-first agent app (Scan, Delivery, Proof, etc) |
| `/admin/dashboard` | Admin Dashboard | Unified admin control center with tab-switchers |
| `/scan` | Scan (Legacy) | QR/Barcode scanner with offline-first tracking |
| `/delivery` | Delivery (Legacy) | Delivery management with status tracking |
| `/warehouse` | Warehouse | Zone capacity, camera feeds & ML detection |
| `/payments` | Payment | Cash collection & mismatch detection |

## 🏗️ Tech Stack

- **Next.js 15** (Pages Router) — Server-side rendering & optimized routing
- **TypeScript** — Strict type safety aligning with `TEAM-ARCHITECTURE.md`
- **Recharts** — Dynamic interactive data tracking and visualization
- **Lucide-React** — Modern SVG icon library
- **Prisma** — Database ORM (Prepared for backend integration)

## 👥 Team Branching

See [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md) for full details.

```text
main ← feature/member-2-ui-admin-dashboard
     ← feature/issue-1-pwa-infrastructure
     ← feature/issue-4-scanner-module
     ...
```

## 📁 Project Structure

```text
parcel-tracker/
├── components/          # Reusable shared UI
│   ├── delivery/        # Scan & Delivery panels
│   ├── LocationLogs.tsx # Admin map and logs
│   ├── PaymentStatus.tsx# Admin cash tracking
│   ├── Navbar.tsx       # Top navigation
│   └── Sidebar.tsx      # App navigation
├── lib/types/           # Shared strict TypeScript interfaces
│   └── events.ts        # Central event bus interfaces
├── pages/               # Next.js Pages Routing
│   ├── admin/           # Admin section
│   │   └── dashboard.tsx
│   ├── delivery-dashboard.tsx 
│   ├── scan.tsx
│   ├── delivery.tsx
│   ├── warehouse.tsx
│   ├── payments.tsx
│   ├── login.tsx
│   └── _app.tsx         # Global layout provider
├── prisma/
│   └── schema.prisma    # Database definitions
└── styles/
    └── globals.css      # Core Design Tokens
```
