import { EmailRepViaCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { FetchReqError, fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import * as Sentry from '@sentry/nextjs'

const CAPITOL_CANARY_API_KEY = requiredEnv(
  process.env.CAPITOL_CANARY_API_KEY,
  'process.env.CAPITOL_CANARY_API_KEY',
)

const CAPITOL_CANARY_API_SECRET = requiredEnv(
  process.env.CAPITOL_CANARY_API_SECRET,
  'process.env.CAPITOL_CANARY_API_SECRET',
)

const CAPITOL_CANARY_EMAIL_REP_API_URL = 'https://api.phone2action.com/2.0/connections'

// Interface based on: https://docs.phone2action.com/#:~:text=calls%20to%20legislators-,Create%20a%20connection,-This%20endpoint%20will
// Interface should not be accessed directly - use the requirements interface above.
interface EmailRepViaCapitolCanaryRequest {
  // Required information.
  advocateid: number
  campaignid: number
  emailSubject: string
  emailMessage: string

  // Hardcoded type to email.
  type: ['email']

  // Metadata for Capitol Canary.
  p2aSource?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

interface EmailRepViaCapitolCanaryResponse {
  success: number
  error: string
  data?: {
    ids?: number[]
    leg?: {
      [key: string]: {
        id: number
        level: string
        chamber: string
        country: string
        state: string
        district: string
        title: string
        name_full: string
        name_first: string
        name_last: string
        party: string
        type: string
      }
    }
  }
}

// This function should not be called directly. Use the respective Inngest function instead.
export function formatCapitolCanaryEmailRepRequest(
  payload: EmailRepViaCapitolCanaryPayloadRequirements & { advocateId: number },
) {
  const formattedRequest: EmailRepViaCapitolCanaryRequest = {
    advocateid: payload.advocateId,
    campaignid: payload.campaignId,
    emailSubject: payload.emailSubject,
    emailMessage: payload.emailMessage,
    type: ['email'],
  }

  if (payload.metadata) {
    const metadata = payload.metadata
    formattedRequest.p2aSource = metadata.p2aSource
    formattedRequest.utm_source = metadata.utmSource
    formattedRequest.utm_medium = metadata.utmMedium
    formattedRequest.utm_campaign = metadata.utmCampaign
    formattedRequest.utm_term = metadata.utmTerm
    formattedRequest.utm_content = metadata.utmContent
  }

  return formattedRequest
}

export async function emailRepViaCapitolCanary(request: EmailRepViaCapitolCanaryRequest) {
  try {
    const httpResp = await fetchReq(CAPITOL_CANARY_EMAIL_REP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${CAPITOL_CANARY_API_KEY}:${CAPITOL_CANARY_API_SECRET}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    return (await httpResp.json()) as EmailRepViaCapitolCanaryResponse
  } catch (error) {
    Sentry.captureException(error, {
      level: 'error',
      extra: {
        advocate: request.advocateid,
        campaign: request.campaignid,
      },
      tags: {
        domain: 'emailRepViaCapitolCanary',
        advocate: request.advocateid,
        campaigns: request.campaignid,
      },
    })
    // Return the error body if it's a 4xx error.
    if (
      error instanceof FetchReqError &&
      error.response?.status >= 400 &&
      error.response?.status < 500
    ) {
      return JSON.parse(error.body as string) as EmailRepViaCapitolCanaryResponse
    }
    throw error
  }
}
