import { CreateAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { sendCapitolCanaryRequest } from '@/utils/server/capitolCanary/sendCapitolCanaryRequest'

const CAPITOL_CANARY_CREATE_ADVOCATE_API_URL = 'https://api.phone2action.com/2.0/advocates'

// Interface based on: https://docs.phone2action.com/#:~:text=update%20Phone2Action%20advocates-,Create%20an%20advocate,-This%20endpoint%20will
// Interface should not be accessed directly - use the requirements interface above.
interface CreateAdvocateInCapitolCanaryRequest {
  // Required information.
  campaigns: number[]

  // Advocate information.
  email?: string
  phone?: string
  firstname?: string
  lastname?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  zip5?: string
  country?: string

  // Opt-in/out.
  smsOptin?: number
  smsOptinConfirmed?: number
  smsOptout?: number
  emailOptin?: number
  emailOptout?: number

  // Metadata for Capitol Canary.
  p2aSource?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  tags?: string[]
}

interface CreateAdvocateInCapitolCanaryResponse {
  success: number
  error: string
  type: string
  advocateid: string
}

// This function should not be called directly. Use the respective Inngest function instead.
export function formatCapitolCanaryAdvocateCreationRequest(
  payload: CreateAdvocateInCapitolCanaryPayloadRequirements,
) {
  const formattedRequest: CreateAdvocateInCapitolCanaryRequest = {
    campaigns: [payload.campaignId],
  }

  if (payload.userEmailAddress) {
    formattedRequest.email = payload.userEmailAddress.emailAddress
  }

  if (payload.user.firstName) {
    formattedRequest.firstname = payload.user.firstName
  }

  if (payload.user.lastName) {
    formattedRequest.lastname = payload.user.lastName
  }

  if (payload.user.phoneNumber) {
    formattedRequest.phone = payload.user.phoneNumber
  }

  if (payload.user.address) {
    const address = payload.user.address
    formattedRequest.address1 = `${address.streetNumber || ''} ${address.route || ''}`.trim()
    formattedRequest.address2 = address.subpremise
    formattedRequest.city = address.locality
    formattedRequest.state = address.administrativeAreaLevel1
    formattedRequest.zip5 = address.postalCode
    formattedRequest.country = address.countryCode
  }

  if (payload.opts) {
    const opts = payload.opts
    formattedRequest.smsOptin = opts.isSmsOptin ? 1 : 0
    formattedRequest.smsOptinConfirmed = opts.isSmsOptinConfirmed ? 1 : 0
    formattedRequest.smsOptout = opts.isSmsOptout ? 1 : 0
    formattedRequest.emailOptin = opts.isEmailOptin ? 1 : 0
    formattedRequest.emailOptout = opts.isEmailOptout ? 1 : 0
  }

  if (payload.metadata) {
    const metadata = payload.metadata
    formattedRequest.p2aSource = metadata.p2aSource
    formattedRequest.utm_source = metadata.utmSource
    formattedRequest.utm_medium = metadata.utmMedium
    formattedRequest.utm_campaign = metadata.utmCampaign
    formattedRequest.utm_term = metadata.utmTerm
    formattedRequest.utm_content = metadata.utmContent
    formattedRequest.tags = metadata.tags
  }

  return formattedRequest
}

export async function createAdvocateInCapitolCanary(request: CreateAdvocateInCapitolCanaryRequest) {
  return await sendCapitolCanaryRequest<
    CreateAdvocateInCapitolCanaryRequest,
    CreateAdvocateInCapitolCanaryResponse
  >(request, 'POST', CAPITOL_CANARY_CREATE_ADVOCATE_API_URL)
}
