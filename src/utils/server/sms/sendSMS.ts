import { z } from 'zod'

import { isPhoneNumberSupported } from '@/utils/server/sms/utils'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

import { messagingClient } from './messagingClient'
import { SendSMSError } from './SendSMSError'

const TWILIO_MESSAGING_SERVICE_SID = requiredEnv(
  process.env.TWILIO_MESSAGING_SERVICE_SID,
  'TWILIO_MESSAGING_SERVICE_SID',
)

const zodSendSMSSchema = z.object({
  to: z.string(),
  body: z.string(),
  media: z.array(z.string()).optional(),
  statusCallbackUrl: z.string().optional(),
})

export type SendSMSPayload = z.infer<typeof zodSendSMSSchema>

export const sendSMS = async (payload: SendSMSPayload) => {
  const validatedInput = zodSendSMSSchema.safeParse(payload)

  if (!validatedInput.success) {
    throw new Error('Invalid sendSMS payload')
  }

  const { body, to, media, statusCallbackUrl } = validatedInput.data

  if (!isPhoneNumberSupported(to)) {
    return
  }

  if (NEXT_PUBLIC_ENVIRONMENT === 'local') {
    return
  }

  try {
    const message = await messagingClient.messages.create({
      messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
      body,
      statusCallback: statusCallbackUrl,
      to,
      mediaUrl: media,
    })

    return message
  } catch (error) {
    throw new SendSMSError(error, to)
  }
}
