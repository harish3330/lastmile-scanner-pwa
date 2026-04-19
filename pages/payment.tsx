import React, { useState } from 'react'
import { apiClient } from '../lib/api-client'

export default function PaymentPage() {
  const [deliveryId, setDeliveryId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('upi')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [transactions, setTransactions] = useState<any[]>([])

  const methods = [
    { value: 'upi', label: 'UPI' },
    { value: 'card', label: 'Card' },
    { value: 'cash', label: 'Cash' },
    { value: 'wallet', label: 'Digital Wallet' },
  ]

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!deliveryId.trim() || !amount.trim()) {
      setMessage('Please enter delivery ID and amount')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await apiClient.verifyPayment({
        deliveryId,
        amount: parseFloat(amount),
        method,
      })

      setMessage(
        `✅ Payment verified! Transaction ID: ${response.transactionId}`
      )
      setMessageType('success')
      setTransactions([
        {
          id: deliveryId,
          amount,
          method,
          transactionId: response.transactionId,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...transactions,
      ])
      setDeliveryId('')
      setAmount('')
      setMethod('upi')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 Payment Verification</h1>
          <p className="text-gray-600">
            Verify and process payments for deliveries
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleVerify}>
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

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {methods.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
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
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify Payment'}
            </button>
          </form>
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h2>
            <div className="space-y-3">
              {transactions.map((txn, idx) => (
                <div key={idx} className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">₹{txn.amount}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Method: {methods.find((m) => m.value === txn.method)?.label}
                      </p>
                      <p className="text-xs text-gray-600">
                        Txn ID: {txn.transactionId?.substring(0, 12)}...
                      </p>
                      <p className="text-xs text-gray-600">{txn.timestamp}</p>
                    </div>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Methods Info */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            💰 Supported Payment Methods
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-yellow-800">
            {methods.map((m) => (
              <div key={m.value}>✓ {m.label}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
