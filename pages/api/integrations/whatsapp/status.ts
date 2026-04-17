import type { NextApiRequest, NextApiResponse } from 'next'
import { whatsappModule } from '@/lib/modules/integrations'
import { WhatsAppError } from '@/lib/modules/integrations/types'

interface WhatsAppStatusResponse {
  status: 'success' | 'error'
  message?: string
  messageId?: string
  deliveryStatus?: string
  readStatus?: boolean
  sentAt?: number
  deliveredAt?: number
  readAt?: number
  code?: string
}

/**
 * GET /api/integrations/whatsapp/status/[messageId]
 * Get WhatsApp message delivery/read status
 * 
 * Query params:
 * - messageId: The message ID to check status for
 * 
 * Response:
 * {
 *   "status": "success" | "error",
 *   "messageId": "msg_id",
 *   "deliveryStatus": "SENT" | "DELIVERED" | "READ" | "FAILED",
 *   "readStatus": true | false,
 *   "sentAt": 1681234567000,
 *   "deliveredAt": 1681234577000,
 *   "readAt": 1681234587000
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WhatsAppStatusResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    })
  }

  try {
    const { messageId } = req.query

    // Validate message ID
    if (!messageId || typeof messageId !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Message ID is required',
      })
    }

    // Get message status
    const result = await whatsappModule.getMessageStatus(messageId)

    if (result.success) {
      return res.status(200).json({
        status: 'success',
        messageId: result.messageId,
        deliveryStatus: result.deliveryStatus,
        readStatus: result.readStatus,
        sentAt: result.sentAt,
        deliveredAt: result.deliveredAt,
        readAt: result.readAt,
      })
    } else {
      return res.status(result.statusCode || 500).json({
        status: 'error',
        message: result.message || 'Failed to get message status',
        code: result.code,
      })
    }
  } catch (error) {
    if (error instanceof WhatsAppError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
        code: error.code,
      })
    }

    console.error('[WhatsApp Status API Error]', error)
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    })
  }
}
