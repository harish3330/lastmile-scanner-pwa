import type { NextApiRequest, NextApiResponse } from 'next'
import { whatsappService } from '@/services/whatsappService'

interface WhatsAppSendRequest {
  recipient: string
  message: string
  messageType?: 'notification' | 'alert' | 'confirmation'
  agentLocation?: {
    lat: number
    lng: number
  }
}

interface WhatsAppSendResponse {
  status: 'sent' | 'error'
  message: string
  messageId?: string
  code?: string
}

/**
 * POST /api/integrations/whatsapp/send
 * Send WhatsApp message to recipient
 * 
 * Request body:
 * {
 *   "recipient": "+919876543210",
 *   "message": "Your OTP is: 123456",
 *   "messageType": "notification", (optional)
 *   "agentLocation": { "lat": 28.7041, "lng": 77.1025 } (optional)
 * }
 * 
 * Response:
 * {
 *   "status": "sent" | "error",
 *   "message": "Message sent successfully" | error message,
 *   "messageId": "msg_id_here"
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WhatsAppSendResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    })
  }

  try {
    const { recipient, message, messageType, agentLocation } = req.body as WhatsAppSendRequest

    // Validate required fields
    if (!recipient || typeof recipient !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Recipient phone number is required',
      })
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Message content is required',
      })
    }

    // Validate message length (WhatsApp limit: 4096 characters)
    if (message.length > 4096) {
      return res.status(400).json({
        status: 'error',
        message: 'Message exceeds maximum length of 4096 characters',
      })
    }

    // Validate message type if provided
    if (messageType && !['notification', 'alert', 'confirmation'].includes(messageType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid message type. Must be: notification, alert, or confirmation',
      })
    }

    // Validate coordinates if location is provided
    if (agentLocation) {
      if (
        typeof agentLocation.lat !== 'number' ||
        typeof agentLocation.lng !== 'number' ||
        agentLocation.lat < -90 ||
        agentLocation.lat > 90 ||
        agentLocation.lng < -180 ||
        agentLocation.lng > 180
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid location coordinates',
        })
      }
    }

    // Send message using service layer
    const result = await whatsappService.sendMessage(
      recipient,
      message,
      (messageType || 'notification') as 'notification' | 'alert' | 'confirmation',
      agentLocation
    )

    if (result.status === 'sent') {
      return res.status(200).json({
        status: 'sent',
        message: 'WhatsApp message sent successfully',
        messageId: result.messageId,
      })
    } else {
      return res.status(400).json({
        status: 'error',
        message: result.message || 'Failed to send WhatsApp message',
      })
    }
  } catch (error) {
    console.error('[WhatsApp Send API Error]', error)
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    })
  }
}
