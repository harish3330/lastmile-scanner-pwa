import React, { useState, useEffect } from 'react'
import { offlineStorage } from '../lib/storage/offline'
import { apiClient } from '../lib/api-client'

export default function SyncPage() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    syncedEvents: 0,
    unsyncedEvents: 0,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [autoSync, setAutoSync] = useState(true)

  useEffect(() => {
    updateStats()
    const interval = setInterval(updateStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const updateStats = () => {
    const newStats = offlineStorage.getStats()
    setStats(newStats)
  }

  const handleSync = async () => {
    setLoading(true)
    setMessage('')

    try {
      const unsyncedEvents = offlineStorage.getUnsyncedEvents()

      if (unsyncedEvents.length === 0) {
        setMessage('✅ All data is already synced!')
        setMessageType('success')
        setLoading(false)
        return
      }

      setMessage(`Syncing ${unsyncedEvents.length} event(s)...`)
      setMessageType('')

      // Sync events
      const response = await apiClient.syncEvents(unsyncedEvents)

      // Mark all as synced
      unsyncedEvents.forEach((event) => {
        offlineStorage.markAsSynced(event.id)
      })

      updateStats()
      setMessage(
        `✅ Synced ${unsyncedEvents.length} event(s) successfully!`
      )
      setMessageType('success')
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      offlineStorage.clearAll()
      updateStats()
      setMessage('✅ All data cleared')
      setMessageType('success')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔄 Data Synchronization</h1>
          <p className="text-gray-600">
            Sync offline data with the server
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-semibold">Total Events</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalEvents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-green-600 text-sm font-semibold">Synced</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{stats.syncedEvents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-orange-600 text-sm font-semibold">Pending</p>
            <p className="text-2xl font-bold text-orange-600 mt-2">{stats.unsyncedEvents}</p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {message && (
            <div className={`mb-4 ${messageType === 'success' ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleSync}
              disabled={loading || stats.unsyncedEvents === 0}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                loading || stats.unsyncedEvents === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? '⏳ Syncing...' : `📡 Sync ${stats.unsyncedEvents} Event(s)`}
            </button>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSync"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded"
              />
              <label htmlFor="autoSync" className="ml-2 text-sm text-gray-700">
                Auto-sync when connection is available
              </label>
            </div>

            <button
              onClick={handleClear}
              disabled={loading || stats.totalEvents === 0}
              className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              🗑️ Clear All Data
            </button>
          </div>
        </div>

        {/* Sync Status */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">
            📊 Sync Status
          </h3>
          <div className="space-y-2 text-sm text-indigo-800">
            <p>
              ✓ {stats.syncedEvents} out of {stats.totalEvents} event(s) synced
            </p>
            {stats.unsyncedEvents > 0 && (
              <p>
                ⚠️ {stats.unsyncedEvents} event(s) waiting to sync
              </p>
            )}
            <p>
              🌐 {autoSync ? 'Auto-sync enabled' : 'Auto-sync disabled'}
            </p>
          </div>

          <div className="mt-4">
            <div className="bg-white rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{
                  width: `${
                    stats.totalEvents > 0
                      ? (stats.syncedEvents / stats.totalEvents) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-indigo-600 mt-2 text-center">
              {stats.totalEvents > 0
                ? `${Math.round(
                    (stats.syncedEvents / stats.totalEvents) * 100
                  )}% synced`
                : 'No events yet'}
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            ℹ️ How Offline Sync Works
          </h3>
          <ol className="text-blue-800 text-sm space-y-2 list-decimal list-inside">
            <li>Data is saved locally when you're offline</li>
            <li>When connection is available, click "Sync" to upload</li>
            <li>All events are queued and sent in batches</li>
            <li>Synced events are marked and never sent again</li>
            <li>Failed syncs can be retried automatically</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
