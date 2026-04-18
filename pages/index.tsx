/**
 * ISSUE #2 - Home Page
 * Landing page for delivery agents
 * Quick access to main features and status overview
 */

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { eventBus } from '@/lib/events/eventBus'
import { SCAN_EVENT, DELIVERY_EVENT } from '@/lib/types/events'

interface HomeStats {
  todaysScans: number
  pendingDeliveries: number
  completedDeliveries: number
}

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<HomeStats>({
    todaysScans: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0
  })

  const [agentId, setAgentId] = useState<string>('')

  useEffect(() => {
    // Get agent ID from localStorage or generate one
    const storedAgentId = localStorage.getItem('agentId')
    if (storedAgentId) {
      setAgentId(storedAgentId)
    } else {
      const newAgentId = `agent-${Date.now()}`
      localStorage.setItem('agentId', newAgentId)
      setAgentId(newAgentId)
    }

    // Listen for events to update stats
    const handleScanEvent = (event: any) => {
      if (event.type === SCAN_EVENT) {
        setStats(prev => ({ ...prev, todaysScans: prev.todaysScans + 1 }))
      }
    }

    const handleDeliveryEvent = (event: any) => {
      if (event.type === DELIVERY_EVENT) {
        if (event.payload.status === 'completed') {
          setStats(prev => ({
            ...prev,
            completedDeliveries: prev.completedDeliveries + 1,
            pendingDeliveries: Math.max(0, prev.pendingDeliveries - 1)
          }))
        } else if (event.payload.status === 'started') {
          setStats(prev => ({ ...prev, pendingDeliveries: prev.pendingDeliveries + 1 }))
        }
      }
    }

    eventBus.on(SCAN_EVENT, handleScanEvent)
    eventBus.on(DELIVERY_EVENT, handleDeliveryEvent)

    return () => {
      eventBus.off(SCAN_EVENT, handleScanEvent)
      eventBus.off(DELIVERY_EVENT, handleDeliveryEvent)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Last-Mile Scanner</h1>
            <div className="text-sm text-gray-500">Agent: {agentId}</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Scans</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.todaysScans}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Deliveries</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingDeliveries}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed Today</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.completedDeliveries}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/scan" className="block">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 15h4.01M12 21h4.01M12 18h4.01M12 9h4.01M12 6h4.01M12 3h4.01" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Scan Parcel</h3>
                      <p className="text-sm text-gray-500">QR/Barcode scanning</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/delivery" className="block">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Delivery</h3>
                      <p className="text-sm text-gray-500">Manage deliveries</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/warehouse" className="block">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Warehouse</h3>
                      <p className="text-sm text-gray-500">Validate parcels</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/location" className="block">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657 0-5-4-5s-4 3.343-4 5 1.343 4 4 4 4-1.343 4-4zm8 8v-3.5a5.5 5.5 0 00-11 0V19m11 0H4" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">GPS Tracker</h3>
                      <p className="text-sm text-gray-500">Live location tracking</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/payments" className="block">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Payments</h3>
                      <p className="text-sm text-gray-500">Cash management</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Admin Access */}
          <div className="mt-8">
            <Link href="/admin/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage