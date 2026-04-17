import React, { useEffect, useState } from 'react';

const OfflinePageComponent = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          {isOnline ? '📡' : '🌐'}
        </div>
        
        <h1 style={styles.title}>
          {isOnline ? 'Back Online!' : 'You are Offline'}
        </h1>
        
        <p style={styles.description}>
          {isOnline
            ? 'Your connection has been restored. Cached data is loaded.'
            : 'Your internet connection is currently unavailable. The app is using cached data.'}
        </p>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            <strong>Offline Mode Enabled:</strong> The app will continue to work with cached data.
          </p>
          <p style={styles.infoText}>
            Pending operations will be synchronized automatically when your connection returns.
          </p>
        </div>

        {!isOnline && (
          <button
            style={styles.button}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        )}

        {isOnline && (
          <button
            style={styles.buttonSuccess}
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    maxWidth: '500px',
    textAlign: 'center',
  },
  iconContainer: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
  },
  description: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '25px',
    lineHeight: '1.6',
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '15px',
    marginBottom: '25px',
    textAlign: 'left',
  },
  infoText: {
    fontSize: '14px',
    color: '#555',
    margin: '8px 0',
    lineHeight: '1.5',
  },
  button: {
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    fontSize: '16px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonSuccess: {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    fontSize: '16px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default OfflinePageComponent;
