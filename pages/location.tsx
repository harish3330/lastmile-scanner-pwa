import React, { useState } from 'react'
import { postLocation } from '../lib/api-client'

export default function LocationPage() {
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [accuracy, setAccuracy] = useState('10')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [locations, setLocations] = useState<any[]>([])

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString())
          setLongitude(position.coords.longitude.toString())
          setAccuracy(position.coords.accuracy.toString())
          setMessage('✅ Location captured from device')
          setMessageType('success')
        },
        (error) => {
          setMessage(`Error getting location: ${error.message}`)
          setMessageType('error')
        }
      )
    } else {
      setMessage('Geolocation is not supported by this browser')
      setMessageType('error')
    }
  }

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!latitude || !longitude) {
      setMessage('Please enter latitude and longitude')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await postLocation({
        agentId: 'agent-001',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: parseFloat(accuracy),
        timestamp: Date.now()
      })

      setMessage('✅ Location tracked successfully')
      setMessageType('success')
      setLocations([
        {
          lat: latitude,
          lng: longitude,
          accuracy,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...locations,
      ])
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📍 Location Tracking</h1>
          <p className="text-gray-600">
            Real-time GPS tracking for delivery routes and agent movements
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleTrack}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="0.0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="0.0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="accuracy" className="block text-sm font-medium text-gray-700 mb-2">
                Accuracy (meters)
              </label>
              <input
                type="number"
                id="accuracy"
                step="0.1"
                value={accuracy}
                onChange={(e) => setAccuracy(e.target.value)}
                placeholder="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {message && (
              <div className={messageType === 'success' ? 'success' : 'error'}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loading}
                className="py-2 px-4 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                📍 Get My Location
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`py-2 px-4 rounded-lg font-semibold text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Tracking...' : 'Track Location'}
              </button>
            </div>
          </form>
        </div>

        {/* Recent Locations */}
        {locations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Location History</h2>
            <div className="space-y-3">
              {locations.map((loc, idx) => (
                <div key={idx} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-sm text-gray-900">
                        {loc.lat}, {loc.lng}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Accuracy: ±{loc.accuracy}m
                      </p>
                      <p className="text-xs text-gray-600">
                        {loc.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            📡 GPS Tracking
          </h3>
          <ul className="text-red-800 text-sm space-y-2">
            <li>• Click "Get My Location" to capture your current GPS position</li>
            <li>• Manually enter coordinates if GPS is unavailable</li>
            <li>• Accuracy is typically 5-30 meters on smartphones</li>
            <li>• All locations are stored offline and synced automatically</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
