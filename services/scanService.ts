/**
 * ISSUE #8 - Scan Service
 * Handles QR/Barcode scan recording
 * 
 * Dependency: Prisma Client (database)
 * Integration: ISSUE #4 (Scanner) emits SCAN_EVENT
 */

import prisma from '@/lib/db/client'

export interface ScanRequest {
  agentId: string
  qrCode: string
  barcode?: string
  timestamp: number
  location?: { lat: number; lng: number }
}

export interface ScanResponse {
  scanId: string
  status: string
  message: string
  timestamp: number
}

export class ScanService {
  /**
   * Record a scan from ISSUE #4 (Scanner Module)
   * ISSUE #4 emits SCAN_EVENT → ISSUE #8 receives via API
   */
  async recordScan(req: ScanRequest): Promise<ScanResponse> {
    // Validate required fields
    if (!req.agentId || !req.qrCode) {
      throw new Error('Missing required fields: agentId, qrCode')
    }

    try {
      // Create scan record in DB
      const scan = await prisma.scan.create({
        data: {
          agentId: req.agentId,
          qrCode: req.qrCode,
          barcode: req.barcode,
          latitude: req.location?.lat,
          longitude: req.location?.lng,
          timestamp: new Date(req.timestamp)
        }
      })

      return {
        scanId: scan.id,
        status: 'success',
        message: 'Scan recorded successfully',
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('[ScanService] Error recording scan:', error)
      throw new Error('Failed to record scan')
    }
  }

  /**
   * Get all scans for an agent (pagination support)
   */
  async getScansByAgent(agentId: string, limit = 50, offset = 0) {
    try {
      const scans = await prisma.scan.findMany({
        where: { agentId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      })

      const total = await prisma.scan.count({ where: { agentId } })

      return { scans, total }
    } catch (error) {
      console.error('[ScanService] Error fetching scans:', error)
      throw new Error('Failed to fetch scans')
    }
  }

  /**
   * Get scans from last N hours
   */
  async getScansFromLastNHours(agentId: string, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    try {
      const scans = await prisma.scan.findMany({
        where: {
          agentId,
          timestamp: { gte: since }
        },
        orderBy: { timestamp: 'desc' }
      })

      return scans
    } catch (error) {
      console.error('[ScanService] Error fetching recent scans:', error)
      throw error
    }
  }
}

export const scanService = new ScanService()
