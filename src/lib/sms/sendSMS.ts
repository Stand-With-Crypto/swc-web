import * as Sentry from '@sentry/node'
import twilio from 'twilio'
import { z } from 'zod'

import { smsProvider } from '@/utils/shared/smsProvider'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = twilio(accountSid, authToken)

export const zodSendSMSSchema = z.object({
  to: z.string(),
  body: z.string(),
})

export type SendSMSPayload = z.infer<typeof zodSendSMSSchema>

export const sendSMS = async (payload: SendSMSPayload) => {
  if (smsProvider !== 'twilio') {
    return
  }

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
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
      to,
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}
