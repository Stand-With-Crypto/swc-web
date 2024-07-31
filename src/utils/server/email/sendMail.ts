import SendGrid from '@sendgrid/mail'

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

export async function sendMail(payload: SendMailPayload) {
  if (!SENDGRID_API_KEY || !SENDGRID_SENDER) {
    logger.debug(
      'Skipping `sendMail` call due to undefined `SENDGRID_API_KEY` or `SENDGRID_SENDER`',
      payload,
    )
    return 'skipped-message-id'
  }

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
}
