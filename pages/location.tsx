/**
 * ISSUE #6 - Location Page
 * GPS tracker UI for field agents
 * Starts and stops live location tracking
 */

import React, { useEffect, useState } from 'react'
import { eventBus } from '@/lib/events/eventBus'
import { LOCATION_EVENT } from '@/lib/types/events'
import { geolocationTracker } from '@/lib/modules/geolocation'

const LocationPage: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false)
  const [lastLocation, setLastLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const agentId = localStorage.getItem('agentId') || `agent-${Date.now()}`
    localStorage.setItem('agentId', agentId)
    geolocationTracker.setAgentId(agentId)

    return () => {
      geolocationTracker.stop()
    }
  }, [])

  useEffect(() => {
    const handleLocationEvent = (event: any) => {
      if (event.type === LOCATION_EVENT) {
        setLastLocation({
          latitude: event.payload.latitude,
          longitude: event.payload.longitude,
          accuracy: event.payload.accuracy
        })
      }
    }

    eventBus.on(LOCATION_EVENT, handleLocationEvent)

    return () => {
      eventBus.off(LOCATION_EVENT, handleLocationEvent)
    }
  }, [])

  const startTracking = () => {
    setError(null)
    const result = geolocationTracker.start()
    if (!result) {
      setError('Geolocation is not supported in this browser')
      return
    }
    setIsTracking(true)
  }

  const stopTracking = () => {
    geolocationTracker.stop()
    setIsTracking(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">GPS Tracker</h1>
            <p className="mt-1 text-sm text-gray-500">Live location tracking for delivery agents.</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Tracking status</h2>
                  <p className="text-sm text-gray-500">{isTracking ? 'Active' : 'Inactive'}</p>
                </div>
                <button
                  onClick={isTracking ? stopTracking : startTracking}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500">Last captured location</p>
                {lastLocation ? (
                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <div>Latitude: {lastLocation.latitude.toFixed(6)}</div>
                    <div>Longitude: {lastLocation.longitude.toFixed(6)}</div>
                    <div>Accuracy: {lastLocation.accuracy.toFixed(1)} m</div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">No location captured yet.</p>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LocationPage
