import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { serviceWorkerManager } from '@/lib/serviceWorker/registration';
import { backgroundSyncManager } from '@/lib/serviceWorker/backgroundSync';
import { eventBus } from '@/lib/events/eventBus';
import { SYNC_EVENTS } from '@/lib/constants/syncEvents';
import { OfflineIndicator } from '@/components/OfflineIndicator';

export default function App({ Component, pageProps }: AppProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [swInitialized, setSwInitialized] = useState(false);

  useEffect(() => {
    // Initialize Service Worker
    const initServiceWorker = async () => {
      try {
        await serviceWorkerManager.register({
          onActivate: () => {
            console.log('[App] Service worker activated');
            // Emit event bus message for sync
            eventBus.emit({
              type: SYNC_EVENTS.SYNC_TRIGGERED,
              timestamp: Date.now(),
            });
          },
          onMessage: (data) => {
            console.log('[App] Message from service worker:', data);
            if (data.type === 'SYNC_TRIGGERED') {
              eventBus.emit({
                type: SYNC_EVENTS.SYNC_TRIGGERED,
                timestamp: data.timestamp,
              });
            }
          },
        });

        // Register background sync
        await backgroundSyncManager.registerBackgroundSync();

        setSwInitialized(true);
      } catch (error) {
        console.error('[App] Service worker initialization failed', error);
      }
    };

    if ('serviceWorker' in navigator) {
      initServiceWorker();
    }
  }, []);

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      console.log('[App] Network online');
      setIsOnline(true);
      
      // Emit event bus message for sync
      eventBus.emit({
        type: SYNC_EVENTS.NETWORK_ONLINE,
        timestamp: Date.now(),
      });

      // Trigger sync when network is restored
      eventBus.emit({
        type: SYNC_EVENTS.SYNC_TRIGGERED,
        timestamp: Date.now(),
      });

      // Also trigger background sync
      backgroundSyncManager.triggerSync().catch((error) => {
        console.error('[App] Failed to trigger sync:', error);
      });
    };

    const handleOffline = () => {
      console.log('[App] Network offline');
      setIsOnline(false);
      
      // Emit event bus message for offline
      eventBus.emit({
        type: SYNC_EVENTS.NETWORK_OFFLINE,
        timestamp: Date.now(),
      });
    };

    // Set initial online status
    setIsOnline(navigator.onLine);

    // Register event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      <OfflineIndicator />
      <Component {...pageProps} />
    </>
  );
}
