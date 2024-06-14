import twilio from 'twilio'
import { z } from 'zod'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = twilio(accountSid, authToken)

export const zodSendSMSSchema = z.object({
  to: z.string(),
  body: z.string(),
})

export type SendSMSPayload = z.infer<typeof zodSendSMSSchema>

export const sendSMS = async (payload: SendSMSPayload) => {
  const validatedInput = zodSendSMSSchema.safeParse(payload)

  if (!validatedInput.success) {
    // TODO: handle error
    throw new Error('Invalid sendSMS payload')
  }

  try {
    const { body, to } = validatedInput.data

    return client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
      to,
    })
  } catch (error) {
    // TODO: handle error
    console.error(error)
    throw new Error('Failed to send SMS')
  }
}
