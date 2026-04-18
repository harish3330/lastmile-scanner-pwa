/**
 * ISSUE #2 - Offline Indicator Component
 * Shows network status and sync queue status
 * Clean, minimal design matching marketplace theme
 */

import React, { useEffect, useState } from 'react'
import { eventBus } from '@/lib/events/eventBus'
import { SYNC_EVENTS } from '@/lib/constants/syncEvents'

interface OfflineIndicatorProps {
  className?: string
}

interface SyncStatus {
  isOnline: boolean
  pendingCount: number
  lastSyncTime?: number
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    pendingCount: 0
  })

  useEffect(() => {
    // Listen for sync events
    const handleSyncEvent = (event: any) => {
      if (event.type === SYNC_EVENTS.SYNC_COMPLETED) {
        setStatus(prev => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - (event.payload?.synced || 0))
        }))
      } else if (event.type === SYNC_EVENTS.SYNC_FAILED) {
        // Could increment pending count, but for now just log
        console.log('Sync failed:', event.payload)
      }
    }

    const handleNetworkEvent = (event: any) => {
      if (event.type === SYNC_EVENTS.NETWORK_ONLINE) {
        setStatus(prev => ({ ...prev, isOnline: true }))
      } else if (event.type === SYNC_EVENTS.NETWORK_OFFLINE) {
        setStatus(prev => ({ ...prev, isOnline: false }))
      }
    }

    // Subscribe to events
    eventBus.on(SYNC_EVENTS.SYNC_COMPLETED, handleSyncEvent)
    eventBus.on(SYNC_EVENTS.SYNC_FAILED, handleSyncEvent)
    eventBus.on(SYNC_EVENTS.NETWORK_ONLINE, handleNetworkEvent)
    eventBus.on(SYNC_EVENTS.NETWORK_OFFLINE, handleNetworkEvent)

    // Set initial online status
    setStatus(prev => ({ ...prev, isOnline: navigator.onLine }))

    return () => {
      eventBus.off(SYNC_EVENTS.SYNC_COMPLETED, handleSyncEvent)
      eventBus.off(SYNC_EVENTS.SYNC_FAILED, handleSyncEvent)
      eventBus.off(SYNC_EVENTS.NETWORK_ONLINE, handleNetworkEvent)
      eventBus.off(SYNC_EVENTS.NETWORK_OFFLINE, handleNetworkEvent)
    }
  }, [])

  const getStatusColor = () => {
    if (!status.isOnline) return 'bg-red-500'
    if (status.pendingCount > 0) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline'
    if (status.pendingCount > 0) return `Syncing (${status.pendingCount})`
    return 'Online'
  }

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-full text-white text-sm font-medium shadow-lg ${getStatusColor()} ${className}`}>
      <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
      <span>{getStatusText()}</span>
    </div>
  )
}

export { OfflineIndicator }