// Service Worker Registration Handler
import { eventBus } from '../events/eventBus';
import { SYNC_EVENTS } from '../constants/syncEvents';

export interface ServiceWorkerRegistrationOptions {
  onInstall?: () => void;
  onActivate?: () => void;
  onMessage?: (data: any) => void;
}

export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private options: ServiceWorkerRegistrationOptions = {};

  /**
   * Register the service worker
   */
  async register(options?: ServiceWorkerRegistrationOptions): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[ServiceWorkerManager] Service Workers are not supported');
      return null;
    }

    this.options = options || {};

    try {
      console.log('[ServiceWorkerManager] Registering service worker');
      this.registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      console.log('[ServiceWorkerManager] Service worker registered successfully');

      // Listen to controller change (when new SW becomes active)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[ServiceWorkerManager] Controller changed - new service worker activated');
        this.options.onActivate?.();
        eventBus.emit({
          type: SYNC_EVENTS.SYNC_TRIGGERED,
          timestamp: Date.now(),
        });
      });

      // Listen to messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data;
        console.log('[ServiceWorkerManager] Message from service worker:', type);

        if (type === 'SYNC_TRIGGERED') {
          eventBus.emit({
            type: SYNC_EVENTS.SYNC_TRIGGERED,
            timestamp: data?.timestamp || Date.now(),
          });
        }

        this.options.onMessage?.(event.data);
      });

      return this.registration;
    } catch (error) {
      console.error('[ServiceWorkerManager] Registration failed', error);
      return null;
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const success = await this.registration.unregister();
      if (success) {
        console.log('[ServiceWorkerManager] Service worker unregistered');
        this.registration = null;
      }
      return success;
    } catch (error) {
      console.error('[ServiceWorkerManager] Unregister failed', error);
      return false;
    }
  }

  /**
   * Check if service worker has updates available
   */
  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.update();
      return this.registration.waiting !== null;
    } catch (error) {
      console.error('[ServiceWorkerManager] Update check failed', error);
      return false;
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) {
      console.warn('[ServiceWorkerManager] No waiting service worker');
      return;
    }

    console.log('[ServiceWorkerManager] Skipping waiting - activating new service worker');
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * Post message to service worker
   */
  postMessage(message: any): void {
    if (!navigator.serviceWorker.controller) {
      console.warn('[ServiceWorkerManager] No active service worker controller');
      return;
    }

    navigator.serviceWorker.controller.postMessage(message);
  }

  /**
   * Get current registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Check if service worker is active
   */
  isActive(): boolean {
    return this.registration?.active !== null;
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();
