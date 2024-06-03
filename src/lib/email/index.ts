import SendGrid from '@sendgrid/mail'
import { z } from 'zod'

import { requiredEnv } from '@/utils/shared/requiredEnv'

const SENDGRID_API_KEY = requiredEnv(process.env.SENDGRID_API_KEY, 'SENDGRID_API_KEY')
const SENDGRID_SENDER = requiredEnv(process.env.SENDGRID_SENDER, 'SENDGRID_SENDER')
const SENDGRID_SANDBOX_MODE = process.env.SENDGRID_SANDBOX_MODE

SendGrid.setApiKey(SENDGRID_API_KEY)

export const zodSendMailPayload = z.object({
  to: z.string().email(),
  from: z.string().email().optional(),
  subject: z.string().min(5),
  html: z.string(),
})

export type SendMailPayload = z.infer<typeof zodSendMailPayload>

export async function sendMail(payload: SendMailPayload) {
  const validatedInput = zodSendMailPayload.safeParse(payload)
  if (!validatedInput.success) {
    // TODO: handle error
    throw new Error('Unable to send mail')
  }

  try {
    const [response] = await SendGrid.send({
      from: SENDGRID_SENDER,
      mailSettings: {
        sandboxMode: {
          enable: SENDGRID_SANDBOX_MODE === 'true',
        },
      },
      ...validatedInput.data,
    })

    return response.headers['x-message-id'] as string
  } catch (error) {
    // TODO: handle error
    console.error(error)
    throw new Error('Unable to send mail')
  }
}
