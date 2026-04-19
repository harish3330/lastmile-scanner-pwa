---
description: "Use when: working on lastmile-scanner-pwa. Follow modular architecture, TypeScript for type safety, loosely-coupled frontend/backend design, and Test-Driven Development."
---

# Last-Mile Scanner PWA — Copilot Instructions

## Development Methodology

**Test-Driven Development (TDD):** Write unit tests FIRST. Let them fail. Then implement code to make them pass.

---

## Architectural Principles

Follow these four principles throughout development:

### 1. Separate ML Inference Layer

**Principle:** Isolate machine learning logic into a dedicated, reusable module independent of framework/routing.

**Implementation:**
- **Location:** `lib/ml/` folder (framework-agnostic)
  - `lib/ml/modelLoader.ts` — Load & cache TensorFlow.js models
  - `lib/ml/detector.ts` — Core detection logic (takes image, returns bboxes + confidence)
  - `lib/ml/postProcessor.ts` — Confidence filtering, NMS, parcel counting
  - `lib/ml/types.ts` — Shared types (`Detection`, `BoundingBox`, etc.)
  - `lib/ml/__tests__/detector.test.ts` — Unit tests (TDD)

**Rules:**
- ML module must NOT import Next.js, React, or any UI framework
- ML module receives raw image (Blob, File, or Uint8Array) and returns plain objects, never JSX
- All model weights go in `public/models/` with lazy loading
- Export a single `ModelManager` class with methods: `load()`, `detect()`, `dispose()`
- Write unit tests in `lib/ml/__tests__/` (runnable independently)

**Benefit:** If we switch from Next.js to SvelteKit/Remix, ML layer migrates without changes.

---

### 2. Use TypeScript for Type Safety

**Principle:** Strong types make future migrations safer and catch integration bugs early.

**Implementation:**
- **All files** `.ts` or `.tsx` (no `.js` unless dynamic imports require it)
- **Shared types:** `lib/types/index.ts`
  ```typescript
  export interface DetectionResult {
    timestamp: number;
    imageBase64: string;
    detections: Parcel[];
    confidence: number;
    inferenceTime: number;
  }

  export interface Parcel {
    id: string;
    bbox: [x1, y1, x2, y2];
    confidence: number;
    label: string;
  }
  ```
- **Frontend and Backend share types:** Import from `lib/types/` in both `pages/` and `api/`
- **Strict mode:** Enable `"strict": true` in `tsconfig.json`
- **No `any` types:** Use `unknown` + type guards if truly uncertain

**Benefits:**
- API contracts are type-safe; frontend/backend stay in sync
- If framework changes, TypeScript catches breaking changes fast
- Easier to review PRs (you see type mismatches immediately)

---

### 3. Keep Frontend/Backend Loosely Coupled

**Principle:** Frontend and backend communicate via well-defined API contracts, not shared code (except types).

**Implementation:**

**API Contract Pattern:**
```typescript
// lib/types/api.ts (shared)
export interface DetectRequest {
  imageBase64: string;
  agentId: string;
  timestamp: number;
  location?: { lat: number; lng: number };
}

export interface DetectResponse {
  parcelCount: number;
  confidence: number;
  detections: Parcel[];
  syncId?: string; // For offline sync
}
```

**Frontend:** `pages/detect.jsx`
```typescript
const response = await fetch('/api/detect', {
  method: 'POST',
  body: JSON.stringify(request) // typed as DetectRequest
})
const result: DetectResponse = await response.json()
```

**Backend:** `pages/api/detect.ts`
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse<DetectResponse>) {
  const input = req.body as DetectRequest // parse as contract
  // ... validate, store, return
  res.json(result)
}
```

**Rules:**
- **No cross-imports:** Frontend `pages/` must NOT import from `pages/api/`
- **API versioning:** If DetectResponse changes, bump `/api/v2/detect` (old `/api/detect` still works)
- **Independent deployment:** Backend can update without redeploying frontend (via service worker caching)
- **Offline queue:** Frontend queues requests locally, backend validates on sync (idempotent)

**Folder structure:**
```
lib/
├── types/
│   ├── api.ts          (Request/Response contracts)
│   ├── ml.ts           (ML interfaces)
│   └── db.ts           (Database schemas)
├── ml/                 (Framework-agnostic ML)
├── api-client.ts       (Frontend: HTTP calls, uses lib/types/api.ts)
└── db.ts               (Backend: PostgreSQL helpers)

pages/
├── detect.jsx          (UI, imports lib/api-client, lib/types/api)
└── api/
    └── detect.ts       (Handler, imports lib/db, lib/types/api)
```

**Benefit:** If we swap Next.js → Remix, only `pages/api/` folder structure changes. Frontend logic + API contract stay the same.

---

### 4. Test-Driven Development (TDD)

**Principle:** Write unit tests FIRST. Let them fail initially. Then implement code to make tests pass.

**Workflow:**
1. **Write test first** — Test file describes expected behavior before implementation exists
2. **Let it fail** — Run test and confirm it fails ❌ (do NOT skip or ignore failing tests)
3. **Implement code** — Write minimal code to make the test pass
4. **Refactor** — Clean up code while keeping tests green

**Test Structure:**
```
lib/
├── ml/
│   ├── detector.ts
│   └── __tests__/
│       └── detector.test.ts      (Test for ML inference)
├── api-client.ts
└── __tests__/
    └── api-client.test.ts        (Test for API calls)

pages/
└── api/
    ├── detect.ts
    └── __tests__/
        └── detect.test.ts        (Test for API handler)
```

**Testing Tools:**
- **Framework:** Jest or Vitest (Next.js default)
- **ML Tests:** Mock TensorFlow.js models with sample images
- **API Tests:** Mock PostgreSQL with in-memory database or fixtures
- **Frontend Tests:** React Testing Library for component behavior

**Example TDD for Detector:**
```typescript
// lib/ml/__tests__/detector.test.ts (WRITE THIS FIRST)
import { ModelManager } from '../modelLoader'

describe('ModelManager.detect()', () => {
  it('should return empty array when no parcels detected', async () => {
    const manager = new ModelManager()
    await manager.load()
    const emptyImage = new Uint8Array(640 * 480 * 3) // blank image
    const result = await manager.detect(emptyImage)
    expect(result).toEqual([]) // TEST FAILS ❌
  })

  it('should return parcel with confidence score', async () => {
    const manager = new ModelManager()
    await manager.load()
    const imageWithParcel = loadFixture('parcel.jpg')
    const result = await manager.detect(imageWithParcel)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].confidence).toBeGreaterThan(0.5) // TEST FAILS ❌
  })
})
```

Then implement:
```typescript
// lib/ml/detector.ts (IMPLEMENT AFTER TEST FAILS)
export class ModelManager {
  async detect(imageData: Uint8Array): Promise<Detection[]> {
    // Implement to make tests pass
  }
}
```

**Rules:**
- Do NOT write code before a test exists
- Do NOT skip/ignore failing tests — they describe incomplete work
- Do NOT delete tests that fail — fix the implementation instead
- All critical paths must have tests: ML inference, API contracts, sync logic, edge cases

**Benefits:**
- Tests act as living documentation of expected behavior
- Refactoring is safe (tests catch regressions immediately)
- Easier code reviews (tests show intent)
- Fewer production bugs (errors caught early)

---

## Code Review Checklist

When reviewing any PR:
- [ ] Test written FIRST (exists before implementation)
- [ ] All tests pass (green ✅) or explicitly document why they're skipped
- [ ] ML logic lives in `lib/ml/`, not in React components
- [ ] All `.ts`/`.tsx` files are TypeScript (no `any` without justification)
- [ ] Frontend/API use shared contracts from `lib/types/api.ts`
- [ ] No circular imports between frontend and backend
- [ ] Database queries are in `lib/db.ts` or models, not in API handlers

## Migration Safety

If the team decides to switch frameworks (e.g., Next.js → SvelteKit):
- **ML layer:** Reuse as-is (no framework deps)
- **Types:** Reuse as-is (plain TypeScript)
- **API contract:** Reuse as-is (just re-implement endpoints)
- **Tests:** Reuse as-is (framework-agnostic testing)
- **Only change:** `pages/` folder → `src/routes/` (or similar in new framework)

---

## Questions?

Reference this file when unsure about architectural decisions. If a change violates these principles, discuss with the team before proceeding.
