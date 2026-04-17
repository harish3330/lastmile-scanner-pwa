// Background Sync Handler for Service Worker
import type { SyncEvent } from '@/lib/types/serviceWorker';
import { eventBus } from '../events/eventBus';
import { SYNC_EVENTS } from '../constants/syncEvents';

export const SYNC_TAG = 'sync-pending-events';
export const MAX_SYNC_RETRIES = 3;
export const INITIAL_RETRY_DELAY = 1000; // 1 second

export interface SyncRetryConfig {
  maxRetries: number;
  initialDelay: number;
  backoffMultiplier: number;
}

export class BackgroundSyncManager {
  private config: SyncRetryConfig = {
    maxRetries: MAX_SYNC_RETRIES,
    initialDelay: INITIAL_RETRY_DELAY,
    backoffMultiplier: 2,
  };

  /**
   * Register background sync (if supported by browser)
   */
  async registerBackgroundSync(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.warn('[BackgroundSyncManager] Background Sync not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if ((registration as any).sync) {
        await (registration as any).sync.register(SYNC_TAG);
        console.log('[BackgroundSyncManager] Background sync registered');
        return true;
      }
    } catch (error) {
      console.error('[BackgroundSyncManager] Background sync registration failed', error);
    }

    return false;
  }

  /**
   * Trigger sync immediately (used when network returns)
   */
  async triggerSync(): Promise<void> {
    console.log('[BackgroundSyncManager] Triggering sync');

    // Try to use Background Sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ((registration as any).sync) {
          await (registration as any).sync.register(SYNC_TAG);
          console.log('[BackgroundSyncManager] Background sync trigger sent');
          return;
        }
      } catch (error) {
        console.error('[BackgroundSyncManager] Background sync trigger failed', error);
      }
    }

    // Fallback: Trigger sync manually via API call
    await this.performSync();
  }

  /**
   * Perform the actual sync operation
   */
  async performSync(retryCount: number = 0): Promise<void> {
    try {
      console.log('[BackgroundSyncManager] Performing sync (attempt', retryCount + 1, ')');
      
      // Emit sync started event
      eventBus.emit({
        type: SYNC_EVENTS.SYNC_STARTED,
        timestamp: Date.now(),
      });

      // Fetch pending events from storage (this will be implemented by Issue #3)
      const pendingEvents = await this.getPendingEvents();
      
      if (pendingEvents.length === 0) {
        console.log('[BackgroundSyncManager] No pending events to sync');
        eventBus.emit({
          type: SYNC_EVENTS.SYNC_COMPLETED,
          timestamp: Date.now(),
          payload: { synced: 0, failed: 0 },
        });
        return;
      }

      // Send to sync API endpoint
      const response = await this.sendSyncRequest(pendingEvents);

      // Update storage based on response
      await this.updateSyncStatus(response);

      // Emit completion event
      eventBus.emit({
        type: SYNC_EVENTS.SYNC_COMPLETED,
        timestamp: Date.now(),
        payload: {
          synced: response.synced,
          failed: response.failed,
          errors: response.errors,
        },
      });

      console.log('[BackgroundSyncManager] Sync completed:', response);
    } catch (error) {
      console.error('[BackgroundSyncManager] Sync failed', error);

      // Retry with exponential backoff
      if (retryCount < this.config.maxRetries) {
        const delay = this.config.initialDelay * Math.pow(
          this.config.backoffMultiplier,
          retryCount
        );
        console.log(`[BackgroundSyncManager] Retrying sync in ${delay}ms`);
        
        setTimeout(() => {
          this.performSync(retryCount + 1);
        }, delay);
      } else {
        // Max retries exceeded
        eventBus.emit({
          type: SYNC_EVENTS.SYNC_FAILED,
          timestamp: Date.now(),
          payload: {
            error: error instanceof Error ? error.message : 'Unknown error',
            attempts: retryCount + 1,
          },
        });
      }
    }
  }

  /**
   * Get pending events from IndexedDB
   * This will be populated by Issue #3 (Sync Manager)
   */
  private async getPendingEvents(): Promise<SyncEvent[]> {
    console.log('[BackgroundSyncManager] Fetching pending events');
    
    // This will be implemented when Issue #3 provides the storage layer
    // For now, return empty array as placeholder
    // TODO: Integrate with storageManager.getSyncQueue()
    
    try {
      // Attempt to fetch from IndexedDB (will be fully implemented in Issue #3)
      const openDB = (window as any).indexedDB?.open;
      if (!openDB) {
        console.warn('[BackgroundSyncManager] IndexedDB not available');
        return [];
      }

      return [];
    } catch (error) {
      console.error('[BackgroundSyncManager] Failed to get pending events', error);
      return [];
    }
  }

  /**
   * Send sync request to API endpoint
   */
  private async sendSyncRequest(
    events: SyncEvent[]
  ): Promise<{ synced: number; failed: number; errors?: any[] }> {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      throw new Error(`Sync API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Update sync status in storage based on API response
   */
  private async updateSyncStatus(
    response: { synced: number; failed: number; errors?: any[] }
  ): Promise<void> {
    // This will integrate with storageManager when Issue #3 is complete
    // For now, just log the response
    console.log('[BackgroundSyncManager] Sync status updated:', response);
  }

  /**
   * Update sync retry configuration
   */
  setSyncConfig(config: Partial<SyncRetryConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const backgroundSyncManager = new BackgroundSyncManager();
