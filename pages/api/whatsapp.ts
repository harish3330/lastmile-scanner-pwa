// ============================================================
//  pages/api/whatsapp.ts — WHATSAPP MESSAGING
//  ISSUE #10 API - Send WhatsApp notifications and messages
// ============================================================

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { WhatsappRequest, WhatsappResponse } from '@/lib/types/api'
import { v4 as uuid } from 'uuid'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phoneNumber, messageType, content }: WhatsappRequest = req.body

    // Validate required fields
    if (!phoneNumber || !messageType || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate message type
    const validTypes = ['notification', 'alert', 'confirmation']
    if (!validTypes.includes(messageType)) {
      return res.status(400).json({
        error: `Invalid message type. Must be one of: ${validTypes.join(', ')}`,
      })
    }

    // Create message record in database
    const message = await prisma.message.create({
      data: {
        phoneNumber,
        messageType,
        content,
        status: 'sent',
      },
    })

    // Format message based on type
    let formattedMessage = content
    switch (messageType) {
      case 'notification':
        formattedMessage = `📢 ${content}`
        break
      case 'alert':
        formattedMessage = `⚠️ ${content}`
        break
      case 'confirmation':
        formattedMessage = `✅ ${content}`
        break
    }

    // In production, integrate with Twilio WhatsApp API
    // Example (commented out):
    // await twilio.messages.create({
    //   from: 'whatsapp:+1234567890',
    //   to: `whatsapp:+${phoneNumber}`,
    //   body: formattedMessage,
    // })

    console.log(`[API] WhatsApp ${messageType} sent to ${phoneNumber}: ${content}`)

    const response: WhatsappResponse = {
      messageId: message.id,
      status: 'sent',
    }

    return res.status(201).json(response)
  } catch (error) {
    console.error('[API] WhatsApp error:', error)

    // Update message status to failed if record exists
    try {
      const { phoneNumber, messageType, content }: WhatsappRequest = req.body
      if (phoneNumber) {
        await prisma.message.updateMany({
          where: { phoneNumber },
          data: { status: 'failed' },
        })
      }
    } catch (updateError) {
      console.error('[API] Failed to update message status:', updateError)
    }

    return res.status(500).json({ error: 'Failed to send WhatsApp message' })
  }
}
