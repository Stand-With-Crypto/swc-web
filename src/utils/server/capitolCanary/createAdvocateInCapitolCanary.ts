import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import * as Sentry from '@sentry/nextjs'
import { User, Address, UserEmailAddress } from '@prisma/client'
import { capitolCanaryCampaignId } from '@/utils/server/capitolCanary/capitolCanaryCampaigns'

const CAPITOL_CANARY_API_KEY = requiredEnv(
  process.env.CAPITOL_CANARY_API_KEY,
  'process.env.CAPITOL_CANARY_API_KEY',
)

const CAPITOL_CANARY_API_SECRET = requiredEnv(
  process.env.CAPITOL_CANARY_API_SECRET,
  'process.env.CAPITOL_CANARY_API_SECRET',
)

const CAPITOL_CANARY_CREATE_ADVOCATE_API_URL = 'https://api.phone2action.com/2.0/advocates'

export const CAPITOL_CANARY_CREATE_ADVOCATE_SUCCESS_CODE = 1

// Interface is exported for external use.
export interface CreateAdvocateInCapitolCanaryPayloadRequirements {
  campaignId: capitolCanaryCampaignId
  user: User & { address: Address | undefined } & { emailAddress: UserEmailAddress | undefined }
  opts?: {
    isSmsOptin?: boolean
    isSmsOptinConfirmed?: boolean
    isSmsOptout?: boolean
    isEmailOptin?: boolean
    isEmailOptout?: boolean
  }
  metadata?: {
    p2aSource?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    utmTerm?: string
    utmContent?: string
    tags?: string[]
  }
}

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
export async function formatCapitolCanaryAdvocateCreationRequest(
  payload: CreateAdvocateInCapitolCanaryPayloadRequirements,
) {
  // Campaign validation.
  if (payload.campaignId === undefined) {
    throw new Error('must include campaign id')
  }

  const formattedRequest: CreateAdvocateInCapitolCanaryRequest = {
    campaigns: [payload.campaignId],
  }

  if (payload.user.fullName) {
    const [firstname, ...lastnameParts] = payload.user.fullName.split(' ')
    const lastname = lastnameParts.join(' ')
    formattedRequest.firstname = firstname
    formattedRequest.lastname = lastname
  }

  if (payload.user.phoneNumber) {
    formattedRequest.phone = payload.user.phoneNumber
  }

  if (payload.user.address) {
    const address = payload.user.address
    formattedRequest.address1 = `${address.streetNumber} ${address.route}`
    formattedRequest.address2 = address.subpremise
    formattedRequest.city = address.locality
    formattedRequest.state = address.administrativeAreaLevel1
    formattedRequest.zip5 = address.postalCode
    formattedRequest.country = address.countryCode
  }

  if (payload.user.emailAddress) {
    formattedRequest.email = payload.user.emailAddress.emailAddress
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

  // Formatted request validation.
  const errors = []
  if (!formattedRequest.email && !formattedRequest.phone) {
    errors.push('must include email or phone')
  }
  if (!formattedRequest.phone && (formattedRequest.smsOptin || formattedRequest.smsOptout)) {
    errors.push('must include phone if emailOptin or smsOptout is true')
  }
  if (!formattedRequest.smsOptin && formattedRequest.smsOptinConfirmed) {
    errors.push('must include smsOptin if smsOptinConfirmed is true')
  }
  if (!formattedRequest.email && (formattedRequest.emailOptin || formattedRequest.emailOptout)) {
    errors.push('must include email if emailOptin or emailOptout is true')
  }
  if (errors.length > 0) {
    throw new Error(errors.join('. '))
  }

  return formattedRequest
}

export async function createAdvocateInCapitolCanary(request: CreateAdvocateInCapitolCanaryRequest) {
  const url = new URL(CAPITOL_CANARY_CREATE_ADVOCATE_API_URL)
  const httpResp = await fetchReq(url.href, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${CAPITOL_CANARY_API_KEY}:${CAPITOL_CANARY_API_SECRET}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  }).catch(error => {
    Sentry.captureException(error, {
      level: 'error',
      extra: {
        campaigns: request.campaigns,
        email: request.email,
        phone: request.phone,
      },
      tags: {
        domain: 'createAdvocateInCapitolCanary',
        campaigns: request.campaigns.join(', '),
      },
    })
    throw error
  })
  return (await httpResp.json()) as CreateAdvocateInCapitolCanaryResponse
}
