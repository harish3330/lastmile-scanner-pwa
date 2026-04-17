# ISSUE #8 - Backend APIs & Database Setup

**Owner:** srinithi11125  
**Status:** ✅ Implementation Complete  
**Last Updated:** April 17, 2026

---

## What's Implemented

### 1. **Prisma Database Schema** (`prisma/schema.prisma`)
- ✅ Agent model (delivery agents)
- ✅ Scan model (QR/Barcode records from Issue #4)
- ✅ Location model (GPS tracking from Issue #6)
- ✅ Delivery model (status tracking from Issue #2)
- ✅ Payment model (cash collection & discrepancies)
- ✅ SyncQueue model (offline event storage from Issue #3)

### 2. **Service Layer** (`services/`)
- ✅ `scanService.ts` - Record and query scans
- ✅ `paymentService.ts` - Handle payments, detect mismatches
- ✅ `deliveryService.ts` - Track delivery status and proofs
- ✅ `locationService.ts` - Track agent locations, calculate distances
- ✅ `syncService.ts` - Process sync queue from offline storage

### 3. **API Handlers** (`pages/api/`)
- ✅ `POST /api/scan` - Record QR/Barcode scans
- ✅ `POST /api/location` - Log agent location (GPS)
- ✅ `POST /api/delivery` - Record delivery status updates
- ✅ `POST /api/payment` - Handle cash collection & detect mismatches
- ✅ `POST /api/sync` - Sync queued events from offline
- ✅ `POST /api/detect` - Placeholder for Issue #9 (ML detection)

### 4. **Test Suite** (`pages/api/__tests__/api.test.ts`)
- ✅ Handler existence checks
- ✅ HTTP method validation (405 for non-POST)
- ✅ Request validation (400 for missing fields)
- ✅ Integration tests
- ⏳ Database integration tests (requires DB setup)

---

## File Structure

```
Issue #8 Files Only (No Changes to Other Modules)
├── prisma/
│   └── schema.prisma                 ← Database definitions
│
├── lib/
│   └── db/
│       └── client.ts                 ← Prisma client
│
├── services/
│   ├── scanService.ts                ← Scan business logic
│   ├── paymentService.ts             ← Payment business logic
│   ├── deliveryService.ts            ← Delivery business logic
│   ├── locationService.ts            ← Location business logic
│   └── syncService.ts                ← Sync business logic
│
└── pages/api/
    ├── scan.ts                       ← POST /api/scan handler
    ├── location.ts                   ← POST /api/location handler
    ├── delivery.ts                   ← POST /api/delivery handler
    ├── payment.ts                    ← POST /api/payment handler
    ├── sync.ts                       ← POST /api/sync handler
    ├── detect.ts                     ← POST /api/detect handler (stub for Issue #9)
    └── __tests__/
        └── api.test.ts               ← Test suite
```

---

## Setup Instructions

### 1. **Install Dependencies** (if not already done)
```bash
npm install
```

### 2. **Set Up Database**

Create `.env.local` in project root:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/lastmile_scanner"
NEXT_PUBLIC_API_URL="http://localhost:3000"
NODE_ENV="development"
```

Generate Prisma client:
```bash
npx prisma generate
```

Run migrations:
```bash
npx prisma migrate dev --name initial
```

(Note: Requires PostgreSQL running locally)

### 3. **Run Tests** (without database)
```bash
# All API tests
npm test -- api.test.ts

# Watch mode
npm test -- api.test.ts --watch

# With coverage
npm test -- api.test.ts --coverage
```

### 4. **Run API Locally**
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 5. **Test APIs with curl**

**Record a scan:**
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-001",
    "qrCode": "PARCEL-12345",
    "timestamp": 1712268600000,
    "location": { "lat": 12.97, "lng": 77.59 }
  }'
```

**Record location:**
```bash
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-001",
    "latitude": 12.97,
    "longitude": 77.59,
    "accuracy": 10
  }'
```

**Record payment:**
```bash
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN-001",
    "agentId": "agent-001",
    "expectedAmount": 500,
    "collectedAmount": 500,
    "paymentMode": "cash"
  }'
```

**Record delivery:**
```bash
curl -X POST http://localhost:3000/api/delivery \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-001",
    "deliveryId": "DEL-001",
    "status": "completed"
  }'
```

---

## API Contracts

### POST `/api/scan`
**Request:**
```typescript
{
  agentId: string          // Agent ID making the scan
  qrCode: string           // QR code value
  barcode?: string         // Optional barcode value
  timestamp: number        // Timestamp in milliseconds
  location?: {
    lat: number
    lng: number
  }
}
```

**Response (200):**
```typescript
{
  scanId: string
  status: 'success'
  message: string
  timestamp: number
}
```

### POST `/api/location`
**Request:**
```typescript
{
  agentId: string
  latitude: number
  longitude: number
  accuracy: number         // GPS accuracy in meters
  timestamp?: number
}
```

**Response (200):**
```typescript
{
  status: 'logged'
  locationId: string
  timestamp: number
}
```

### POST `/api/delivery`
**Request:**
```typescript
{
  agentId: string
  deliveryId: string
  status: 'started' | 'in_progress' | 'completed' | 'failed'
  imageProof?: string      // Base64 or URL
  notes?: string
}
```

**Response (200):**
```typescript
{
  status: 'success'
  deliveryId: string
  timestamp: number
}
```

### POST `/api/payment`
**Request:**
```typescript
{
  transactionId: string
  agentId: string
  expectedAmount: number
  collectedAmount: number
  paymentMode: 'cash' | 'card' | 'upi'
  timestamp?: number
}
```

**Response (200):**
```typescript
{
  transactionId: string
  status: 'matched' | 'mismatch'    // Auto-detected
  discrepancy: number                // Collection - Expected
  timestamp: number
}
```

### POST `/api/sync`
**Request:**
```typescript
{
  events: AppEvent[]        // Array of offline events from Issue #3
}
```

**Response (200):**
```typescript
{
  synced: number
  failed: number
  status: 'success' | 'partial' | 'error'
  errors?: [{ eventId: string; error: string }]
}
```

---

## Integration with Other Issues

### Receives Data From:
- **Issue #4 (Scanner)** → SCAN_EVENT → `/api/scan`
- **Issue #6 (GPS Tracker)** → LOCATION_EVENT → `/api/location`
- **Issue #2 (Frontend)** → Delivery updates → `/api/delivery`
- **You** → Payment/cash updates → `/api/payment`
- **Issue #3 (Sync Manager)** → Offline queue → `/api/sync`

### Feeds Data To:
- **PostgreSQL Database** (Prisma)
- **Issue #9 (ML Module)** → `/api/detect` (receives and provides results)
- **Issue #10 (Integrations)** → Can query payment/delivery status

---

## Key Features

### ✅ Implemented
- [x] All 6 API endpoints created
- [x] Prisma schema with all models
- [x] Business logic layer (services)
- [x] Request validation
- [x] Error handling (400 for invalid, 405 for wrong method)
- [x] Test suite with handler validation
- [x] Cash discrepancy detection (auto-flags mismatches)
- [x] Location history tracking
- [x] Delivery status tracking with proof storage
- [x] Sync queue processing

### ⏳ Pending
- [ ] Database integration tests (requires PostgreSQL)
- [ ] Authentication/authorization (Issue #10 may add this)
- [ ] Rate limiting
- [ ] Input sanitization (security hardening)
- [ ] ML Integration (Issue #9)

---

## Test Results

All tests check:
1. ✅ Handlers are functions and callable
2. ✅ Non-POST requests return 405
3. ✅ Missing required fields return 400
4. ✅ Response structure is correct
5. ✅ Error messages are defined

Run tests with:
```bash
npm test -- api.test.ts
```

**Expected Output:**
```
PASS  pages/api/__tests__/api.test.ts
  ISSUE #8 - Backend APIs
    POST /api/scan - Record QR/Barcode Scans
      ✓ should accept POST request and have proper handler
      ✓ should reject non-POST requests
      ✓ should handle missing required fields
    POST /api/location - Log Agent Location
      ✓ should have location handler
      ✓ should reject non-POST requests
      ✓ should handle missing required fields
    ...
```

---

## Next Steps

1. **For Harini (Issue #3):**
   - Complete IndexedDB implementation
   - When done, `/api/sync` will receive real offline events

2. **For Issue #9 (ML Module):**
   - Implement `/api/detect` with actual COCO-SSD inference
   - Store results in Detection table

3. **For Integration:**
   - Day 5+: Run full E2E tests
   - Day 6+: Deploy to staging

---

## Questions?
See [TEAM-ARCHITECTURE.md](../TEAM-ARCHITECTURE.md) for full system design.
