/**
 * ISSUE #8 - Delivery Service
 * Handles delivery status tracking and proof of delivery
 * 
 * Dependency: Prisma Client (database)
 * Integration: ISSUE #2 (Frontend) sends delivery updates
 */

import prisma from '@/lib/db/client'

export interface DeliveryRequest {
  agentId: string
  deliveryId: string
  status: 'started' | 'in_progress' | 'completed' | 'failed'
  imageProof?: string
  notes?: string
}

export class DeliveryService {
  /**
   * Record delivery status change
   * Stores proof of delivery (image) when provided
   */
  async recordDelivery(req: DeliveryRequest) {
    // Validate required fields
    if (!req.agentId || !req.deliveryId || !req.status) {
      throw new Error('Missing required delivery fields')
    }

    try {
      // Check if delivery already exists
      const existing = await prisma.delivery.findUnique({
        where: { deliveryId: req.deliveryId }
      })

      let delivery

      if (existing) {
        // Update existing delivery
        delivery = await prisma.delivery.update({
          where: { deliveryId: req.deliveryId },
          data: {
            status: req.status,
            imageProof: req.imageProof,
            notes: req.notes,
            updatedAt: new Date()
          }
        })
      } else {
        // Create new delivery record
        delivery = await prisma.delivery.create({
          data: {
            agentId: req.agentId,
            deliveryId: req.deliveryId,
            status: req.status,
            imageProof: req.imageProof,
            notes: req.notes
          }
        })
      }

      return {
        status: 'success',
        deliveryId: delivery.id,
        timestamp: delivery.updatedAt.getTime()
      }
    } catch (error) {
      console.error('[DeliveryService] Error recording delivery:', error)
      throw new Error('Failed to record delivery')
    }
  }

  /**
   * Get deliveries by agent
   */
  async getDeliveriesByAgent(agentId: string, status?: string) {
    try {
      const deliveries = await prisma.delivery.findMany({
        where: {
          agentId,
          ...(status && { status })
        },
        orderBy: { timestamp: 'desc' }
      })

      return deliveries
    } catch (error) {
      console.error('[DeliveryService] Error fetching deliveries:', error)
      throw error
    }
  }

  /**
   * Get delivery completion rate
   */
  async getCompletionRate(agentId: string, hoursRange = 24) {
    const since = new Date(Date.now() - hoursRange * 60 * 60 * 1000)

    try {
      const deliveries = await prisma.delivery.findMany({
        where: {
          agentId,
          timestamp: { gte: since }
        }
      })

      const completed = deliveries.filter(d => d.status === 'completed').length
      const total = deliveries.length

      return {
        completed,
        total,
        rate: total > 0 ? (completed / total) * 100 : 0
      }
    } catch (error) {
      console.error('[DeliveryService] Error calculating completion rate:', error)
      throw error
    }
  }

  /**
   * Get delivery with proof
   */
  async getDeliveryWithProof(deliveryId: string) {
    try {
      const delivery = await prisma.delivery.findUnique({
        where: { deliveryId }
      })

      return delivery
    } catch (error) {
      console.error('[DeliveryService] Error fetching delivery:', error)
      throw error
    }
  }
}

export const deliveryService = new DeliveryService()
