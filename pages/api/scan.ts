/**
 * ISSUE #8 - POST /api/scan Handler
 * Records QR/Barcode scans from ISSUE #4 (Scanner Module)
 * 
 * Request: ScanRequest
 * Response: ScanResponse
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { scanService, ScanResponse } from '@/services/scanService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScanResponse | { message: string }>
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' })
  }

  try {
    const { agentId, qrCode, barcode, timestamp, location } = req.body

    // Call service layer
    const result = await scanService.recordScan({
      agentId,
      qrCode,
      barcode,
      timestamp: timestamp || Date.now(),
      location
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error('[API] POST /api/scan error:', error)
    return res.status(400).json({
      message: (error as Error).message || 'Failed to record scan'
    })
  }
}
