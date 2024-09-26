import SendGrid, { ClientResponse } from '@sendgrid/mail'

import { logger } from '@/utils/shared/logger'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const SENDGRID_API_KEY = requiredOutsideLocalEnv(
  process.env.SENDGRID_API_KEY,
  'SENDGRID_API_KEY',
  'Sendgrid Email Sends',
)
const SENDGRID_SENDER = requiredOutsideLocalEnv(
  process.env.SENDGRID_SENDER,
  'SENDGRID_SENDER',
  'Sendgrid Email Sends',
)
const SENDGRID_SANDBOX_MODE = requiredOutsideLocalEnv(
  process.env.SENDGRID_SANDBOX_MODE,
  'SENDGRID_SANDBOX_MODE',
  'Sendgrid Email Sends',
)

if (SENDGRID_API_KEY) {
  SendGrid.setApiKey(SENDGRID_API_KEY)
}

type EmailData = string | { name?: string; email: string }

interface CommonPayload {
  subject: string
  html: string
  from?: string
  customArgs?: {
    variant?: string
    userId?: string
    campaign?: string
    [key: string]: string | undefined
  }
}

/**
 * Personalization data for SendGrid
 * https://www.twilio.com/en-us/blog/sending-bulk-emails-3-ways-sendgrid-nodejs#Method-2-personalization
 */
interface PersonalizationData {
  to: EmailData | EmailData[]
  from?: EmailData
  cc?: EmailData | EmailData[]
  bcc?: EmailData | EmailData[]
  subject?: string
  substitutions?: { [key: string]: string }
  sendAt?: number
  customArgs?: { [key: string]: string }
}

export type SendMailPayload =
  // This is with personalizations so we can't send to: string
  | (CommonPayload & {
      personalizations: PersonalizationData[]
    })
  // This is without personalizations so to: string is required
  | (CommonPayload & {
      to: string
      personalizations?: never
    })

/**
 * Send email using SendGrid
 * @param payload: SendMailPayload
 * @returns string
 */
export function sendMail(payload: SendMailPayload): Promise<string>

/**
 * Send emails using SendGrid
 * @param payload: SendMailPayload[]
 * @returns string[]
 */
export function sendMail(payload: SendMailPayload[]): Promise<string[]>

export async function sendMail(
  payload: SendMailPayload | SendMailPayload[],
): Promise<string | string[]> {
  if (!SENDGRID_API_KEY || !SENDGRID_SENDER) {
    logger.debug(
      'Skipping `sendMail` call due to undefined `SENDGRID_API_KEY` or `SENDGRID_SENDER`',
      payload,
    )
    return 'skipped-message-id'
  }

  const isMultiple = Array.isArray(payload)

  const parsedPayload = isMultiple
    ? payload.map(currentMessage => ({
        from: SENDGRID_SENDER,
        mailSettings: {
          sandboxMode: {
            enable: SENDGRID_SANDBOX_MODE === 'true',
          },
        },
        ...currentMessage,
      }))
    : {
        from: SENDGRID_SENDER,
        mailSettings: {
          sandboxMode: {
            enable: SENDGRID_SANDBOX_MODE === 'true',
          },
        },
        ...payload,
      }

  const response = await SendGrid.send(parsedPayload, isMultiple)

  if (isMultiple) {
    return response.map(
      currentResponse => (currentResponse as [ClientResponse])[0].headers?.['x-message-id'],
    )
  }

  return response[0].headers?.['x-message-id']
}
