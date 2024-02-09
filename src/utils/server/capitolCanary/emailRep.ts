import { EmailRepViaCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { sendCapitolCanaryRequest } from '@/utils/server/capitolCanary/sendCapitolCanaryRequest'

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
    emailMessage: payload.emailMessage,
    emailSubject: payload.emailSubject,
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
  return await sendCapitolCanaryRequest<
    EmailRepViaCapitolCanaryRequest,
    EmailRepViaCapitolCanaryResponse
  >(request, 'POST', CAPITOL_CANARY_EMAIL_REP_API_URL)
}
