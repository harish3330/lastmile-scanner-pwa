/**
 * ISSUE #4 - Scan Page Component
 * React UI for camera-based QR/Barcode scanning
 * Follows marketplace theme: clean, light, user-friendly
 */

import React, { useEffect, useRef, useState } from 'react'
import { ScannerEngine, initScanner, stopScanner, ScanSyncHandler, initScanSyncHandler } from '@/lib/modules/scanner'
import { ScanResult, CameraPermissionStatus } from '@/lib/modules/scanner/types'

interface ScanPageProps {
  agentId: string
  onScanComplete?: (result: ScanResult) => void
  location?: { lat: number; lng: number }
}

interface ScanState {
  isScanning: boolean
  permissionStatus: CameraPermissionStatus | null
  lastScan: ScanResult | null
  error: string | null
  frameCount: number
}

const ScanPage: React.FC<ScanPageProps> = ({ agentId, onScanComplete, location }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<ScanState>({
    isScanning: false,
    permissionStatus: null,
    lastScan: null,
    error: null,
    frameCount: 0
  })
  const scannerRef = useRef<ScannerEngine | null>(null)
  const syncHandlerRef = useRef<ScanSyncHandler | null>(null)

  // Initialize scanner and sync handler
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
      }
    }
  }, [])

  // Start scanning
  const handleStartScan = async () => {
    try {
      // Initialize sync handler
      if (!syncHandlerRef.current) {
        syncHandlerRef.current = initScanSyncHandler(agentId, location)
      }

      // Initialize scanner
      scannerRef.current = await initScanner({ facingMode: 'environment' })

      // Register scan callback
      scannerRef.current.onScan(async (result: ScanResult) => {
        setState(prev => ({
          ...prev,
          lastScan: result,
          error: null
        }))

        // Handle scan via sync handler
        if (syncHandlerRef.current) {
          await syncHandlerRef.current.handleScanResult(result)
        }

        // Call parent callback
        if (onScanComplete) {
          onScanComplete(result)
        }

        // Show success toast (optional)
        console.log(`✓ Scanned: ${result.value}`)
      })

      // Register error callback
      scannerRef.current.onError((error: string) => {
        setState(prev => ({
          ...prev,
          error
        }))
      })

      // Update video element
      if (videoRef.current && scannerRef.current.getVideoElement()) {
        const videoElement = scannerRef.current.getVideoElement()
        if (videoElement) {
          videoRef.current.srcObject = (videoElement as any).srcObject
        }
      }

      setState(prev => ({
        ...prev,
        isScanning: true,
        error: null
      }))
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start scanner'
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isScanning: false
      }))
    }
  }

  // Stop scanning
  const handleStopScan = () => {
    stopScanner()
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setState(prev => ({
      ...prev,
      isScanning: false
    }))
  }

  // Request camera permission
  const handleRequestPermission = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new ScannerEngine()
      }
      const permission = await scannerRef.current.requestCameraPermission()
      setState(prev => ({
        ...prev,
        permissionStatus: permission
      }))

      if (permission.state === 'granted') {
        await handleStartScan()
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to request permission'
      setState(prev => ({
        ...prev,
        error: errorMsg
      }))
    }
  }

  // Update location
  const handleUpdateLocation = (location: { lat: number; lng: number }) => {
    if (syncHandlerRef.current) {
      syncHandlerRef.current.setLocation(location)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Scan QR Code or Barcode</h1>
        <p style={styles.subtitle}>Align the code within the frame</p>
      </div>

      {/* Error Message */}
      {state.error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <span style={styles.errorText}>{state.error}</span>
        </div>
      )}

      {/* Permission Prompt */}
      {!state.permissionStatus && (
        <div style={styles.permissionBox}>
          <p style={styles.permissionText}>Camera access required to scan codes</p>
          <button style={styles.permissionButton} onClick={handleRequestPermission}>
            Allow Camera Access
          </button>
        </div>
      )}

      {/* Camera Feed */}
      {state.isScanning && (
        <div style={styles.cameraContainer}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={styles.video}
          />
          <div style={styles.scannerOverlay}>
            <div style={styles.scanFrame} />
            <p style={styles.scannerText}>Scanning...</p>
          </div>
        </div>
      )}

      {/* Last Scan Result */}
      {state.lastScan && (
        <div style={styles.resultBox}>
          <div style={styles.resultHeader}>
            <span style={styles.resultIcon}>✓</span>
            <span style={styles.resultTitle}>Scan Successful</span>
          </div>
          <div style={styles.resultDetails}>
            <p style={styles.resultLabel}>Format: <span style={styles.resultValue}>{state.lastScan.format}</span></p>
            <p style={styles.resultLabel}>Code: <span style={styles.resultValue}>{state.lastScan.value}</span></p>
            <p style={styles.resultLabel}>Time: <span style={styles.resultValue}>{new Date(state.lastScan.timestamp).toLocaleTimeString()}</span></p>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div style={styles.buttonContainer}>
        {!state.isScanning ? (
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={handleStartScan}
            disabled={!state.permissionStatus || state.permissionStatus.state !== 'granted'}
          >
            {state.permissionStatus?.state === 'granted' ? 'Start Scanning' : 'Request Permission'}
          </button>
        ) : (
          <button
            style={{ ...styles.button, ...styles.dangerButton }}
            onClick={handleStopScan}
          >
            Stop Scanning
          </button>
        )}
      </div>

      {/* Debug Info */}
      {state.isScanning && (
        <div style={styles.debugBox}>
          <p style={styles.debugText}>Frames processed: {state.frameCount}</p>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  } as React.CSSProperties,
  header: {
    textAlign: 'center' as const,
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a73e8',
    margin: '0 0 8px 0'
  } as React.CSSProperties,
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0'
  } as React.CSSProperties,
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    marginBottom: '16px',
    backgroundColor: '#ffebee',
    borderLeft: '4px solid #d32f2f',
    borderRadius: '4px'
  } as React.CSSProperties,
  errorIcon: {
    marginRight: '12px',
    fontSize: '18px'
  },
  errorText: {
    fontSize: '14px',
    color: '#c62828'
  },
  permissionBox: {
    padding: '20px',
    textAlign: 'center' as const,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '16px'
  },
  permissionText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px'
  } as React.CSSProperties,
  permissionButton: {
    padding: '10px 20px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  } as React.CSSProperties,
  cameraContainer: {
    position: 'relative' as const,
    width: '100%',
    aspectRatio: '1 / 1',
    marginBottom: '16px',
    backgroundColor: '#000',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  } as React.CSSProperties,
  scannerOverlay: {
    position: 'absolute' as const,
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  scanFrame: {
    width: '200px',
    height: '200px',
    border: '3px solid #4CAF50',
    borderRadius: '8px',
    boxShadow: 'inset 0 0 20px rgba(76, 175, 80, 0.3)'
  } as React.CSSProperties,
  scannerText: {
    color: '#fff',
    fontSize: '14px',
    marginTop: '12px',
    fontWeight: '500'
  } as React.CSSProperties,
  resultBox: {
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: '#e8f5e9',
    border: '1px solid #4CAF50',
    borderRadius: '4px'
  } as React.CSSProperties,
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px'
  } as React.CSSProperties,
  resultIcon: {
    marginRight: '8px',
    fontSize: '20px',
    color: '#4CAF50'
  },
  resultTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2e7d32'
  },
  resultDetails: {
    fontSize: '13px',
    color: '#555'
  } as React.CSSProperties,
  resultLabel: {
    margin: '4px 0',
    fontWeight: '500'
  } as React.CSSProperties,
  resultValue: {
    fontFamily: 'monospace',
    color: '#1a73e8',
    fontWeight: '600',
    wordBreak: 'break-all' as const
  } as React.CSSProperties,
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  } as React.CSSProperties,
  button: {
    flex: 1,
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  } as React.CSSProperties,
  primaryButton: {
    backgroundColor: '#1a73e8',
    color: '#fff'
  } as React.CSSProperties,
  dangerButton: {
    backgroundColor: '#d32f2f',
    color: '#fff'
  } as React.CSSProperties,
  debugBox: {
    marginTop: '16px',
    padding: '8px 12px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#666'
  } as React.CSSProperties,
  debugText: {
    margin: '0'
  } as React.CSSProperties
}

export default ScanPage
