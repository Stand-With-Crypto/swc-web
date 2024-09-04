import SendGrid, { ClientResponse, MailDataRequired } from '@sendgrid/mail'

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

export interface SendMailPayload {
  to: string
  from?: string
  subject: string
  html: string
  customArgs?: {
    variant?: string
    userId?: string
    [key: string]: string | undefined
  }
}

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

  const response = await SendGrid.send(parsedPayload as MailDataRequired, isMultiple)

  if (isMultiple) {
    return response.map(
      currentResponse =>
        (currentResponse as [ClientResponse])[0].headers?.['x-message-id'] as string,
    )
  }

  return response[0].headers?.['x-message-id'] as string
}
