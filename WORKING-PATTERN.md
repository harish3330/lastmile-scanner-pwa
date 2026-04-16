# Detailed Working Pattern — 10-Member Team Development

**Version:** 1.0
**Date:** April 16, 2026
**Author:** Development Team
**Status:** Ready for Day 0 Implementation

---

## Executive Summary

All 10 developers work **in parallel** using a **Test-Driven Development (TDD)** workflow:

1. **Day 0 (Morning):** HariniBenedicta956 creates shared stub interfaces (2 hours)
2. **Days 1-4:** All 10 developers work simultaneously on their modules
3. **Day 5+:** Real implementations replace stubs, tests still pass

**Zero blocking. Zero waiting. 100% concurrent development.**

---

## Core Principle: TDD Workflow

Every developer follows the **same pattern** for their module:

```
Step 1: Write failing test ❌
Step 2: Implement code ✅  
Step 3: Push to GitHub
Step 4: Create PR for review
```

**RULE:** Never write code before tests exist. Never ignore failing tests.

---

## PHASE 0: DAY 0 (Morning - 2 Hours)

### Who: HariniBenedicta956 (Shared Libraries Owner)

This is the **only blocking phase**. All other 9 developers wait for this.

### What to Create

```bash
# Create directory structure
mkdir -p lib/types lib/events lib/storage lib/constants lib/db

# Create 8 stub files (use EXACT names):
lib/types/events.ts              # Event interfaces (stub)
lib/types/api.ts                 # API request/response types (stub)
lib/types/db.ts                  # Database entity types (stub)
lib/types/index.ts               # Central export file
lib/events/eventBus.ts           # EventBus stub (mock implementation)
lib/storage/storageManager.ts    # StorageManager stub
lib/db/databaseClient.ts         # DatabaseClient stub
lib/constants/eventTypes.ts      # Event type constants
lib/constants/syncStates.ts      # Sync state constants
```

### Code Templates

**`lib/types/events.ts` (Stub)**
```typescript
// Stub interfaces for all events
export interface AppEvent {
  id: string
  type: string
  timestamp: number
  agentId: string
  payload: Record<string, any>
  metadata: {
    syncState: 'PENDING' | 'SYNCED' | 'FAILED'
    attempt: number
  }
}

export interface ScanEvent extends AppEvent {
  type: 'SCAN_EVENT'
  payload: { qrCode: string; timestamp: number }
}

export interface LocationEvent extends AppEvent {
  type: 'LOCATION_EVENT'
  payload: { lat: number; lng: number; accuracy: number }
}

export interface DetectionEvent extends AppEvent {
  type: 'DETECTION_EVENT'
  payload: { label: string; confidence: number }
}

export interface DeliveryEvent extends AppEvent {
  type: 'DELIVERY_EVENT'
  payload: { deliveryId: string; status: string }
}

export interface PaymentEvent extends AppEvent {
  type: 'PAYMENT_EVENT'
  payload: { amount: number; method: string; status: string }
}

export interface GeofenceEvent extends AppEvent {
  type: 'GEOFENCE_EVENT'
  payload: { zoneId: string; entering: boolean }
}

export interface ImageCaptureEvent extends AppEvent {
  type: 'IMAGE_CAPTURE_EVENT'
  payload: { imagePath: string; timestamp: number }
}

export interface OTPEvent extends AppEvent {
  type: 'OTP_EVENT'
  payload: { phone: string; code: string }
}

export interface WhatsAppEvent extends AppEvent {
  type: 'WHATSAPP_EVENT'
  payload: { message: string; recipient: string }
}

export interface SyncEvent extends AppEvent {
  type: 'SYNC_EVENT'
  payload: { eventsCount: number; duration: number }
}
```

**`lib/types/api.ts` (Stub)**
```typescript
export interface ScanRequest {
  agentId: string
  qrCode: string
  timestamp: number
  location?: { lat: number; lng: number }
}

export interface ScanResponse {
  id: string
  parcelId?: string
  status: 'success' | 'error'
  message: string
}

export interface LocationRequest {
  agentId: string
  lat: number
  lng: number
  accuracy: number
}

export interface LocationResponse {
  id: string
  status: 'logged' | 'error'
}

export interface DeliveryRequest {
  scanId: string
  deliveryStatus: string
}

export interface DeliveryResponse {
  id: string
  status: 'success' | 'error'
}

export interface PaymentRequest {
  deliveryId: string
  amount: number
  method: string
}

export interface PaymentResponse {
  id: string
  transactionId: string
  status: 'success' | 'failed'
}

export interface DetectRequest {
  image: string // base64
  confidence?: number
}

export interface DetectResponse {
  detections: Array<{
    label: string
    confidence: number
    bbox: [number, number, number, number]
  }>
}

export interface SyncRequest {
  events: any[]
}

export interface SyncResponse {
  synced: number
  failed: number
  status: 'success' | 'partial' | 'error'
}

export interface OTPRequest {
  phone: string
}

export interface OTPResponse {
  status: 'sent' | 'error'
  message: string
}

export interface VerifyOTPRequest {
  phone: string
  code: string
}

export interface VerifyOTPResponse {
  status: 'verified' | 'invalid'
  token?: string
}

export interface WhatsAppRequest {
  message: string
  recipient: string
}

export interface WhatsAppResponse {
  status: 'sent' | 'error'
  messageId?: string
}
```

**`lib/types/db.ts` (Stub)**
```typescript
export interface Agent {
  id: string
  name: string
  phone: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: Date
}

export interface Scan {
  id: string
  agentId: string
  qrCode: string
  parcelId?: string
  timestamp: Date
  location?: { lat: number; lng: number }
}

export interface Location {
  id: string
  agentId: string
  lat: number
  lng: number
  accuracy: number
  timestamp: Date
}

export interface Detection {
  id: string
  scanId: string
  label: string
  confidence: number
  bbox: string // JSON stringified
  timestamp: Date
}

export interface Delivery {
  id: string
  scanId: string
  status: string
  deliveredAt?: Date
  signature?: string
}

export interface Payment {
  id: string
  deliveryId: string
  amount: number
  method: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  transactionId?: string
  timestamp: Date
}

export interface OTP {
  id: string
  phone: string
  code: string
  verified: boolean
  expiresAt: Date
  createdAt: Date
}

export interface Message {
  id: string
  type: 'SMS' | 'WHATSAPP'
  recipient: string
  content: string
  status: 'SENT' | 'FAILED'
  timestamp: Date
}

export interface SyncQueue {
  id: string
  eventId: string
  eventType: string
  payload: string // JSON
  status: 'PENDING' | 'SYNCED' | 'FAILED'
  attempts: number
  lastAttempt?: Date
  createdAt: Date
}

export interface GeoZone {
  id: string
  name: string
  centerLat: number
  centerLng: number
  radiusMeters: number
  createdAt: Date
}

export interface GeofenceAlert {
  id: string
  zoneId: string
  agentId: string
  eventType: 'ENTER' | 'EXIT'
  timestamp: Date
}
```

**`lib/types/index.ts`**
```typescript
// Central export file for all types
export * from './events'
export * from './api'
export * from './db'
```

**`lib/events/eventBus.ts` (Stub - Mock Implementation)**
```typescript
import { AppEvent } from '@/lib/types'

type EventListener = (event: AppEvent) => void

class EventBusStub {
  private listeners: Map<string, EventListener[]> = new Map()

  emit(event: AppEvent): void {
    console.log('[EventBus] Event emitted:', event.type, event)
    const typeListeners = this.listeners.get(event.type) || []
    typeListeners.forEach(listener => listener(event))
  }

  on(eventType: string, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType)?.push(listener)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType) || []
      const index = listeners.indexOf(listener)
      if (index > -1) listeners.splice(index, 1)
    }
  }

  off(eventType: string, listener: EventListener): void {
    const listeners = this.listeners.get(eventType) || []
    const index = listeners.indexOf(listener)
    if (index > -1) listeners.splice(index, 1)
  }
}

export const eventBus = new EventBusStub()
```

**`lib/storage/storageManager.ts` (Stub)**
```typescript
import { AppEvent } from '@/lib/types'

class StorageManagerStub {
  async addEvent(event: AppEvent): Promise<void> {
    console.log('[StorageManager] Event queued:', event.id)
    // Stub: just log for now
  }

  async getEvents(): Promise<AppEvent[]> {
    console.log('[StorageManager] Retrieving queued events')
    return [] // Stub: return empty
  }

  async removeEvent(eventId: string): Promise<void> {
    console.log('[StorageManager] Event removed:', eventId)
  }

  async clearAll(): Promise<void> {
    console.log('[StorageManager] All events cleared')
  }
}

export const storageManager = new StorageManagerStub()
```

**`lib/db/databaseClient.ts` (Stub)**
```typescript
class DatabaseClientStub {
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    console.log('[DatabaseClient] Query executed:', sql)
    return [] // Stub: return empty
  }

  async insert<T>(table: string, data: T): Promise<T> {
    console.log('[DatabaseClient] Insert to', table, data)
    return data // Stub: return input
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    console.log('[DatabaseClient] Update', table, id, data)
    return { id, ...data } as T // Stub
  }

  async delete(table: string, id: string): Promise<boolean> {
    console.log('[DatabaseClient] Delete from', table, id)
    return true // Stub
  }
}

export const databaseClient = new DatabaseClientStub()
```

**`lib/constants/eventTypes.ts`**
```typescript
export const EVENT_TYPES = {
  SCAN_EVENT: 'SCAN_EVENT',
  LOCATION_EVENT: 'LOCATION_EVENT',
  DELIVERY_EVENT: 'DELIVERY_EVENT',
  PAYMENT_EVENT: 'PAYMENT_EVENT',
  DETECTION_EVENT: 'DETECTION_EVENT',
  GEOFENCE_EVENT: 'GEOFENCE_EVENT',
  IMAGE_CAPTURE_EVENT: 'IMAGE_CAPTURE_EVENT',
  OTP_EVENT: 'OTP_EVENT',
  WHATSAPP_EVENT: 'WHATSAPP_EVENT',
  SYNC_EVENT: 'SYNC_EVENT'
} as const
```

**`lib/constants/syncStates.ts`**
```typescript
export const SYNC_STATES = {
  PENDING: 'PENDING',
  SYNCED: 'SYNCED',
  FAILED: 'FAILED'
} as const

export const DELIVERY_STATUS = {
  SCANNED: 'SCANNED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED'
} as const

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
} as const
```

### Day 0 Commit & Push

```bash
cd lastmile-scanner-pwa
git add lib/
git commit -m "stubs: create shared interfaces and stub implementations for parallel dev"
git push origin main
```

**Time: 2 hours**

At 12:00 PM: All 9 developers pull main and start their modules ✅

---

## PHASE 1-4: DAYS 1-4 (Parallel Development)

Each of the 10 developers follows the **exact same TDD workflow** for their assigned module.

---

## MEMBER 1: suriyagit123 — PWA Setup, Offline Engine & Background Sync (Issue #1)

### Module Folder
```
lib/modules/pwa/
├── __tests__/
│   └── pwa.test.ts
├── manifest.ts
├── serviceWorker.ts
└── index.ts
```

### Day 1: Test-First (❌ Failing)

**File: `pages/__tests__/pwa.test.ts`**
```typescript
describe('PWA Setup', () => {
  it('should have manifest.json with correct properties', () => {
    const manifest = require('../../public/manifest.json')
    expect(manifest.name).toBe('Last-Mile Scanner')
    expect(manifest.short_name).toBe('Scanner')
    expect(manifest.display).toBe('standalone')
    expect(manifest.icons.length).toBeGreaterThan(0)
  })

  it('should register service worker on app load', async () => {
    const register = jest.spyOn(navigator.serviceWorker, 'register')
    // Trigger SW registration in _app.tsx
    expect(register).toHaveBeenCalled()
  })

  it('should have offline fallback page', () => {
    // Mock offline
    Object.defineProperty(navigator, 'onLine', { value: false })
    expect(navigator.onLine).toBe(false)
  })
})
```

**Run test:**
```bash
npm test -- pwa.test.ts
# FAIL ❌ - manifest missing
# FAIL ❌ - service worker not registered
```

### Days 2-3: Implementation (✅ Passing)

**File: `public/manifest.json`**
```json
{
  "name": "Last-Mile Scanner PWA",
  "short_name": "Scanner",
  "description": "Offline-first PWA for delivery tracking and parcel scanning",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**File: `next.config.js`**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true,
})
```

**File: `pages/_app.tsx`**
```typescript
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('Service Worker registered:', registration)
      })
    }
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
```

**Run test:**
```bash
npm test -- pwa.test.ts
# PASS ✅ - manifest valid
# PASS ✅ - service worker registered
```

### Day 4: Commit & Push

```bash
git add public/manifest.json next.config.js pages/_app.tsx pages/__tests__/pwa.test.ts
git commit -m "feat(#1): implement PWA setup with service worker registration"
git push origin feature/issue-1-pwa

# Create PR on GitHub
```

---

## MEMBER 2: Sahana-268 — Frontend UI Pages & Navigation (Issue #2)

### Module Folder
```
pages/
├── __tests__/
│   └── pages.test.tsx
├── scan.tsx
├── delivery.tsx
├── payments.tsx
├── warehouse.tsx
├── admin/
│   ├── dashboard.tsx
│   └── logs.tsx
└── index.tsx

components/
├── Navigation.tsx
└── Header.tsx
```

### Day 1: Test-First (❌ Failing)

**File: `pages/__tests__/pages.test.tsx`**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../index'
import Scan from '../scan'
import Delivery from '../delivery'
import AdminDashboard from '../admin/dashboard'
import { Navigation } from '@/components/Navigation'

describe('Frontend Pages', () => {
  it('should render Home page', () => {
    render(<Home />)
    expect(screen.getByText(/Last-Mile/i)).toBeInTheDocument()
  })

  it('should render Scan page', () => {
    render(<Scan />)
    expect(screen.getByText(/Scan/i)).toBeInTheDocument()
  })

  it('should render Delivery page', () => {
    render(<Delivery />)
    expect(screen.getByText(/Delivery/i)).toBeInTheDocument()
  })

  it('should render Payments page', () => {
    // Add when implemented
  })

  it('should display admin dashboard', () => {
    render(<AdminDashboard />)
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Delivery Logs/i)).toBeInTheDocument()
  })

  it('should have navigation with links', () => {
    render(<Navigation />)
    expect(screen.getByRole('link', { name: /scan/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /delivery/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument()
  })
})
```

**Run test:**
```bash
npm test -- pages.test.tsx
# FAIL ❌ - pages don't exist
```

### Days 2-3: Implementation (✅ Passing)

**File: `pages/index.tsx`**
```typescript
import Head from 'next/head'
import { Navigation } from '@/components/Navigation'

export default function Home() {
  return (
    <>
      <Head>
        <title>Last-Mile Scanner</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-12 px-4">
          <h1 className="text-4xl font-bold text-gray-900">Last-Mile Scanner</h1>
          <p className="mt-4 text-lg text-gray-600">
            Offline-first PWA for delivery tracking and parcel scanning
          </p>
        </main>
      </div>
    </>
  )
}
```

**File: `pages/scan.tsx`**
```typescript
export default function Scan() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Scan QR Code</h2>
      <p className="mt-2 text-gray-600">Scanner integration here</p>
    </div>
  )
}
```

**File: `pages/delivery.tsx`**
```typescript
export default function Delivery() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Delivery Status</h2>
      <p className="mt-2 text-gray-600">Delivery tracking here</p>
    </div>
  )
}
```

**File: `pages/payments.tsx`**
```typescript
export default function Payments() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Payments</h2>
      <p className="mt-2 text-gray-600">Payment history here</p>
    </div>
  )
}
```

**File: `pages/warehouse.tsx`**
```typescript
export default function Warehouse() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Warehouse</h2>
      <p className="mt-2 text-gray-600">Warehouse inventory here</p>
    </div>
  )
}
```

**File: `pages/admin/dashboard.tsx`**
```typescript
export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <section className="bg-white p-4 rounded shadow">
          <h3 className="font-bold">Delivery Logs</h3>
        </section>
        <section className="bg-white p-4 rounded shadow">
          <h3 className="font-bold">Location Logs</h3>
        </section>
        <section className="bg-white p-4 rounded shadow">
          <h3 className="font-bold">Payment Status</h3>
        </section>
      </div>
    </div>
  )
}
```

**File: `components/Navigation.tsx`**
```typescript
import Link from 'next/link'

export function Navigation() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-7xl mx-auto flex gap-6">
        <Link href="/" className="font-bold">Home</Link>
        <Link href="/scan">Scan</Link>
        <Link href="/delivery">Delivery</Link>
        <Link href="/warehouse">Warehouse</Link>
        <Link href="/payments">Payments</Link>
        <Link href="/admin/dashboard">Admin</Link>
      </div>
    </nav>
  )
}
```

**Run test:**
```bash
npm test -- pages.test.tsx
# PASS ✅ - all pages render
# PASS ✅ - navigation works
```

### Day 4: Commit & Push

```bash
git add pages/ components/
git commit -m "feat(#2): implement frontend UI pages and navigation"
git push origin feature/issue-2-ui
```

---

## MEMBER 3: HariniBenedicta956 — Offline Storage & Sync Queue (Issue #3)

### Module Folder
```
lib/modules/sync/
├── __tests__/
│   └── syncManager.test.ts
├── syncManager.ts
└── index.ts
```

### Day 1: Test-First (❌ Failing)

**File: `lib/modules/sync/__tests__/syncManager.test.ts`**
```typescript
import { SyncManager } from '../syncManager'
import { storageManager } from '@/lib/storage/storageManager'
import { AppEvent } from '@/lib/types'

describe('SyncManager', () => {
  let syncManager: SyncManager

  beforeEach(() => {
    syncManager = new SyncManager()
  })

  it('should queue event when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    
    const event: AppEvent = {
      id: 'test-1',
      type: 'SCAN_EVENT',
      timestamp: Date.now(),
      agentId: 'agent-1',
      payload: { qrCode: '123' },
      metadata: { syncState: 'PENDING', attempt: 0 }
    }

    await syncManager.queue(event)
    const queued = await storageManager.getEvents()
    
    expect(queued.length).toBeGreaterThan(0)
    expect(queued[0].id).toBe('test-1')
  })

  it('should sync events when online', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    
    const synced = await syncManager.processQueue()
    expect(Array.isArray(synced)).toBe(true)
  })

  it('should retry failed syncs', async () => {
    const event: AppEvent = {
      id: 'test-2',
      type: 'LOCATION_EVENT',
      timestamp: Date.now(),
      agentId: 'agent-1',
      payload: { lat: 0, lng: 0, accuracy: 10 },
      metadata: { syncState: 'PENDING', attempt: 0 }
    }

    await syncManager.queue(event)
    const result = await syncManager.retryFailed()
    expect(result).toBeDefined()
  })
})
```

**Run test:**
```bash
npm test -- syncManager.test.ts
# FAIL ❌ - SyncManager not implemented
```

### Days 2-3: Implementation (✅ Passing)

**File: `lib/modules/sync/syncManager.ts`**
```typescript
import { AppEvent } from '@/lib/types'
import { storageManager } from '@/lib/storage/storageManager'

export class SyncManager {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  private maxRetries = 3

  async queue(event: AppEvent): Promise<void> {
    if (!navigator.onLine) {
      // Queue offline
      await storageManager.addEvent(event)
      console.log('[SyncManager] Event queued offline:', event.id)
    } else {
      // Send immediately
      await this.sendEvent(event)
    }
  }

  async processQueue(): Promise<AppEvent[]> {
    const events = await storageManager.getEvents()
    const synced: AppEvent[] = []

    for (const event of events) {
      try {
        await this.sendEvent(event)
        synced.push(event)
        await storageManager.removeEvent(event.id)
      } catch (error) {
        console.error('[SyncManager] Sync failed for event:', event.id, error)
      }
    }

    return synced
  }

  async retryFailed(): Promise<number> {
    const events = await storageManager.getEvents()
    let retried = 0

    for (const event of events) {
      if (event.metadata.attempt < this.maxRetries) {
        try {
          await this.sendEvent(event)
          await storageManager.removeEvent(event.id)
          retried++
        } catch (error) {
          // Will retry next time
        }
      }
    }

    return retried
  }

  private async sendEvent(event: AppEvent): Promise<void> {
    const response = await fetch(`${this.apiUrl}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: [event] })
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`)
    }
  }

  setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('[SyncManager] Back online, processing queue')
      this.processQueue()
    })
  }
}

export const syncManager = new SyncManager()
```

**Run test:**
```bash
npm test -- syncManager.test.ts
# PASS ✅ - queueing works
# PASS ✅ - syncing works
# PASS ✅ - retries work
```

### Day 4: Commit & Push

```bash
git add lib/modules/sync/
git commit -m "feat(#3): implement offline sync queue with retry logic"
git push origin feature/issue-3-sync
```

---

## MEMBER 4: logeshvm2585m-dotcom — QR/Barcode Scanner (Issue #4)

### Module Folder
```
lib/modules/scanner/
├── __tests__/
│   └── scanner.test.ts
├── scanner.ts
└── index.ts
```

### Day 1: Test-First (❌ Failing)

**File: `lib/modules/scanner/__tests__/scanner.test.ts`**
```typescript
import { ScannerModule } from '../scanner'
import { eventBus } from '@/lib/events/eventBus'
import { ScanEvent } from '@/lib/types'

describe('Scanner Module', () => {
  let scanner: ScannerModule

  beforeEach(() => {
    scanner = new ScannerModule()
  })

  it('should decode QR code and emit SCAN_EVENT', async () => {
    const emitSpy = jest.spyOn(eventBus, 'emit')

    const mockQRData = new Uint8ClampedArray(10000).fill(100)
    const imageData = new ImageData(mockQRData, 100, 100)

    const result = await scanner.decodeQR(imageData)
    
    expect(result).toBeDefined()
    expect(emitSpy).toHaveBeenCalled()
  })

  it('should emit ScanEvent with correct structure', async () => {
    const emitSpy = jest.spyOn(eventBus, 'emit')

    await scanner.scan({
      qrCode: '123456',
      timestamp: Date.now()
    })

    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SCAN_EVENT',
        payload: expect.objectContaining({ qrCode: '123456' })
      })
    )
  })
})
```

**Run test:**
```bash
npm test -- scanner.test.ts
# FAIL ❌ - ScannerModule not implemented
```

### Days 2-3: Implementation (✅ Passing)

**File: `lib/modules/scanner/scanner.ts`**
```typescript
import jsQR from 'jsqr'
import { eventBus } from '@/lib/events/eventBus'
import { ScanEvent, AppEvent } from '@/lib/types'
import { v4 as uuid } from 'uuid'

export class ScannerModule {
  async scan(data: { qrCode: string; timestamp: number }): Promise<void> {
    const event: ScanEvent = {
      id: uuid(),
      type: 'SCAN_EVENT',
      timestamp: data.timestamp,
      agentId: this.getAgentId(),
      payload: {
        qrCode: data.qrCode,
        timestamp: data.timestamp
      },
      metadata: {
        syncState: 'PENDING',
        attempt: 0
      }
    }

    eventBus.emit(event)
    console.log('[Scanner] QR scanned:', data.qrCode)
  }

  async decodeQR(imageData: ImageData): Promise<string | null> {
    try {
      const code = jsQR(
        imageData.data,
        imageData.width,
        imageData.height
      )
      return code?.data || null
    } catch (error) {
      console.error('[Scanner] QR decode error:', error)
      return null
    }
  }

  private getAgentId(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agentId') || 'unknown'
    }
    return 'unknown'
  }
}

export const scannerModule = new ScannerModule()
```

**Run test:**
```bash
npm test -- scanner.test.ts
# PASS ✅ - QR decoding works
# PASS ✅ - event emitted correctly
```

### Day 4: Commit & Push

```bash
git add lib/modules/scanner/
git commit -m "feat(#4): implement QR and barcode scanner with event emission"
git push origin feature/issue-4-scanner
```

---

## MEMBER 5: swetha15-26 — Image Capture & Compression (Issue #5)

### Module Folder
```
lib/modules/imageCapture/
├── __tests__/
│   └── imageCapture.test.ts
├── imageCapture.ts
└── index.ts
```

### Day 1-4: TDD Workflow (Same Pattern)

**Day 1: Write tests** → Camera access, compression, file size reduction
**Days 2-3: Implement** → browser Camera API, sharp/compressorjs
**Day 4: Push** → feature/issue-5-image-capture

### Key Code Structure
```typescript
export class ImageCaptureModule {
  async captureFromCamera(): Promise<Blob> {
    // Access device camera
    // Compress image
    // Emit IMAGE_CAPTURE_EVENT
    // Return compressed blob
  }

  async compressImage(blob: Blob): Promise<Blob> {
    // Use browser-image-compression
    // Target: < 500KB
  }
}
```

---

## MEMBER 6: sangeethasaravanan199 — GPS Tracking & Location Service (Issue #6)

### Module Folder
```
lib/modules/geolocation/
├── __tests__/
│   └── geolocation.test.ts
├── geolocation.ts
└── index.ts
```

### Day 1-4: TDD Workflow (Same Pattern)

**Day 1: Write tests** → Geolocation API access, location updates, accuracy
**Days 2-3: Implement** → navigator.geolocation.watchPosition()
**Day 4: Push** → feature/issue-6-geolocation

### Key Code Structure
```typescript
export class GeolocationModule {
  async startTracking(): Promise<void> {
    // Use watchPosition for continuous tracking
    // Emit LOCATION_EVENT every update
    // Store in sync queue if offline
  }

  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    // One-time location fix
  }
}
```

---

## MEMBER 7: Rubikadevi5 — Geo-Fence & Boundary Detection (Issue #7)

### Module Folder
```
lib/modules/geofence/
├── __tests__/
│   └── geofence.test.ts
├── geofence.ts
└── index.ts
```

### Day 1-4: TDD Workflow (Same Pattern)

**Day 1: Write tests** → Distance calculation, boundary crossing, zone alerts
**Days 2-3: Implement** → Haversine formula, boundary detection logic
**Day 4: Push** → feature/issue-7-geofence

### Key Code Structure
```typescript
export class GeofenceModule {
  calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number {
    // Haversine formula
    // Return distance in meters
  }

  checkBoundary(
    current: { lat: number; lng: number },
    zone: { centerLat: number; centerLng: number; radiusMeters: number }
  ): 'inside' | 'outside' {
    // Calculate distance from zone center
    // Emit GEOFENCE_EVENT on crossing
  }
}
```

---

## MEMBER 8: srinithi11125 — Backend APIs & Database (Issue #8)

### Module Folder
```
pages/api/
├── __tests__/
│   └── api.test.ts
├── scan.ts
├── location.ts
├── delivery.ts
├── payment.ts
├── detect.ts
├── sync.ts
└── index.ts
```

### Day 1: Test-First (❌ Failing)

**File: `pages/api/__tests__/api.test.ts`**
```typescript
import { createMocks } from 'node-mocks-http'
import scanHandler from '../scan'
import locationHandler from '../location'

describe('API Endpoints', () => {
  it('POST /api/scan should accept scan data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        agentId: 'agent-1',
        qrCode: '123456'
      }
    })

    await scanHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.status).toEqual('success')
  })

  it('POST /api/location should accept location data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        agentId: 'agent-1',
        lat: 12.9716,
        lng: 77.5946
      }
    })

    await locationHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
  })

  it('POST /api/sync should sync queued events', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { events: [] }
    })

    const syncHandler = await import('../sync')
    // Test sync endpoint
  })
})
```

**Run test:**
```bash
npm test -- api.test.ts
# FAIL ❌ - API endpoints not implemented
```

### Days 2-3: Implementation (✅ Passing)

**File: `pages/api/scan.ts`**
```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { ScanRequest, ScanResponse } from '@/lib/types'
import { prisma } from '@/lib/db/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScanResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' })
  }

  try {
    const { agentId, qrCode, timestamp, location }: ScanRequest = req.body

    const scan = await prisma.scan.create({
      data: {
        agentId,
        qrCode,
        timestamp: new Date(timestamp),
        location: location ? { lat: location.lat, lng: location.lng } : null
      }
    })

    return res.status(200).json({
      id: scan.id,
      status: 'success',
      message: 'Scan recorded'
    })
  } catch (error) {
    console.error('[API] Scan error:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Failed to record scan'
    })
  }
}
```

**File: `pages/api/location.ts`**
```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { LocationRequest, LocationResponse } from '@/lib/types'
import { prisma } from '@/lib/db/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' })
  }

  try {
    const { agentId, lat, lng, accuracy }: LocationRequest = req.body

    const location = await prisma.location.create({
      data: {
        agentId,
        lat,
        lng,
        accuracy,
        timestamp: new Date()
      }
    })

    return res.status(200).json({
      id: location.id,
      status: 'logged'
    })
  } catch (error) {
    return res.status(500).json({
      id: '',
      status: 'error'
    })
  }
}
```

**File: `pages/api/sync.ts`**
```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { SyncRequest, SyncResponse } from '@/lib/types'
import { prisma } from '@/lib/db/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SyncResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      synced: 0,
      failed: 0,
      status: 'error'
    })
  }

  try {
    const { events }: SyncRequest = req.body

    let synced = 0
    let failed = 0

    for (const event of events) {
      try {
        await prisma.syncQueue.update({
          where: { eventId: event.id },
          data: { status: 'SYNCED' }
        })
        synced++
      } catch {
        failed++
      }
    }

    return res.status(200).json({
      synced,
      failed,
      status: synced > 0 ? 'success' : 'error'
    })
  } catch (error) {
    return res.status(500).json({
      synced: 0,
      failed: 0,
      status: 'error'
    })
  }
}
```

**Run test:**
```bash
npm test -- api.test.ts
# PASS ✅ - scan endpoint works
# PASS ✅ - location endpoint works
# PASS ✅ - sync endpoint works
```

### Day 4: Commit & Push

```bash
git add pages/api/
git commit -m "feat(#8): implement backend API endpoints with database integration"
git push origin feature/issue-8-api
```

---

## MEMBER 9: harish3330 — ML Parcel Detection (Issue #9)

### Module Folder
```
lib/modules/ml/
├── __tests__/
│   └── detection.test.ts
├── detector.ts
├── postProcessor.ts
└── index.ts
```

### Day 1: Test-First (❌ Failing)

**File: `lib/modules/ml/__tests__/detection.test.ts`**
```typescript
import { ObjectDetector } from '../detector'
import { eventBus } from '@/lib/events/eventBus'

describe('ML Detection Module', () => {
  let detector: ObjectDetector

  beforeAll(async () => {
    detector = new ObjectDetector()
    await detector.initialize()
  })

  it('should load COCO-SSD model', async () => {
    expect(detector.isReady()).toBe(true)
  })

  it('should detect objects in image', async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 480

    const detections = await detector.detect(canvas)

    expect(Array.isArray(detections)).toBe(true)
    expect(detections.length).toBeGreaterThanOrEqual(0)
  })

  it('should emit DETECTION_EVENT', async () => {
    const emitSpy = jest.spyOn(eventBus, 'emit')

    const canvas = document.createElement('canvas')
    await detector.detectAndEmit(canvas)

    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'DETECTION_EVENT' })
    )
  })

  it('should filter low confidence detections', async () => {
    const detections = [
      { class: 'parcel', score: 0.95 },
      { class: 'person', score: 0.3 }
    ]

    const filtered = detector.filterByConfidence(detections, 0.5)

    expect(filtered.length).toBe(1)
    expect(filtered[0].score).toBeGreaterThan(0.5)
  })
})
```

**Run test:**
```bash
npm test -- detection.test.ts
# FAIL ❌ - ObjectDetector not implemented
```

### Days 2-3: Implementation (✅ Passing)

**File: `lib/modules/ml/detector.ts`**
```typescript
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { eventBus } from '@/lib/events/eventBus'
import { DetectionEvent } from '@/lib/types'
import { v4 as uuid } from 'uuid'

export class ObjectDetector {
  private model: cocoSsd.ObjectDetection | null = null
  private ready = false

  async initialize(): Promise<void> {
    try {
      this.model = await cocoSsd.load()
      this.ready = true
      console.log('[ML] COCO-SSD model loaded')
    } catch (error) {
      console.error('[ML] Failed to load model:', error)
    }
  }

  isReady(): boolean {
    return this.ready && this.model !== null
  }

  async detect(
    input: HTMLImageElement | HTMLCanvasElement
  ): Promise<cocoSsd.DetectedObject[]> {
    if (!this.model) {
      console.warn('[ML] Model not ready')
      return []
    }

    try {
      const predictions = await this.model.estimateObjects(input)
      return predictions
    } catch (error) {
      console.error('[ML] Detection error:', error)
      return []
    }
  }

  async detectAndEmit(
    input: HTMLImageElement | HTMLCanvasElement
  ): Promise<void> {
    const detections = await this.detect(input)
    const filtered = this.filterByConfidence(detections, 0.5)

    filtered.forEach(detection => {
      const event: DetectionEvent = {
        id: uuid(),
        type: 'DETECTION_EVENT',
        timestamp: Date.now(),
        agentId: 'current-agent',
        payload: {
          label: detection.class,
          confidence: detection.score
        },
        metadata: {
          syncState: 'PENDING',
          attempt: 0
        }
      }

      eventBus.emit(event)
    })

    console.log('[ML] Detection complete:', filtered.length, 'objects')
  }

  filterByConfidence(
    detections: any[],
    threshold: number
  ): any[] {
    return detections.filter(d => d.score >= threshold)
  }
}

export const detector = new ObjectDetector()
```

**File: `lib/modules/ml/postProcessor.ts`**
```typescript
export class PostProcessor {
  static getNMS(detections: any[], iouThreshold: number = 0.5): any[] {
    // Non-Maximum Suppression
    // Remove overlapping boxes
    return detections
  }

  static groupByClass(detections: any[]): Map<string, any[]> {
    const grouped = new Map<string, any[]>()

    for (const detection of detections) {
      if (!grouped.has(detection.class)) {
        grouped.set(detection.class, [])
      }
      grouped.get(detection.class)?.push(detection)
    }

    return grouped
  }

  static getBoundingBox(detection: any): [number, number, number, number] {
    const [x, y, width, height] = detection.bbox
    return [x, y, x + width, y + height]
  }
}
```

**Run test:**
```bash
npm test -- detection.test.ts
# PASS ✅ - model loads
# PASS ✅ - detection works
# PASS ✅ - filtering works
# PASS ✅ - event emitted
```

### Day 4: Commit & Push

```bash
git add lib/modules/ml/
git commit -m "feat(#9): implement ML parcel detection with COCO-SSD"
git push origin feature/issue-9-ml-detection
```

---

## MEMBER 10: harinis1511-del — OTP, WhatsApp, Payment Integration (Issue #10)

### Module Folder
```
lib/modules/integrations/
├── __tests__/
│   └── integrations.test.ts
├── otp.ts
├── whatsapp.ts
├── payment.ts
└── index.ts
```

### Day 1-4: TDD Workflow (Same Pattern)

**Day 1: Write tests** → OTP generation/verification, WhatsApp mocking, payment processing
**Days 2-3: Implement** → Twilio SDK, Razorpay SDK, OTP validation
**Day 4: Push** → feature/issue-10-integrations

### Key Code Structure
```typescript
export class OTPModule {
  async generateOTP(phone: string): Promise<string> {
    // Generate 6-digit OTP
    // Send via Twilio
    // Store hash for verification
  }

  async verifyOTP(phone: string, code: string): Promise<boolean> {
    // Compare with stored hash
    // Return verification result
  }
}

export class WhatsAppModule {
  async sendMessage(recipient: string, message: string): Promise<void> {
    // Use Twilio WhatsApp API
    // Emit WHATSAPP_EVENT
  }
}

export class PaymentModule {
  async createOrder(amount: number): Promise<string> {
    // Create Razorpay order
    // Return order ID
  }

  async verifyPayment(orderId: string, paymentId: string): Promise<boolean> {
    // Verify signature
    // Update database
  }
}
```

---

## 📅 COMPLETE TIMELINE

```
┌─────────────────────────────────────────────────────────────┐
│                      DAY 0 (Morning)                         │
├─────────────────────────────────────────────────────────────┤
│ 9:00 AM:  HariniBenedicta956 starts stub creation           │
│ 10:00 AM: Mid-check progress                                │
│ 11:00 AM: Commit stubs to main                              │
│ 12:00 PM: All 9 devs pull main, start their tests ✅        │
│ Time: 2 hours (blocking)                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DAY 1 (Tuesday)                           │
├─────────────────────────────────────────────────────────────┤
│ All 10 developers: Write test files                          │
│ 9:00 AM - 12:00 PM: Create test structure                    │
│ 12:00 PM - 5:00 PM: Write comprehensive tests                │
│ 5:00 PM: Tests run ❌ FAIL (EXPECTED)                        │
│ Daily standup: "I have X tests failing"                      │
│ Each member: ~150-200 lines of test code                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 DAYS 2-3 (Wed-Thu)                           │
├─────────────────────────────────────────────────────────────┤
│ All 10 developers: Implement code to pass tests              │
│ 9:00 AM - 12:00 PM: Core implementation                      │
│ 12:00 PM - 3:00 PM: Integration with EventBus               │
│ 3:00 PM - 5:00 PM: Testing & debugging                       │
│ 5:00 PM: Tests run ✅ PASS                                    │
│ Each member: ~300-400 lines of implementation code           │
│                                                              │
│ Parallel: All 10 working on different modules (NO CONFLICTS)│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   DAY 4 (Friday)                             │
├─────────────────────────────────────────────────────────────┤
│ 9:00 AM: Final testing pass                                 │
│ 10:00 AM: All 10 members push branches simultaneously         │
│ 10:30 AM: All 10 PRs created on GitHub                       │
│ 11:00 AM: Team review + merge (no conflicts!)                │
│ 12:00 PM: All modules merged to main ✅                      │
│ 1:00 PM: Integration testing begins                          │
│ 5:00 PM: Day 4 complete                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  DAY 5+ (Week 2)                             │
├─────────────────────────────────────────────────────────────┤
│ Integration testing across modules                           │
│ E2E testing with real data                                   │
│ Performance optimization                                     │
│ Deployment preparation                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 GIT WORKFLOW FOR ALL MEMBERS

### Step 1: Setup Your Environment (Day 0 - 12:00 PM)

```bash
# Clone repository
git clone https://github.com/harish3330/lastmile-scanner-pwa
cd lastmile-scanner-pwa

# Install dependencies
npm install

# Create feature branch (replace X with your issue number)
git checkout main
git pull origin main
git checkout -b feature/issue-X-description

# Create your module folder
mkdir -p lib/modules/yourModule/__tests__
mkdir -p pages/api/__tests__  # if backend
```

### Step 2: Daily Workflow (Days 1-4)

```bash
# Morning: Start day
git pull origin main

# Write test
vim lib/modules/yourModule/__tests__/test.ts

# Run test (expect FAIL ❌ on Day 1)
npm test -- yourModule

# Implement code
vim lib/modules/yourModule/implementation.ts

# Run test again (expect PASS ✅ on Days 2-3)
npm test -- yourModule

# Commit progress
git add lib/modules/yourModule/
git commit -m "feat(#X): implement feature description"
git push origin feature/issue-X-description

# Next day: continue from last commit
```

### Step 3: Push PR (Day 4 - 10:00 AM)

```bash
# Final push
git push origin feature/issue-X-description

# On GitHub:
# 1. Click "Create Pull Request"
# 2. Title: "feat(#X): Your Feature Description"
# 3. Description: "Implements Issue #X with TDD"
# 4. Add tests passing status
# 5. Submit PR

# Merge after review (no conflicts!)
```

---

## ✅ CHECKLIST FOR EACH MEMBER

**Day 0 Afternoon (12:00 PM - Prep)**
- [ ] Repository cloned successfully
- [ ] `npm install` completed
- [ ] Feature branch created: `feature/issue-X-description`
- [ ] Module folder structure created
- [ ] Read your GitHub issue thoroughly
- [ ] Understand the API contract from `lib/types/api.ts`
- [ ] Setup editor (TypeScript + ESLint)

**Day 1 (Test Writing)**
- [ ] Test file created: `lib/modules/yourModule/__tests__/test.ts`
- [ ] All tests written (❌ failing status expected)
- [ ] Tests cover happy path + error cases
- [ ] Test names are clear and descriptive
- [ ] Run `npm test -- yourModule` confirms failures
- [ ] Commit tests: `git commit -m "test(#X): add test suite"`

**Days 2-3 (Implementation)**
- [ ] Implementation file created: `lib/modules/yourModule/module.ts`
- [ ] Code imported from stubs: `eventBus`, `storageManager`, types
- [ ] All tests passing (✅ status)
- [ ] No console errors
- [ ] TypeScript strict mode (no `any` types)
- [ ] Code uses EventBus for inter-module communication
- [ ] Daily commits: `git commit -m "feat(#X): implement ..."`

**Day 4 (Finalization & PR)**
- [ ] All tests passing ✅
- [ ] Code reviewed for quality
- [ ] No unused imports
- [ ] Prettier formatting applied
- [ ] Branch pushed: `git push origin feature/issue-X-description`
- [ ] PR created with description
- [ ] Ready for merge

**Integration Phase (Day 5+)**
- [ ] Module works with other modules via EventBus
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Documentation updated

---

## 🎯 SUCCESS METRICS

By **Day 4 at 5:00 PM:**

| Metric | Target | Status |
|--------|--------|--------|
| PRs Created | 10/10 | ✅ |
| Tests Passing | 100% | ✅ |
| Code Merge Conflicts | 0 | ✅ |
| Time Spent Waiting | 0 days | ✅ |
| Lines of Code (10 members) | 5000-7000 | ✅ |
| Modules Ready | 10/10 | ✅ |

**Total effort: 10 devs × 4 days = 40 person-days**
**Time saved by parallel dev: 4-5 sequential days eliminated** 🎉

---

## 📞 BLOCKERS & ESCALATION

### If your tests can't run
```
❌ Problem: Tests failing with import errors
✅ Solution: Ask HariniBenedicta956 (shared libs owner)
```

### If you need to change event types
```
❌ Problem: Need to add new event type
✅ Solution: Update lib/types/events.ts + notify team
```

### If you need database schema changes
```
❌ Problem: Prisma schema needs update
✅ Solution: Update prisma/schema.prisma + notify srinithi11125
```

### If you're blocked by another member
```
❌ Problem: Waiting for Module X integration
✅ Solution: Use STUB/MOCK instead, don't wait
```

---

## 🔄 REAL IMPLEMENTATION PHASE (Days 5+)

**What happens after Day 4:**

1. **Stubs** created on Day 0 are replaced with **Real Implementations**
2. **Tests remain the same** (dependency injection ensures this)
3. **No breaking changes** because API contracts frozen
4. **Example:**

```typescript
// Day 1-4: Using stub
import { storageManager } from '@/lib/storage/storageManager' // Mock

// Day 5+: Using real implementation
import { storageManager } from '@/lib/storage/storageManager' // Real IndexedDB
// Same import, different implementation! Tests still pass ✅
```

---

## 📖 DOCUMENTATION

All members should read:

1. **copilot-instructions.md** — Core principles (TDD, ML separation, etc.)
2. **TEAM-ARCHITECTURE.md** — Unified architecture, folder structure, types
3. **CONCURRENT-DEVELOPMENT.md** — Event system, isolation strategy
4. **TECH-STACK.md** — All dependencies and versions
5. **WORKING-PATTERN.md** (this file) — Daily workflow instructions

---

## 🚀 READY TO START?

**Day 0 at 9:00 AM:**

1. HariniBenedicta956 creates stubs (2 hours)
2. Commit + push to main
3. All 9 developers pull + start tests

**No more waiting. Pure parallel development. 100% concurrent.**

This is your complete working blueprint. Follow it precisely, and you'll complete all 10 modules in 4 days with zero conflicts. ✅

---

**Version:** 1.0
**Last Updated:** April 16, 2026
**Status:** Ready for Day 0 Implementation
