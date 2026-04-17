// Service Worker Type Definitions
export interface CacheStrategy {
  name: string;
  cacheName: string;
  strategy: 'network-first' | 'cache-first';
  urlPattern: RegExp;
}

export interface ServiceWorkerMessage {
  type: string;
  payload?: Record<string, any>;
}

export interface SyncEvent {
  id: string;
  type: string;
  timestamp: number;
  agentId: string;
  payload: Record<string, any>;
  metadata: {
    syncState: 'PENDING' | 'SYNCED' | 'FAILED';
    attempt: number;
    lastAttemptTime?: number;
  };
}

export interface SyncQueueItem {
  eventId: string;
  event: SyncEvent;
  addedAt: number;
  syncAttempts: number;
}

export interface SyncResponse {
  synced: number;
  failed: number;
  errors?: Array<{
    eventId: string;
    reason: string;
  }>;
}

export interface OfflineState {
  isOffline: boolean;
  pendingSyncCount: number;
  lastSyncTime?: number;
}
