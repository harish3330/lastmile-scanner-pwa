import React, { useState } from 'react'
import { apiClient } from '../lib/api-client'

export default function DeliveryPage() {
  const [deliveryId, setDeliveryId] = useState('')
  const [status, setStatus] = useState('in-transit')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [deliveries, setDeliveries] = useState<any[]>([])

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed', label: 'Failed Attempt' },
    { value: 'returned', label: 'Returned' },
  ]

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deliveryId.trim()) {
      setMessage('Please enter a delivery ID')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await apiClient.updateDelivery({
        scanId: deliveryId,
        deliveryStatus: status,
      })

      setMessage(`✅ Delivery #${deliveryId} updated to: ${status}`)
      setMessageType('success')
      setDeliveries([
        {
          id: deliveryId,
          status,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...deliveries,
      ])
      setDeliveryId('')
      setStatus('in-transit')
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'in-transit':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'returned':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Delivery Management</h1>
          <p className="text-gray-600">
            Update delivery status and track package movements
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleUpdate}>
            <div className="mb-4">
              <label htmlFor="deliveryId" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery ID
              </label>
              <input
                type="text"
                id="deliveryId"
                value={deliveryId}
                onChange={(e) => setDeliveryId(e.target.value)}
                placeholder="Enter delivery ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
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
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </form>
        </div>

        {/* Recent Updates */}
        {deliveries.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Updates</h2>
            <div className="space-y-3">
              {deliveries.map((delivery, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">#{delivery.id}</p>
                    <p className="text-xs text-gray-600">{delivery.timestamp}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(delivery.status)}`}>
                    {statuses.find((s) => s.value === delivery.status)?.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Guide */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">
            📋 Status Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {statuses.map((s) => (
              <div key={s.value}>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(s.value)} mr-2`}>
                  {s.label}
                </span>
                <span className="text-indigo-800">Use when package is {s.label.toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
