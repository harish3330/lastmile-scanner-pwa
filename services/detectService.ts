import { prisma } from '@/lib/db/client'
import { DetectedObject } from '@/lib/modules/ml/detector'

export interface DetectionCreateInput {
  agentId: string
  parcelCount: number
  confidence: number
  detections: DetectedObject[]
  inferenceTime: number
  timestamp: number
  location?: { latitude: number; longitude: number }
}

export interface DetectionRecord {
  id: string
  agentId: string
  parcelCount: number
  confidence: number
  detections: DetectedObject[]
  inferenceTime: number
  createdAt: Date
  updatedAt: Date
}

/**
 * DetectService: Handles database operations for ML detections
 * - Store detection results
 * - Retrieve detection history
 * - Query by agent
 */
export class DetectService {
  /**
   * Record a detection result in the database
   * @param input Detection data to store
   * @returns Created detection record
   */
  async recordDetection(input: DetectionCreateInput): Promise<DetectionRecord> {
    try {
      console.log('[Service] Recording detection for agent:', input.agentId)

      const detection = await prisma.detection.create({
        data: {
          agentId: input.agentId,
          parcelCount: input.parcelCount,
          confidence: input.confidence,
          detections: input.detections as any, // JSON type
          inferenceTime: input.inferenceTime,
          createdAt: new Date(input.timestamp)
        }
      })

      console.log('[Service] Detection recorded with ID:', detection.id)

      return {
        id: detection.id,
        agentId: detection.agentId,
        parcelCount: detection.parcelCount,
        confidence: detection.confidence,
        detections: detection.detections as DetectedObject[],
        inferenceTime: detection.inferenceTime,
        createdAt: detection.createdAt,
        updatedAt: detection.updatedAt
      }
    } catch (error) {
      console.error('[Service] Failed to record detection:', error)
      throw error
    }
  }

  /**
   * Get detections by agent ID with pagination
   * @param agentId Agent ID to filter by
   * @param limit Number of records to return
   * @param offset Number of records to skip
   * @returns Array of detection records
   */
  async getDetectionsByAgent(
    agentId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ detections: DetectionRecord[]; total: number }> {
    try {
      console.log('[Service] Fetching detections for agent:', agentId)

      const [detections, total] = await Promise.all([
        prisma.detection.findMany({
          where: { agentId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.detection.count({ where: { agentId } })
      ])

      return {
        detections: detections.map(d => ({
          id: d.id,
          agentId: d.agentId,
          parcelCount: d.parcelCount,
          confidence: d.confidence,
          detections: d.detections as DetectedObject[],
          inferenceTime: d.inferenceTime,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt
        })),
        total
      }
    } catch (error) {
      console.error('[Service] Failed to fetch detections:', error)
      throw error
    }
  }

  /**
   * Get recent detections across all agents
   * @param limit Number of records to return
   * @param offset Number of records to skip
   * @returns Array of detection records
   */
  async getRecentDetections(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ detections: DetectionRecord[]; total: number }> {
    try {
      console.log('[Service] Fetching recent detections')

      const [detections, total] = await Promise.all([
        prisma.detection.findMany({
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.detection.count()
      ])

      return {
        detections: detections.map(d => ({
          id: d.id,
          agentId: d.agentId,
          parcelCount: d.parcelCount,
          confidence: d.confidence,
          detections: d.detections as DetectedObject[],
          inferenceTime: d.inferenceTime,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt
        })),
        total
      }
    } catch (error) {
      console.error('[Service] Failed to fetch recent detections:', error)
      throw error
    }
  }

  /**
   * Get detection by ID
   * @param id Detection record ID
   * @returns Detection record or null
   */
  async getDetectionById(id: string): Promise<DetectionRecord | null> {
    try {
      const detection = await prisma.detection.findUnique({ where: { id } })

      if (!detection) {
        return null
      }

      return {
        id: detection.id,
        agentId: detection.agentId,
        parcelCount: detection.parcelCount,
        confidence: detection.confidence,
        detections: detection.detections as DetectedObject[],
        inferenceTime: detection.inferenceTime,
        createdAt: detection.createdAt,
        updatedAt: detection.updatedAt
      }
    } catch (error) {
      console.error('[Service] Failed to fetch detection by ID:', error)
      throw error
    }
  }

  /**
   * Get statistics for agent
   * @param agentId Agent ID to get stats for
   * @returns Statistics (total detections, avg parcelCount, avg confidence)
   */
  async getAgentStats(agentId: string): Promise<{
    totalDetections: number
    avgParcelCount: number
    avgConfidence: number
  }> {
    try {
      const detections = await prisma.detection.findMany({
        where: { agentId },
        select: { parcelCount: true, confidence: true }
      })

      if (detections.length === 0) {
        return {
          totalDetections: 0,
          avgParcelCount: 0,
          avgConfidence: 0
        }
      }

      const totalParcelCount = detections.reduce(
        (sum, d) => sum + d.parcelCount,
        0
      )
      const totalConfidence = detections.reduce(
        (sum, d) => sum + d.confidence,
        0
      )

      return {
        totalDetections: detections.length,
        avgParcelCount: totalParcelCount / detections.length,
        avgConfidence: totalConfidence / detections.length
      }
    } catch (error) {
      console.error('[Service] Failed to get agent stats:', error)
      throw error
    }
  }

  /**
   * Delete detection record
   * @param id Detection record ID
   * @returns Deleted detection record
   */
  async deleteDetection(id: string): Promise<DetectionRecord> {
    try {
      const detection = await prisma.detection.delete({ where: { id } })

      return {
        id: detection.id,
        agentId: detection.agentId,
        parcelCount: detection.parcelCount,
        confidence: detection.confidence,
        detections: detection.detections as DetectedObject[],
        inferenceTime: detection.inferenceTime,
        createdAt: detection.createdAt,
        updatedAt: detection.updatedAt
      }
    } catch (error) {
      console.error('[Service] Failed to delete detection:', error)
      throw error
    }
  }
}

// Export singleton instance
export const detectService = new DetectService()
