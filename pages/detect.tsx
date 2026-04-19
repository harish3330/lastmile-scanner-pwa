import React, { useState, useEffect } from 'react'
import { modelManager, type Detection } from '../lib/ml/detector'
import { apiClient } from '../lib/api-client'

export default function DetectPage() {
  const [loading, setLoading] = useState(false)
  const [modelLoading, setModelLoading] = useState(true)
  const [detections, setDetections] = useState<Detection[]>([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [imagePreview, setImagePreview] = useState<string>('')

  // Load model on mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        await modelManager.load()
        setMessageType('')
        setMessage('')
      } catch (error) {
        setMessage(`Failed to load ML model: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setMessageType('error')
      } finally {
        setModelLoading(false)
      }
    }

    loadModel()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage('')

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const fileReader = new FileReader()
        fileReader.onload = () => {
          const base64String = fileReader.result as string
          resolve(base64String)
        }
        fileReader.readAsDataURL(file)
      })

      // Run ML detection
      const results = await modelManager.detect(base64)
      setDetections(results)

      if (results.length > 0) {
        setMessage(`✅ Detected ${results.length} parcel(s)!`)
        setMessageType('success')

        // Send to backend
        try {
          await apiClient.detect({
            image: base64,
            confidence: 0.5,
          })
        } catch (apiError) {
          console.log('Detection saved locally (offline)')
        }
      } else {
        setMessage('⚠️ No parcels detected in the image')
        setMessageType('error')
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Image Detection</h1>
          <p className="text-gray-600">
            Use machine learning to detect and count parcels in images
          </p>
        </div>

        {/* Model Status */}
        <div className={`rounded-lg shadow p-4 mb-6 ${modelLoading ? 'bg-yellow-50' : 'bg-green-50'}`}>
          <p className={modelLoading ? 'text-yellow-800' : 'text-green-800'}>
            {modelLoading ? '⏳ Loading ML model...' : '✅ ML model ready'}
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="imageInput"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={loading || modelLoading}
              className="hidden"
            />
            <label htmlFor="imageInput" className="cursor-pointer">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-gray-700 font-semibold mb-2">
                Upload an image to detect parcels
              </p>
              <p className="text-gray-600 text-sm">
                Click to select or drag and drop
              </p>
            </label>
          </div>

          {message && (
            <div className={`mt-4 ${messageType === 'success' ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        {/* Preview and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          {imagePreview && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <img
                src={imagePreview}
                alt="Uploaded preview"
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Detection Results */}
          {detections.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detections ({detections.length})
              </h3>
              <div className="space-y-3">
                {detections.map((detection, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{detection.label}</p>
                        <p className="text-xs text-gray-600">
                          ID: {detection.id.substring(0, 8)}...
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-blue-600">
                          {(detection.confidence * 100).toFixed(1)}%
                        </p>
                        <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${detection.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            ℹ️ How It Works
          </h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li>• Upload an image of parcels</li>
            <li>• ML model detects and counts parcels</li>
            <li>• View confidence scores for each detection</li>
            <li>• Results are automatically synced to server</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
