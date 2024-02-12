import { BaseUpsertAdvocateRequest } from '@/utils/server/capitolCanary/base'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { sendCapitolCanaryRequest } from '@/utils/server/capitolCanary/sendCapitolCanaryRequest'

const CAPITOL_CANARY_UPDATE_ADVOCATE_API_URL = 'https://api.phone2action.com/2.0/advocates'

// Interface based on: https://docs.phone2action.com/#:~:text=%3A19302020%0A%7D-,Update%20an%20advocate,-In%20order%20to
// Interface should not be accessed directly - use the requirements interface (see `payloadRequirements.ts`).
interface UpdateAdvocateInCapitolCanaryRequest extends BaseUpsertAdvocateRequest {
  // Required information.
  advocateid: number
}

interface UpdateAdvocateInCapitolCanaryResponse {
  success: number
  error: string
  type: string
  advocateid: number
}

// This function should not be called directly. Use the respective Inngest function instead.
export function formatCapitolCanaryAdvocateUpdateRequest(
  payload: UpsertAdvocateInCapitolCanaryPayloadRequirements,
) {
  if (!payload.user.capitolCanaryAdvocateId) {
    return new Error('advocate ID is required')
  }

  const formattedRequest: UpdateAdvocateInCapitolCanaryRequest = {
    advocateid: payload.user.capitolCanaryAdvocateId,
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
    formattedRequest.smsOptinConfirmed = opts.shouldSendSmsOptinConfirmation ? 0 : 1
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

export async function updateAdvocateInCapitolCanary(request: UpdateAdvocateInCapitolCanaryRequest) {
  return await sendCapitolCanaryRequest<
    UpdateAdvocateInCapitolCanaryRequest,
    UpdateAdvocateInCapitolCanaryResponse
  >(request, 'POST', CAPITOL_CANARY_UPDATE_ADVOCATE_API_URL)
}
