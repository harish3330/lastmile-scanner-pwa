# Geofence Module (Issue #7)

**Geo-Fencing and Boundary Detection System**

Detects whether delivery agents are inside or outside defined geographic zones, triggers alerts when boundaries are crossed, and emits standardized events for downstream processing.

## Architecture

### Module Structure

```
lib/modules/geofence/
├── algorithms.ts           # Pure functions (Haversine distance, boundary checks)
├── types.ts               # Module-specific types
├── geofenceService.ts     # Service layer (state tracking, event emission)
├── syncHandler.ts         # Event integration (listens to LOCATION_EVENT)
├── index.ts              # Public API exports
├── README.md             # This file
└── __tests__/
    ├── algorithms.test.ts
    └── geofenceService.test.ts
```

### Key Principles

1. **Pure Algorithms Layer** (`algorithms.ts`)
   - No side effects, no state, no API calls
   - Fully testable and framework-agnostic
   - Uses Haversine formula for distance calculations
   - Returns calculated results only

2. **Service Layer** (`geofenceService.ts`)
   - Tracks agent state (inside/outside each zone)
   - Emits `GEOFENCE_EVENT` on boundary transitions
   - Maintains in-memory state for quick lookups
   - Event emission via global event bus

3. **Event Integration** (`syncHandler.ts`)
   - Listens to `LOCATION_EVENT` from GPS tracking module
   - Triggers boundary checks automatically
   - Handles event subscription/unsubscription

## Usage

### 1. Initialize Module (App Startup)

```typescript
import { initializeGeofenceSyncHandler, setGeofenceEventBus } from '@/lib/modules/geofence'
import { eventBus } from '@/lib/events/eventBus'

// Set up event bus
setGeofenceEventBus(eventBus)

// Load zones from database or API
const zones = await fetchGeofenceZones()

// Initialize event handlers
const unsubscribe = initializeGeofenceSyncHandler(eventBus, zones)

// On app shutdown
// unsubscribe()
```

### 2. Check Location Against Zones

```typescript
import { geofenceService } from '@/lib/modules/geofence'

// Check agent's current location
const transitions = await geofenceService.checkLocationAgainstZones(
  agentId,
  latitude,
  longitude,
  zones
)

// transitions[0] = {
//   zoneId: 'zone-1',
//   zoneName: 'Warehouse A',
//   transition: 'entered' | 'exited' | 'no_change',
//   distance: 250.5, // meters
//   latitude: 40.7128,
//   longitude: -74.006,
//   timestamp: 1713375600000
// }
```

### 3. Get Current Zone Status

```typescript
const status = await geofenceService.getZoneStatus(
  agentId,
  zone,
  latitude,
  longitude
)

// status = {
//   isInside: true,
//   distance: 250.5,
//   lastCheck: 1713375600000
// }
```

### 4. Listen to Geofence Events

```typescript
import { eventBus } from '@/lib/events/eventBus'

eventBus.subscribe('GEOFENCE_EVENT', (event) => {
  console.log(`Agent ${event.agentId} ${event.payload.status} zone ${event.payload.zoneName}`)
  // Trigger notifications, update UI, store to database, etc.
})
```

## API Events

### GEOFENCE_EVENT

Emitted when agent enters or exits a zone boundary.

```typescript
{
  type: 'GEOFENCE_EVENT',
  agentId: 'agent-123',
  timestamp: 1713375600000,
  payload: {
    zoneId: 'zone-1',
    zoneName: 'Warehouse A',
    status: 'entered' | 'exited',
    distance: 250.5,        // meters from zone center
    latitude: 40.7128,
    longitude: -74.006,
    timestamp: 1713375600000
  },
  metadata: {
    syncState: 'PENDING',   // Will be synced to backend
    attempt: 0
  }
}
```

## Database Schema

Stored via Prisma in `prisma/schema.prisma`:

```prisma
model GeoZone {
  id              String    @id @default(cuid())
  name            String
  latitude        Float
  longitude       Float
  radius          Float     // meters
  alertThreshold  Float?    // Optional: distance to trigger pre-alert
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  alerts          GeofenceAlert[]
}

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
```

## Testing

### Run All Geofence Tests

```bash
npm test -- lib/modules/geofence
```

### Run Specific Test Suite

```bash
npm test -- lib/modules/geofence/algorithms.test.ts
npm test -- lib/modules/geofence/geofenceService.test.ts
```

### Watch Mode (for development)

```bash
npm test -- lib/modules/geofence --watch
```

### Coverage Report

```bash
npm test -- lib/modules/geofence --coverage
```

Expected coverage:
- Algorithms: 95%+ (pure functions, fully testable)
- Service: 85%+ (includes event emission mocking)

## Acceptance Criteria ✅

- [x] Boundary detection works correctly (Haversine algorithm tested)
- [x] Alerts triggered when crossing zone boundary (event-driven)
- [x] Events stored properly (via event bus → IndexedDB → backend sync)
- [x] Multiple zones supported simultaneously
- [x] State tracking prevents duplicate events
- [x] Framework-agnostic and testable architecture
- [x] No modifications to other modules
- [x] Full unit test coverage

## Performance Considerations

- **Calculation Time**: ~0.5ms per zone check (negligible)
- **State Storage**: ~100 bytes per tracked agent
- **Event Emission**: Synchronous (non-blocking)
- **Scalability**: Handles 100+ zones efficiently

For 1000+ zones, consider:
1. Spatial indexing (quadtree, R-tree)
2. Lazy loading zones by region
3. Batch processing

## Future Enhancements

1. **Polygon Boundaries** — Replace circle zones with arbitrary polygons
2. **Alert Thresholds** — Pre-alert when within X meters of boundary
3. **Do-Not-Go Zones** — Automatic alerts (no manual verification)
4. **Historical Geofence Reports** — Query zone visits over time
5. **Geofence Analytics** — Time spent in each zone, entry/exit patterns
6. **Multi-Zone Priorities** — Handle overlapping zones intelligently

## Troubleshooting

### Events Not Emitting?

1. Check `setGeofenceEventBus()` called during init
2. Verify `LOCATION_EVENT` is being emitted by GPS module
3. Check browser console for errors
4. Test manually: `geofenceService.checkLocationAgainstZones(...)`

### Incorrect Distances?

1. Verify latitude/longitude values are correct (not swapped)
2. Check units are in degrees (not radians)
3. Use Haversine calculator to verify: https://www.movable-type.co.uk/scripts/latlong.html

### Agent State Growing Unbounded?

1. Call `geofenceService.clearAgentState(agentId)` on logout
2. Call `clearGeofenceAgentState(agentId)` via syncHandler
3. Monitor with `getGeofenceDiagnostics()`

## Dependencies

- **uuid** — For generating event IDs
- **jest** — For testing (dev)
- **Haversine formula** — No external library (implemented from scratch)

## Author & Maintainer

- **Issue #7**: Rubikadevi5
- **Review**: All team members via PR
