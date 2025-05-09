import SendgridClient from '@sendgrid/client'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const SENDGRID_API_KEY = requiredOutsideLocalEnv(
  process.env.SENDGRID_API_KEY,
  'SENDGRID_API_KEY',
  'Sendgrid Email Sends',
)

if (SENDGRID_API_KEY) {
  SendgridClient.setApiKey(SENDGRID_API_KEY)
}

export { SendgridClient }
