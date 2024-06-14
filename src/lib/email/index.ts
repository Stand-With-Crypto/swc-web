import SendGrid, { ClientResponse } from '@sendgrid/mail'
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

export interface SendMailPayload {
  to: string
  from?: string
  subject: string
  html: string
}

export async function sendMail(payload: SendMailPayload) {
  try {
    const [response] = await SendGrid.send({
      from: SENDGRID_SENDER,
      mailSettings: {
        sandboxMode: {
          enable: SENDGRID_SANDBOX_MODE === 'true',
        },
      },
      ...payload,
    })

    return response.headers['x-message-id'] as string
  } catch (error) {
    // TODO: handle error
    console.error(error)
    throw new Error('Unable to send mail')
  }
}

export async function sendMultipleMails(
  payload: SendMailPayload[],
): Promise<[SendMailPayload['to'], string][]> {
  const hydratedPayload = payload.map(entry => ({
    from: SENDGRID_SENDER,
    mailSettings: {
      sandboxMode: {
        enable: SENDGRID_SANDBOX_MODE === 'true',
      },
    },
    ...entry,
  }))
  try {
    // This casting is necessary because `Sendgrid.send` is not correctly typed for multiple sends
    const responses = (await SendGrid.send(hydratedPayload)) as unknown as [
      ClientResponse,
      unknown,
    ][]

    return responses.map((response, idx) => [
      hydratedPayload[idx].to,
      response[0].headers['x-message-id'],
    ])
  } catch (error) {
    // TODO: handle error
    console.error(error)
    throw new Error('Unable to send mail')
  }
}
