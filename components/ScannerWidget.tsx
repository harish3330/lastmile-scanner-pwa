/**
 * ISSUE #4 - Scanner Widget Component
 * Reusable QR/Barcode scanner widget for embedding in other pages
 * Lightweight and modular for marketplace UI integration
 */

import React, { useEffect, useRef, useState } from 'react'
import { ScannerEngine, ScanSyncHandler, initScanSyncHandler } from '@/lib/modules/scanner'
import { ScanResult } from '@/lib/modules/scanner/types'

interface ScannerWidgetProps {
  agentId: string
  onScan: (result: ScanResult) => void
  onError?: (error: string) => void
  autoStart?: boolean
  location?: { lat: number; lng: number }
  compact?: boolean
}

interface WidgetState {
  isActive: boolean
  isLoading: boolean
  error: string | null
  lastScan: string | null
}

const ScannerWidget: React.FC<ScannerWidgetProps> = ({
  agentId,
  onScan,
  onError,
  autoStart = false,
  location,
  compact = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<WidgetState>({
    isActive: false,
    isLoading: false,
    error: null,
    lastScan: null
  })
  const scannerRef = useRef<ScannerEngine | null>(null)
  const syncHandlerRef = useRef<ScanSyncHandler | null>(null)

  useEffect(() => {
    if (autoStart) {
      handleToggleScanner()
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
      }
    }
  }, [autoStart])

  const handleToggleScanner = async () => {
    try {
      if (state.isActive) {
        if (scannerRef.current) {
          scannerRef.current.stop()
        }
        setState(prev => ({
          ...prev,
          isActive: false
        }))
        return
      }

      setState(prev => ({
        ...prev,
        isLoading: true
      }))

      // Initialize sync handler
      if (!syncHandlerRef.current) {
        syncHandlerRef.current = initScanSyncHandler(agentId, location)
      }

      // Initialize and start scanner
      scannerRef.current = new ScannerEngine()
      await scannerRef.current.start({ facingMode: 'environment' })

      scannerRef.current.onScan((result: ScanResult) => {
        setState(prev => ({
          ...prev,
          lastScan: result.value
        }))

        if (syncHandlerRef.current) {
          syncHandlerRef.current.handleScanResult(result)
        }

        onScan(result)
      })

      scannerRef.current.onError((error: string) => {
        setState(prev => ({
          ...prev,
          error
        }))
        if (onError) {
          onError(error)
        }
      })

      setState(prev => ({
        ...prev,
        isActive: true,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start scanner'
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false
      }))
      if (onError) {
        onError(errorMsg)
      }
    }
  }

  if (compact) {
    return (
      <div style={compactStyles.container}>
        <button
          style={{
            ...compactStyles.button,
            ...(state.isActive ? compactStyles.activeButton : {})
          }}
          onClick={handleToggleScanner}
          disabled={state.isLoading}
        >
          {state.isLoading ? '⏳ Loading...' : state.isActive ? '🛑 Stop' : '📱 Scan'}
        </button>
        {state.lastScan && (
          <span style={compactStyles.result}>{state.lastScan}</span>
        )}
        {state.error && (
          <span style={compactStyles.error}>{state.error}</span>
        )}
      </div>
    )
  }

  return (
    <div style={standardStyles.container}>
      <div style={standardStyles.header}>
        <h3 style={standardStyles.title}>Scanner</h3>
        <button
          style={{
            ...standardStyles.toggleButton,
            ...(state.isActive ? standardStyles.toggleActive : {})
          }}
          onClick={handleToggleScanner}
          disabled={state.isLoading}
        >
          {state.isLoading ? 'Loading...' : state.isActive ? 'Stop' : 'Start'}
        </button>
      </div>

      {state.isActive && (
        <div style={standardStyles.videoContainer}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={standardStyles.video}
          />
          <div style={standardStyles.overlay}>
            <div style={standardStyles.frame} />
          </div>
        </div>
      )}

      {state.lastScan && (
        <div style={standardStyles.resultBox}>
          <p style={standardStyles.resultText}>✓ Last scan: <strong>{state.lastScan}</strong></p>
        </div>
      )}

      {state.error && (
        <div style={standardStyles.errorBox}>
          <p style={standardStyles.errorText}>⚠️ {state.error}</p>
        </div>
      )}
    </div>
  )
}

const compactStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px'
  } as React.CSSProperties,
  button: {
    padding: '8px 12px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'background-color 0.3s'
  } as React.CSSProperties,
  activeButton: {
    backgroundColor: '#d32f2f'
  } as React.CSSProperties,
  result: {
    fontSize: '12px',
    color: '#4CAF50',
    fontWeight: '600'
  },
  error: {
    fontSize: '12px',
    color: '#d32f2f'
  }
}

const standardStyles = {
  container: {
    padding: '16px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #eee'
  } as React.CSSProperties,
  title: {
    margin: '0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  } as React.CSSProperties,
  toggleButton: {
    padding: '6px 12px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'background-color 0.3s'
  } as React.CSSProperties,
  toggleActive: {
    backgroundColor: '#d32f2f'
  } as React.CSSProperties,
  videoContainer: {
    position: 'relative' as const,
    width: '100%',
    aspectRatio: '1 / 1',
    marginBottom: '12px',
    backgroundColor: '#000',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  } as React.CSSProperties,
  overlay: {
    position: 'absolute' as const,
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  frame: {
    width: '150px',
    height: '150px',
    border: '2px solid #4CAF50',
    borderRadius: '4px'
  } as React.CSSProperties,
  resultBox: {
    padding: '8px 12px',
    marginBottom: '8px',
    backgroundColor: '#e8f5e9',
    border: '1px solid #4CAF50',
    borderRadius: '4px'
  } as React.CSSProperties,
  resultText: {
    margin: '0',
    fontSize: '13px',
    color: '#2e7d32'
  } as React.CSSProperties,
  errorBox: {
    padding: '8px 12px',
    backgroundColor: '#ffebee',
    border: '1px solid #d32f2f',
    borderRadius: '4px'
  } as React.CSSProperties,
  errorText: {
    margin: '0',
    fontSize: '13px',
    color: '#c62828'
  } as React.CSSProperties
}

export default ScannerWidget
