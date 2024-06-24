import * as Sentry from '@sentry/node'
import twilio from 'twilio'
import { z } from 'zod'

import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { smsProvider } from '@/utils/shared/smsProvider'

const accountSid = requiredEnv(process.env.TWILIO_ACCOUNT_SID, 'TWILIO_ACCOUNT_SID')
const authToken = requiredEnv(process.env.TWILIO_AUTH_TOKEN, 'TWILIO_AUTH_TOKEN')
const phoneNumber = requiredEnv(process.env.TWILIO_PHONE_NUMBER, 'TWILIO_PHONE_NUMBER')

const client = twilio(accountSid, authToken)

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
    throw new Error('Invalid phone number')
  }

  try {
    return client.messages.create({
      from: phoneNumber,
      body,
      to,
    })
  } catch (error) {
    Sentry.captureException(error)
    throw new Error('Failed to send SMS')
  }
}
