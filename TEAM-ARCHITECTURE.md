---
description: "UNIFIED TEAM ARCHITECTURE for 10-member parallel development. All issues work with shared data structures, event-driven architecture, and modular components."
---

# Last-Mile Scanner PWA — TEAM ARCHITECTURE 1.0

**For 10-member parallel development with shared architectural foundation**

---

## Executive Summary

This document defines a **unified, modular architecture** that enables all 10 team members to work on their respective issues in parallel without merge conflicts. The architecture is built on:

1. **Event-Driven Architecture** — All modules communicate via standardized events
2. **Shared Type System** — Single source of truth for all data structures
3. **Feature-Based Modules** — Each issue owns 1-3 modules, no cross-ownership
4. **Loose Coupling** — Modules depend only on shared types + events, not on each other's implementations
5. **Layered Backend** — API routes delegate to business logic (service layer)

---

## 10 Issues at a Glance

| # | Issue | Owner | Modules | Type |
|---|-------|-------|---------|------|
| 1 | PWA Setup & Offline | suriyagit123 | Service Worker, Offline Engine | PWA Infrastructure |
| 2 | Frontend UI & Dashboard | Sahana-268 | Pages, Components, Layouts | Frontend |
| 3 | Event Storage & Sync Queue | HariniBenedicta956 | IndexedDB, Sync Manager | Data Storage |
| 4 | QR/Barcode Scanner | logeshvm2585m-dotcom | Scanner Module, Camera API | Feature |
| 5 | Delivery Image Capture | swetha15-26 | Image Capture, Compression | Feature |
| 6 | GPS Tracking | sangeethasaravanan199 | Geolocation Service, Tracker | Feature |
| 7 | Geo-Fencing | Rubikadevi5 | Geo-Fence Service, Alerts | Feature |
| 8 | Backend APIs + Cash Mgmt | srinithi11125 | API Routes, Services, Database | Backend |
| 9 | ML Parcel Detection | harish3330 | ML Module, COCO-SSD | Feature + ML |
| 10 | External Integrations | harinis1511-del | OTP, WhatsApp, Payment | Integrations |

---

## Unified Folder Structure

```
lastmile-scanner-pwa/
├── copilot-instructions.md               (TDD + architectural principles)
├── TEAM-ARCHITECTURE.md                  (THIS FILE)
├── tsconfig.json                         (strict: true)
├── jest.config.js
├── next.config.js
├── prisma/
│   └── schema.prisma                     (Unified database schema)
│
├── lib/
│   ├── types/
│   │   ├── index.ts                      (Core types: ALL exported here)
│   │   ├── api.ts                        (API request/response contracts)
│   │   ├── events.ts                     (Event types: SINGLE SOURCE OF TRUTH)
│   │   ├── db.ts                         (Database schema types)
│   │   └── __tests__/
│   │       └── types.test.ts             (Type validation tests)
│   │
│   ├── constants/
│   │   ├── eventTypes.ts                 (Event type constants)
│   │   └── syncStates.ts                 (Sync state constants)
│   │
│   ├── events/
│   │   ├── eventBus.ts                   (Global event emitter)
│   │   ├── eventLogger.ts                (Event logging for debugging)
│   │   └── __tests__/
│   │       └── eventBus.test.ts
│   │
│   ├── storage/
│   │   ├── indexedDB.ts                  (IndexedDB wrapper - ISSUE #3)
│   │   ├── storageManager.ts             (Unified storage API)
│   │   └── __tests__/
│   │       └── indexedDB.test.ts
│   │
│   ├── modules/
│   │   ├── scanner/                      (ISSUE #4 - QR/Barcode)
│   │   │   ├── scanner.ts
│   │   │   ├── types.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── imageCapture/                 (ISSUE #5 - Image Compression)
│   │   │   ├── captureManager.ts
│   │   │   ├── compression.ts
│   │   │   ├── types.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── geolocation/                  (ISSUE #6 - GPS Tracking)
│   │   │   ├── tracker.ts
│   │   │   ├── types.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── geofence/                     (ISSUE #7 - Geo-Fencing)
│   │   │   ├── geofenceService.ts
│   │   │   ├── algorithms.ts
│   │   │   ├── types.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── ml/                           (ISSUE #9 - Parcel Detection)
│   │   │   ├── modelLoader.ts
│   │   │   ├── detector.ts
│   │   │   ├── postProcessor.ts
│   │   │   ├── types.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── integrations/                 (ISSUE #10 - Payments + Comms)
│   │   │   ├── otp/
│   │   │   ├── whatsapp/
│   │   │   ├── payment/
│   │   │   ├── types.ts
│   │   │   └── __tests__/
│   │   │
│   │   └── sync/                         (ISSUE #3 - Sync Queue)
│   │       ├── syncQueue.ts
│   │       ├── syncWorker.ts
│   │       ├── types.ts
│   │       └── __tests__/
│   │
│   ├── api-client.ts                     (Frontend HTTP client)
│   ├── db.ts                             (Prisma client)
│   └── utils.ts                          (Shared helpers)
│
├── pages/
│   ├── _app.tsx                          (ISSUE #2 - App wrapper)
│   ├── _document.tsx
│   ├── index.tsx                         (ISSUE #2 - Home)
│   ├── scan.tsx                          (ISSUE #2 - Scan page)
│   ├── delivery.tsx                      (ISSUE #2 - Delivery page)
│   ├── warehouse.tsx                     (ISSUE #2 - Warehouse page)
│   ├── payments.tsx                      (ISSUE #2 - Payments page)
│   ├── admin/
│   │   ├── dashboard.tsx                 (ISSUE #2 - Admin dashboard)
│   │   ├── deliveryLogs.tsx              (ISSUE #2)
│   │   └── locationLogs.tsx              (ISSUE #2)
│   │
│   ├── api/
│   │   ├── scan.ts                       (ISSUE #8 - POST /api/scan)
│   │   ├── location.ts                   (ISSUE #8 - POST /api/location)
│   │   ├── delivery.ts                   (ISSUE #8 - POST /api/delivery)
│   │   ├── payment.ts                    (ISSUE #8 - POST /api/payment)
│   │   ├── detect.ts                     (ISSUE #9 - POST /api/detect)
│   │   ├── sync.ts                       (ISSUE #8 - POST /api/sync)
│   │   ├── otp.ts                        (ISSUE #10 - POST /api/otp)
│   │   ├── whatsapp.ts                   (ISSUE #10 - POST /api/whatsapp)
│   │   └── __tests__/
│   │       └── *.test.ts
│   │
│   └── __tests__/
│       └── pages.test.tsx
│
├── services/                             (Business logic - ISSUE #8)
│   ├── scanService.ts
│   ├── deliveryService.ts
│   ├── paymentService.ts
│   ├── locationService.ts
│   └── __tests__/
│
├── public/
│   ├── manifest.json                     (ISSUE #1 - PWA)
│   ├── sw.js                             (ISSUE #1 - Service Worker)
│   └── models/
│       └── coco-ssd/                     (ISSUE #9 - ML models)
│
└── README.md
```

---

## Unified Type System (Single Source of Truth)

**File: `lib/types/index.ts`** — ALL shared types exported from here

### Core Event Types (lib/types/events.ts)

```typescript
// Event categories
export type EventType =
  | 'SCAN_EVENT'
  | 'LOCATION_EVENT'
  | 'DELIVERY_EVENT'
  | 'PAYMENT_EVENT'
  | 'DETECTION_EVENT'
  | 'GEOFENCE_EVENT'
  | 'IMAGE_CAPTURE_EVENT'
  | 'OTP_EVENT'
  | 'WHATSAPP_EVENT'
  | 'SYNC_EVENT'

// Sync states
export type SyncState = 'PENDING' | 'SYNCED' | 'FAILED' | 'RETRYING'

// Base event interface (all events extend this)
export interface AppEvent {
  id: string // UUID
  type: EventType
  timestamp: number // milliseconds since epoch
  agentId: string
  payload: Record<string, any>
  metadata: {
    location?: { lat: number; lng: number }
    syncState: SyncState
    attempt: number
    error?: string
  }
}

// Specific event types
export interface ScanEvent extends AppEvent {
  type: 'SCAN_EVENT'
  payload: {
    qrCode: string
    barcode?: string
    timestamp: number
  }
}

export interface LocationEvent extends AppEvent {
  type: 'LOCATION_EVENT'
  payload: {
    latitude: number
    longitude: number
    accuracy: number
    timestamp: number
  }
}

export interface DeliveryEvent extends AppEvent {
  type: 'DELIVERY_EVENT'
  payload: {
    deliveryId: string
    status: 'started' | 'in_progress' | 'completed'
    imageProof?: string // base64
    timestamp: number
  }
}

export interface PaymentEvent extends AppEvent {
  type: 'PAYMENT_EVENT'
  payload: {
    transactionId: string
    expectedAmount: number
    collectedAmount: number
    paymentMode: 'cash' | 'card' | 'upi'
    status: 'matched' | 'mismatch'
    timestamp: number
  }
}

export interface DetectionEvent extends AppEvent {
  type: 'DETECTION_EVENT'
  payload: {
    parcelCount: number
    confidence: number
    imageBase64: string
    timestamp: number
  }
}

export interface GeofenceEvent extends AppEvent {
  type: 'GEOFENCE_EVENT'
  payload: {
    zoneId: string
    zoneName: string
    status: 'entered' | 'exited'
    distance: number
    timestamp: number
  }
}

export interface ImageCaptureEvent extends AppEvent {
  type: 'IMAGE_CAPTURE_EVENT'
  payload: {
    imageBase64: string
    mimeType: string
    size: number // bytes after compression
    metadata: {
      latitude: number
      longitude: number
      timestamp: number
    }
  }
}

export interface OTPEvent extends AppEvent {
  type: 'OTP_EVENT'
  payload: {
    phoneNumber: string
    otpCode: string
    verified: boolean
    timestamp: number
  }
}

export interface WhatsappEvent extends AppEvent {
  type: 'WHATSAPP_EVENT'
  payload: {
    phoneNumber: string
    messageType: 'notification' | 'alert' | 'confirmation'
    content: string
    timestamp: number
  }
}

export interface SyncEvent extends AppEvent {
  type: 'SYNC_EVENT'
  payload: {
    totalEvents: number
    syncedEvents: number
    failedEvents: number
    timestamp: number
  }
}
```

### Core Data Types (lib/types/index.ts)

```typescript
export interface Agent {
  id: string // UUID
  name: string
  phoneNumber: string
  status: 'active' | 'offline' | 'inactive'
  lastLocation?: { lat: number; lng: number }
  createdAt: Date
  updatedAt: Date
}

export interface Parcel {
  id: string
  bbox: [number, number, number, number] // [x1, y1, x2, y2] normalized 0-1
  confidence: number
  label: string
}

export interface DetectionResult {
  id: string
  agentId: string
  parcelCount: number
  confidence: number
  detections: Parcel[]
  imageHash: string
  createdAt: Date
}

export interface GeoZone {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number // meters
  alertThreshold: number
}

export interface CashTransaction {
  id: string
  agentId: string
  expectedAmount: number
  collectedAmount: number
  paymentMode: 'cash' | 'card' | 'upi'
  status: 'matched' | 'mismatch'
  discrepancy: number
  createdAt: Date
}
```

### API Contracts (lib/types/api.ts)

```typescript
// SCAN API
export interface ScanRequest {
  qrCode: string
  agentId: string
  timestamp: number
  location?: { lat: number; lng: number }
}

export interface ScanResponse {
  scanId: string
  qrCode: string
  decoded: any
  timestamp: number
}

// LOCATION API
export interface LocationRequest {
  agentId: string
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export interface LocationResponse {
  locationId: string
  agentId: string
  latitude: number
  longitude: number
  timestamp: number
}

// DELIVERY API
export interface DeliveryRequest {
  deliveryId: string
  agentId: string
  status: 'started' | 'in_progress' | 'completed'
  imageProof?: string // base64
  timestamp: number
}

export interface DeliveryResponse {
  deliveryId: string
  status: string
  proofId?: string
  timestamp: number
}

// PAYMENT API
export interface PaymentRequest {
  transactionId: string
  agentId: string
  expectedAmount: number
  collectedAmount: number
  paymentMode: 'cash' | 'card' | 'upi'
  timestamp: number
}

export interface PaymentResponse {
  transactionId: string
  status: 'matched' | 'mismatch'
  discrepancy: number
  timestamp: number
}

// DETECT API (ISSUE #9)
export interface DetectRequest {
  imageBase64: string
  agentId: string
  timestamp: number
  location?: { lat: number; lng: number }
}

export interface DetectResponse {
  parcelCount: number
  confidence: number
  detections: Parcel[]
  inferenceTime: number
  timestamp: number
}

// SYNC API
export interface SyncRequest {
  events: AppEvent[]
  agentId: string
}

export interface SyncResponse {
  synced: number
  failed: number
  errors: { eventId: string; error: string }[]
}

// OTP API
export interface OTPRequest {
  phoneNumber: string
  action: 'send' | 'verify'
  otp?: string
}

export interface OTPResponse {
  phoneNumber: string
  verified: boolean
  message: string
}

// WHATSAPP API
export interface WhatsappRequest {
  phoneNumber: string
  messageType: string
  content: string
}

export interface WhatsappResponse {
  messageId: string
  status: 'sent' | 'failed'
}
```

---

## Event-Driven Architecture

### Global Event Bus (lib/events/eventBus.ts)

```typescript
export class EventBus {
  private listeners: Map<EventType, Function[]> = new Map()

  subscribe(type: EventType, handler: (event: AppEvent) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(handler)
    
    // Return unsubscribe function
    return () => {
      const handlers = this.listeners.get(type)!
      handlers.splice(handlers.indexOf(handler), 1)
    }
  }

  emit(event: AppEvent): void {
    const handlers = this.listeners.get(event.type) || []
    handlers.forEach((h) => h(event))
    // Also store in IndexedDB for offline sync
    storageManager.addEvent(event)
  }
}

export const eventBus = new EventBus()
```

### How Each Module Uses EventBus

**ISSUE #4 (Scanner) → Emits SCAN_EVENT:**
```typescript
import { eventBus } from '@/lib/events/eventBus'
import { ScanEvent } from '@/lib/types/events'

export async function performScan(): Promise<void> {
  const qrCode = await scanner.decode(imageData)
  
  const event: ScanEvent = {
    id: uuid(),
    type: 'SCAN_EVENT',
    timestamp: Date.now(),
    agentId: currentAgent.id,
    payload: { qrCode, timestamp: Date.now() },
    metadata: { syncState: 'PENDING', attempt: 0 }
  }
  
  eventBus.emit(event)
}
```

**ISSUE #3 (Sync Manager) → Listens to ALL Events:**
```typescript
import { eventBus } from '@/lib/events/eventBus'

eventBus.subscribe('SCAN_EVENT', async (event) => {
  await syncQueue.add(event)
})

eventBus.subscribe('LOCATION_EVENT', async (event) => {
  await syncQueue.add(event)
})
// ... subscribe to all events
```

**ISSUE #8 (Backend APIs) → Listens for SYNC events:**
```typescript
// In service/syncService.ts
eventBus.subscribe('SYNC_EVENT', async (event) => {
  // Process synced events, update database
})
```

---

## Database Schema (Unified for All Issues)

**File: `prisma/schema.prisma`**

```prisma
// Global agents table
model Agent {
  id            String    @id
  name          String
  phoneNumber   String    @unique
  status        String    @default("active") // "active" | "offline" | "inactive"
  lastLatitude  Float?
  lastLongitude Float?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  scans         Scan[]
  locations     Location[]
  deliveries    Delivery[]
  payments      Payment[]
  detections    Detection[]
}

// ISSUE #4 - Scans
model Scan {
  id        String    @id @default(cuid())
  agentId   String
  qrCode    String
  barcode   String?
  decodedData Json?
  createdAt DateTime  @default(now())

  agent     Agent     @relation(fields: [agentId], references: [id])
  @@index([agentId])
}

// ISSUE #6 - Location tracking
model Location {
  id        String    @id @default(cuid())
  agentId   String
  latitude  Float
  longitude Float
  accuracy  Float?
  createdAt DateTime  @default(now())

  agent     Agent     @relation(fields: [agentId], references: [id])
  @@index([agentId, createdAt])
}

// ISSUE #7 - Geo-fences
model GeoZone {
  id              String    @id @default(cuid())
  name            String
  latitude        Float
  longitude       Float
  radius          Float     // meters
  alertThreshold  Float?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// ISSUE #7 - Geofence alerts
model GeofenceAlert {
  id        String    @id @default(cuid())
  agentId   String
  zoneId    String
  status    String    // "entered" | "exited"
  distance  Float
  createdAt DateTime  @default(now())

  agent     Agent     @relation(fields: [agentId], references: [id])
  zone      GeoZone   @relation(fields: [zoneId], references: [id])
}

// ISSUE #5 - Image captures
model ImageCapture {
  id            String    @id @default(cuid())
  agentId       String
  imageHash     String    @unique
  mimeType      String
  sizeBytes     Int
  latitude      Float?
  longitude     Float?
  createdAt     DateTime  @default(now())

  agent         Agent     @relation(fields: [agentId], references: [id])
}

// ISSUE #9 - ML detections
model Detection {
  id            String    @id @default(cuid())
  agentId       String
  parcelCount   Int
  confidence    Float
  imageHash     String    @unique
  detections    Json      // Array of Parcel objects
  inferenceTime Int       // milliseconds
  createdAt     DateTime  @default(now())

  agent         Agent     @relation(fields: [agentId], references: [id])
  @@index([agentId])
}

// ISSUE #2 - Deliveries
model Delivery {
  id            String    @id @default(cuid())
  agentId       String
  status        String    // "started" | "in_progress" | "completed"
  imageProofId  String?   // References ImageCapture.id
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  agent         Agent     @relation(fields: [agentId], references: [id])
}

// ISSUE #8 - Payments + Cash management
model Payment {
  id              String    @id @default(cuid())
  agentId         String
  transactionId   String    @unique
  expectedAmount  Float
  collectedAmount Float
  paymentMode     String    // "cash" | "card" | "upi"
  status          String    // "matched" | "mismatch"
  discrepancy     Float     @default(0)
  createdAt       DateTime  @default(now())

  agent           Agent     @relation(fields: [agentId], references: [id])
  @@index([agentId])
}

// ISSUE #10 - OTP records
model OTP {
  id            String    @id @default(cuid())
  phoneNumber   String
  otpCode       String
  verified      Boolean   @default(false)
  expiresAt     DateTime
  createdAt     DateTime  @default(now())
}

// ISSUE #10 - Messages
model Message {
  id            String    @id @default(cuid())
  phoneNumber   String
  messageType   String    // "notification" | "alert" | "confirmation"
  content       String
  status        String    // "sent" | "failed"
  createdAt     DateTime  @default(now())
}

// ISSUE #3 - Sync queue
model SyncQueue {
  id            String    @id @default(cuid())
  agentId       String
  eventType     String
  eventData     Json
  syncState     String    @default("PENDING") // "PENDING" | "SYNCED" | "FAILED"
  attempt       Int       @default(0)
  error         String?
  createdAt     DateTime  @default(now())
  syncedAt      DateTime?

  @@index([syncState, agentId])
}
```

---

## Team Coordination Rules

### Rule 1: Module Ownership

Each team member owns their module(s) and is responsible for:
- ✅ Writing unit tests FIRST (TDD)
- ✅ Exporting types from `lib/types/`
- ✅ Emitting events via `eventBus`
- ✅ NOT modifying other modules (except through shared types + events)

| Team Member | Owns | Must Export | Must Emit |
|-------------|------|-------------|----------|
| suriyagit123 | Service Worker, PWA | `PWAConfig` | - |
| Sahana-268 | Pages, Components | `PageProps` | - |
| HariniBenedicta956 | IndexedDB, Sync | `StorageAPI` | `SYNC_EVENT` |
| logeshvm2585m-dotcom | Scanner | `ScanResult` | `SCAN_EVENT` |
| swetha15-26 | Image Capture | `CaptureResult` | `IMAGE_CAPTURE_EVENT` |
| sangeethasaravanan199 | GPS Tracker | `LocationData` | `LOCATION_EVENT` |
| Rubikadevi5 | Geo-Fence | `GeofenceResult` | `GEOFENCE_EVENT` |
| srinithi11125 | Backend APIs + DB | All API handlers | `SYNC_EVENT` |
| harish3330 | ML Module | `DetectionResult` | `DETECTION_EVENT` |
| harinis1511-del | Integrations | OTP/Payment/WhatsApp | `OTP_EVENT`, `WHATSAPP_EVENT` |

### Rule 2: Event Communication

- ✅ Emit events ONLY from your module
- ✅ Listen to events ONLY for triggering side effects (logging, UI updates, storage)
- ✅ Never call other modules directly
- ✅ Use shared types from `lib/types/events.ts`

**BAD:**
```typescript
// WRONG: Direct module call
import { scanService } from '@/services/scanService'
scanService.processScan(data) // ❌ Creates dependency
```

**GOOD:**
```typescript
// RIGHT: Event-driven
const event: ScanEvent = { ... }
eventBus.emit(event) // ✅ Decoupled
```

### Rule 3: Shared Types

- ✅ Add types to `lib/types/index.ts` or `lib/types/events.ts`
- ✅ Import types from `@/lib/types`
- ✅ Create interface for each event type
- ✅ NO local type duplication

### Rule 4: API Contracts

- ✅ All API responses must use contracts from `lib/types/api.ts`
- ✅ Frontend imports API types from same place as backend
- ✅ If API changes, update `lib/types/api.ts` FIRST, then update implementations

### Rule 5: Database Migrations

- ✅ Prisma schema changes in `prisma/schema.prisma` (centralized)
- ✅ Each team member adds their tables, no conflicts
- ✅ Run migrations together: `npx prisma migrate dev`

### Rule 6: Testing

- ✅ Write tests BEFORE implementation (TDD)
- ✅ Test files in `__tests__/` folder adjacent to source
- ✅ Mock external dependencies (services, APIs, databases)
- ✅ Run tests: `npm test -- --testPathPattern=moduleName`

---

## Dependency Map (What Depends on What)

```
┌─────────────────────────────────────────────────────┐
│              SHARED LAYER (All use these)           │
├─────────────────────────────────────────────────────┤
│  lib/types/          (Events, API contracts)        │
│  lib/events/         (EventBus)                     │
│  lib/storage/        (IndexedDB)                    │
│  lib/constants/      (Event types, sync states)     │
└─────────────────────────────────────────────────────┘
                          ↑
       ┌──────────────────┼──────────────────┐
       │                  │                  │
   Feature Modules    Backend APIs      Frontend Pages
       │                  │                  │
┌──────┴─────────────┐ ┌──┴────────────┐ ┌──┴──────────┐
│#4 Scanner          │ │#8 APIs        │ │#2 Pages     │
│#5 Image            │ │   Database    │ │   Dashboard │
│#6 GPS              │ │   Services    │ │             │
│#7 Geofence         │ │   Sync        │ │             │
│#9 ML               │ │#3 Sync Mgr    │ │             │
│#10 OTP/Payment     │ │               │ │             │
└────────────────────┘ └───────────────┘ └─────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
                 Frontend        PostgreSQL
                 (IndexedDB)      (Backend)
```

**Key Point:** No module depends on another module. All communication is through:
1. Shared types
2. Event bus
3. API calls

---

## Development Workflow for 10 Members

### Week 1: Foundation (All members in parallel)

**Day 1-2: Initialize & Setup**
```bash
# All run this together (in parallel, no conflicts)
npm install
npx next build
npx prisma generate

# suriyagit123 creates PR: #1 PWA Setup (service worker boilerplate)
# Sahana-268 creates PR: #2 UI Pages (skeleton pages)
# srinithi11125 creates PR: #8 Database (Prisma schema)
```

**Day 3-5: Core Features (Each works on their module)**
- Each member: Write unit tests FIRST (❌ they fail)
- Each member: Implement code to make tests pass (✅)
- Emit events from your module via eventBus
- Register event listeners only if needed for side effects

### Example: Team Member #4 (Scanner Module)

**Step 1: Write failing test**
```typescript
// lib/modules/scanner/__tests__/scanner.test.ts
describe('Scanner Module', () => {
  it('should decode QR code and emit SCAN_EVENT', async () => {
    const scanner = new ScannerModule()
    await scanner.scan(testImageData)
    
    // Test that SCAN_EVENT was emitted
    expect(eventBus.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SCAN_EVENT' })
    )
  })
})
```

**Step 2: Implement module**
```typescript
// lib/modules/scanner/scanner.ts
import { eventBus } from '@/lib/events/eventBus'
import { ScanEvent } from '@/lib/types/events'

export class ScannerModule {
  async scan(imageData: ImageData): Promise<void> {
    // ... decoding logic
    const qrCode = result
    
    const event: ScanEvent = {
      id: uuid(),
      type: 'SCAN_EVENT',
      timestamp: Date.now(),
      agentId: currentAgent.id,
      payload: { qrCode, timestamp: Date.now() },
      metadata: { syncState: 'PENDING', attempt: 0 }
    }
    
    eventBus.emit(event)
  }
}
```

**Step 3: Test passes ✅**

**Step 4: Integration (HariniBenedicta956's sync module listens)**
```typescript
// lib/modules/sync/syncQueue.ts
eventBus.subscribe('SCAN_EVENT', async (event: ScanEvent) => {
  // Store in IndexedDB for offline sync
  await storageManager.addEvent(event)
})
```

### Week 2-3: Integration & APIs

**All members continue (now with event listeners):**
- Backend APIs (srinithi11125) receive events via sync
- Frontend pages (Sahana-268) display results from APIs
- Each module listens to its dependencies (storage, sync)

### Week 4: Testing & Deployment

- E2E tests across all modules
- Performance testing on mid-range Android
- Docker build + deployment

---

## API Endpoints Map

| Endpoint | Issue | Owner | Input Contract | Output Contract |
|----------|-------|-------|-----------------|-----------------|
| `POST /api/scan` | #8 | srinithi11125 | `ScanRequest` | `ScanResponse` |
| `POST /api/location` | #8 | srinithi11125 | `LocationRequest` | `LocationResponse` |
| `POST /api/delivery` | #8 | srinithi11125 | `DeliveryRequest` | `DeliveryResponse` |
| `POST /api/payment` | #8 | srinithi11125 | `PaymentRequest` | `PaymentResponse` |
| `POST /api/detect` | #9 | harish3330 | `DetectRequest` | `DetectResponse` |
| `POST /api/sync` | #8 | srinithi11125 | `SyncRequest` | `SyncResponse` |
| `POST /api/otp` | #10 | harinis1511-del | `OTPRequest` | `OTPResponse` |
| `POST /api/whatsapp` | #10 | harinis1511-del | `WhatsappRequest` | `WhatsappResponse` |

---

## Conflict Prevention Checklist

- ✅ Each team member works in own folder (`lib/modules/moduleName/`)
- ✅ Shared types centralized in `lib/types/`
- ✅ Database schema centralized in `prisma/schema.prisma`
- ✅ Events standardized in `lib/types/events.ts`
- ✅ NO direct module imports (use events instead)
- ✅ Tests isolated per module (`__tests__/` folders)
- ✅ API routes separated by feature (one per issue)

---

## Git Workflow for 10 Members

```bash
# Team member creates feature branch (e.g., scanner module)
git checkout -b feature/issue-4-scanner

# Work on their module ONLY
# - Create lib/modules/scanner/
# - Create tests in lib/modules/scanner/__tests__/
# - NO changes to other modules

# Commit work
git add lib/modules/scanner/
git commit -m "feat(#4): implement QR barcode scanner with TDD"

# Create PR (to be reviewed by lead)
git push origin feature/issue-4-scanner
# Then open PR on GitHub
```

**Merge Strategy:**
- Parallel PRs reviewed + merged (no conflicts due to folder isolation)
- After all merge, run integration tests

---

## Success Criteria for Team

✅ All 10 members can work in parallel
✅ No merge conflicts on code
✅ All tests pass (unit + integration)
✅ All events flow correctly (SCAN → SYNC → API → DB)
✅ All API contracts match
✅ App works offline first + syncs when online
✅ Performance <5 second operations on mid-range Android

---

## Questions & Escalation

**Conflict between modules?** → Check `lib/types/events.ts` (should not need new types)
**Need to change event structure?** → Update `lib/types/events.ts` + notify all members
**Database schema conflict?** → Update `prisma/schema.prisma` together
**API contract mismatch?** → Fix in `lib/types/api.ts` first, then implementations
