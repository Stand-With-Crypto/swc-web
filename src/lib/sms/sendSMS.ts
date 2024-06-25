import * as Sentry from '@sentry/node'
import { z } from 'zod'

import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { smsProvider } from '@/utils/shared/smsProvider'

import { messagingClient } from './client'

const TWILIO_PHONE_NUMBER = requiredEnv(process.env.TWILIO_PHONE_NUMBER, 'TWILIO_PHONE_NUMBER')

const logger = getLogger('sendSMS')

export const zodSendSMSSchema = z.object({
  to: z.string(),
  body: z.string(),
})

export type SendSMSPayload = z.infer<typeof zodSendSMSSchema>

export const sendSMS = async (payload: SendSMSPayload) => {
  if (smsProvider !== 'twilio') {
    return
  }

  logger.info('Sending SMS', payload)

  const validatedInput = zodSendSMSSchema.safeParse(payload)

  if (!validatedInput.success) {
    throw new Error('Invalid sendSMS payload')
  }

  const { body, to } = validatedInput.data

  // only send SMS to US and CA numbers
  if (!to.startsWith('+1')) {
    throw new Error('Phone number not from US or CA')
  }

  try {
    return messagingClient.messages.create({
      from: TWILIO_PHONE_NUMBER,
      body,
      to,
    })
  } catch (error) {
    Sentry.captureException(error)
    throw new Error('Failed to send SMS')
  }
}
