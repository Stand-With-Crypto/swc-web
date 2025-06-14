import SendGrid, { ClientResponse } from '@sendgrid/mail'

import { logger } from '@/utils/shared/logger'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const SENDGRID_API_KEY = requiredOutsideLocalEnv(
  process.env.SENDGRID_API_KEY,
  'SENDGRID_API_KEY',
  'Sendgrid Email Sends',
)
const SENDGRID_SANDBOX_MODE = requiredOutsideLocalEnv(
  process.env.SENDGRID_SANDBOX_MODE,
  'SENDGRID_SANDBOX_MODE',
  'Sendgrid Email Sends',
)
const SENDGRID_SENDER = requiredOutsideLocalEnv(
  process.env.SENDGRID_SENDER,
  'SENDGRID_SENDER',
  'Sendgrid Email Sends',
)
const SENDGRID_SENDER_US = requiredOutsideLocalEnv(
  process.env.SENDGRID_SENDER_US,
  'SENDGRID_SENDER_US',
  'Sendgrid Email Sends',
)
const SENDGRID_SENDER_AU = requiredOutsideLocalEnv(
  process.env.SENDGRID_SENDER_AU,
  'SENDGRID_SENDER_AU',
  'Sendgrid Email Sends',
)
const SENDGRID_SENDER_CA = requiredOutsideLocalEnv(
  process.env.SENDGRID_SENDER_CA,
  'SENDGRID_SENDER_CA',
  'Sendgrid Email Sends',
)
const SENDGRID_SENDER_GB = requiredOutsideLocalEnv(
  process.env.SENDGRID_SENDER_GB,
  'SENDGRID_SENDER_GB',
  'Sendgrid Email Sends',
)

const COUNTRY_CODE_TO_SENDGRID_SENDER: Record<SupportedCountryCodes, string | undefined> = {
  [SupportedCountryCodes.US]: SENDGRID_SENDER_US,
  [SupportedCountryCodes.GB]: SENDGRID_SENDER_GB,
  [SupportedCountryCodes.CA]: SENDGRID_SENDER_CA,
  [SupportedCountryCodes.AU]: SENDGRID_SENDER_AU,
}

if (SENDGRID_API_KEY) {
  SendGrid.setApiKey(SENDGRID_API_KEY)
}

type EmailData = string | { name?: string; email: string }

interface CommonPayload {
  subject: string
  html: string
  from?: string
  ip_pool_name?: IPPoolName
  customArgs?: {
    variant?: string
    userId?: string
    campaign?: string
    [key: string]: string | undefined
  }
}

export enum IPPoolName {
  MARKETING = 'Marketing',
  /**
   * The "DO NOT USE" is so that the marketing team doesn't
   * accidentally use it in the Sendgrid UI.
   */
  REPRESENTATIVES = 'Representatives',
  TRANSACTIONAL = 'DO NOT USE - Transactional',
}

/**
 * Personalization data for SendGrid
 * https://www.twilio.com/en-us/blog/sending-bulk-emails-3-ways-sendgrid-nodejs#Method-2-personalization
 */
interface PersonalizationData {
  to: EmailData | EmailData[]
  from?: EmailData
  ip_pool_name?: IPPoolName
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
 * @param payload {@link SendMailPayload}
 * @returns string
 */
export function sendMail(args: {
  payload: SendMailPayload
  countryCode: SupportedCountryCodes
}): Promise<string>

/**
 * Send emails using SendGrid
 * @param payload {@link SendMailPayload | SendMailPayload[]}
 * @returns string[]
 */
export function sendMail(args: {
  payload: SendMailPayload[]
  countryCode: SupportedCountryCodes
}): Promise<string[]>

export async function sendMail({
  payload,
  countryCode,
}: {
  payload: SendMailPayload | SendMailPayload[]
  countryCode: SupportedCountryCodes
}): Promise<string | string[]> {
  const senderEmail = COUNTRY_CODE_TO_SENDGRID_SENDER[countryCode] || SENDGRID_SENDER

  if (!SENDGRID_API_KEY || !senderEmail) {
    logger.debug(
      'Skipping `sendMail` call due to undefined `SENDGRID_API_KEY` or `SENDGRID_SENDER`',
      payload,
    )
    return 'skipped-message-id'
  }

  const isMultiple = Array.isArray(payload)
  const ipPoolName =
    process.env.VERCEL_ENV === 'production' ? { ip_pool_name: IPPoolName.TRANSACTIONAL } : {}

  const parsedPayload = isMultiple
    ? payload.map(currentMessage => ({
        from: senderEmail,
        ...ipPoolName,
        mailSettings: {
          sandboxMode: {
            enable: SENDGRID_SANDBOX_MODE === 'true',
          },
        },
        ...currentMessage,
      }))
    : {
        from: senderEmail,
        ...ipPoolName,
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
