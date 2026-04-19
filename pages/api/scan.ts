// ============================================================
//  pages/api/scan.ts — ISSUE #4 & #8
//  Receives QR/barcode scans and stores in database
// ============================================================

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { ScanRequest, ScanResponse } from '@/lib/types/api'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { qrCode, agentId, timestamp, location }: ScanRequest = req.body

    // Validate required fields
    if (!qrCode || !agentId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Store scan in database
    const scan = await prisma.scan.create({
      data: {
        agentId,
        qrCode,
        decodedData: location ? JSON.stringify({ lat: location.lat, lng: location.lng }) : null,
      },
    })

    // Update agent's location if provided
    if (location) {
      await prisma.agent.update({
        where: { id: agentId },
        data: {
          lastLatitude: location.lat,
          lastLongitude: location.lng,
        },
      })
    }

    // Emit event for offline sync
    console.log('[API] Scan recorded:', scan.id, qrCode)

    const response: ScanResponse = {
      scanId: scan.id,
      qrCode: scan.qrCode,
      decoded: scan.decodedData,
      timestamp: scan.createdAt.getTime(),
    }

    return res.status(201).json(response)
  } catch (error) {
    console.error('[API] Scan error:', error)
    return res.status(500).json({ error: 'Failed to record scan' })
  }
}
