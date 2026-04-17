// ============================================================
//  services/eventBus.ts  — ISSUE #2 placeholder
//  Global event emitter — used by ALL modules
//  Issue #2 (Frontend) SUBSCRIBES to events for UI updates
//  Issue #3 (Sync)     SUBSCRIBES to store events in IndexedDB
//  Feature modules (#4-#10) EMIT events here
// ============================================================
import { AppEvent, EventType } from '@/lib/types/events';

class EventBus {
  _listeners: Map<EventType, Function[]>;

  constructor() {
    this._listeners = new Map();
  }

  /**
   * Subscribe to an event type.
   * @param type - The event type alias
   * @param handler - Callback function
   * @returns unsubscribe function
   */
  subscribe<T extends AppEvent>(type: T['type'], handler: (event: T) => void) {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, []);
    }
    this._listeners.get(type)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this._listeners.get(type) ?? [];
      const idx = handlers.indexOf(handler);
      if (idx !== -1) handlers.splice(idx, 1);
    };
  }

  /**
   * Emit an event to all subscribers.
   * @param event - The fully typed AppEvent
   */
  emit(event: AppEvent) {
    const handlers = this._listeners.get(event.type) ?? [];
    handlers.forEach(h => h(event));

    // Log in dev
    if (process.env.NODE_ENV === 'development') {
      console.debug('[EventBus] emit:', event.type, event);
    }
  }

  /** Remove all listeners (use in tests) */
  clear() {
    this._listeners.clear();
  }
}

// Singleton — shared across ALL modules
export const eventBus = new EventBus();
export default eventBus;

// ── How Issue #2 (Frontend) uses this: ──────────────────────
//
//  import { eventBus } from '@/lib/events/eventBus';
//
//  // Listen for scan events to refresh UI
//  useEffect(() => {
//    const unsub = eventBus.subscribe('SCAN_EVENT', (event) => {
//      setScanHistory(prev => [event.payload, ...prev]);
//    });
//    return unsub; // cleanup on unmount
//  }, []);
//
// ── Rules (from TEAM-ARCHITECTURE.md Rule 2): ───────────────
//  ✅ Issue #2 may SUBSCRIBE to listen for UI updates
//  ❌ Issue #2 must NOT emit events (no SCAN_EVENT, etc.)
//  ❌ Issue #2 must NOT call other modules directly
// ────────────────────────────────────────────────────────────
