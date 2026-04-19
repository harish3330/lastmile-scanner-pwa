import React, { useState } from 'react'
import { apiClient } from '../lib/api-client'
import { offlineStorage } from '../lib/storage/offline'
import { v4 as uuidv4 } from 'uuid'

export default function ScanPage() {
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [scans, setScans] = useState<any[]>([])

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrCode.trim()) {
      setMessage('Please enter a QR code')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Store locally first (offline support)
      const event = {
        id: uuidv4(),
        type: 'SCAN_EVENT',
        data: {
          qrCode,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
        synced: false,
      }

      await offlineStorage.saveEvent(event)

      // Try to sync with backend
      try {
        const response = await apiClient.scan({
          agentId: 'agent-001',
          qrCode,
          timestamp: Date.now(),
          location: { lat: 0, lng: 0 },
        })

        offlineStorage.markAsSynced(event.id)
        setMessage(`✅ Scan successful! Parcel ID: ${response.id}`)
        setMessageType('success')
        setScans([{ qrCode, response, timestamp: new Date().toLocaleTimeString() }, ...scans])
      } catch (apiError) {
        setMessage('⚠️ Offline mode: Scan saved locally. Will sync when online.')
        setMessageType('success')
        setScans([{ qrCode, status: 'offline', timestamp: new Date().toLocaleTimeString() }, ...scans])
      }

      setQrCode('')
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 QR Code Scanning</h1>
          <p className="text-gray-600">
            Scan QR codes on packages to identify and track deliveries
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleScan}>
            <div className="mb-4">
              <label htmlFor="qrCode" className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Value
              </label>
              <input
                type="text"
                id="qrCode"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Enter or scan QR code..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {message && (
              <div className={messageType === 'success' ? 'success' : 'error'}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Scanning...' : 'Scan QR Code'}
            </button>
          </form>
        </div>

        {/* Recent Scans */}
        {scans.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Scans</h2>
            <div className="space-y-3">
              {scans.map((scan, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    scan.status === 'offline'
                      ? 'bg-orange-50 border-orange-400'
                      : 'bg-green-50 border-green-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-sm text-gray-900">{scan.qrCode}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {scan.timestamp}
                      </p>
                    </div>
                    {scan.status === 'offline' ? (
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                        Offline
                      </span>
                    ) : (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                        Synced
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
