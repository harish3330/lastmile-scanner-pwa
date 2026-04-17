import React, { useEffect, useState } from 'react';
import { eventBus } from '@/lib/events/eventBus';
import { SYNC_EVENTS } from '@/lib/constants/syncEvents';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Update online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen to sync events
    const unsubscribeSyncStarted = eventBus.on(SYNC_EVENTS.SYNC_STARTED, () => {
      setIsSyncing(true);
    });

    const unsubscribeSyncCompleted = eventBus.on(SYNC_EVENTS.SYNC_COMPLETED, () => {
      setIsSyncing(false);
    });

    const unsubscribeSyncFailed = eventBus.on(SYNC_EVENTS.SYNC_FAILED, () => {
      setIsSyncing(false);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeSyncStarted?.();
      unsubscribeSyncCompleted?.();
      unsubscribeSyncFailed?.();
    };
  }, []);

  if (isOnline && !isSyncing) {
    return null; // Don't show indicator when online and not syncing
  }

  return (
    <div style={styles.container}>
      <div style={styles.banner}>
        <span style={styles.icon}>
          {isSyncing ? '⚙️' : '🌐'}
        </span>
        <span style={styles.text}>
          {isOnline
            ? isSyncing
              ? 'Syncing data...'
              : 'Connected'
            : 'Offline - Using cached data'}
        </span>
        {isSyncing && <span style={styles.spinner} />}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '10px',
    padding: '8px 16px',
    backgroundColor: '#ff9800',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    minHeight: '40px',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
  },
  text: {
    flex: 1,
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

// Add animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);
}
