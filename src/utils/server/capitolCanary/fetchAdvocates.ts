import {
  BackfillSMSOptInReplyPayloadRequirements,
  CheckSMSOptInReplyPayloadRequirements,
} from '@/utils/server/capitolCanary/payloadRequirements'
import { sendCapitolCanaryRequest } from '@/utils/server/capitolCanary/sendCapitolCanaryRequest'

const CAPITOL_CANARY_CREATE_ADVOCATE_API_URL = 'https://api.phone2action.com/2.0/advocates'

type FetchAdvocatesFromCapitolCanaryRequest = {
  updatedSince?: number
  page?: number
  campaignid?: number
  state?: string
  email?: string
  phone?: string
}

type FetchAdvocatesFromCapitolCanaryResponse = {
  data: FetchAdvocatesFromCapitolCanaryData[]
  pagination: FetchAdvocatesFromCapitolCanaryPageInfo
}

type FetchAdvocatesFromCapitolCanaryData = {
  id: number
  firstname: string
  middlename: string
  lastname: string
  connections: number
  created_at: string
  updated_at: string
  address: FetchAdvocatesFromCapitolCanaryAddress
  memberships: FetchAdvocatesFromCapitolCanaryMembership[]
  phones: FetchAdvocatesFromCapitolCanaryContact[]
  emails: FetchAdvocatesFromCapitolCanaryContact[]
  tags: string[]
}

type FetchAdvocatesFromCapitolCanaryAddress = {
  street1: string
  street2: string
  city: string
  state: string
  zip5: string
  zip4: string
  county: string
  countryAbbr: string
  countryName: string
  latitude: string
  longitude: string
}

type FetchAdvocatesFromCapitolCanaryMembership = {
  id: number
  campaignid: number
  campaigntype: string
  name: string
  created_at: string
  source: string
}

type FetchAdvocatesFromCapitolCanaryContact = {
  id: number
  address: string
  subscribed: boolean
  valid: boolean
}

type FetchAdvocatesFromCapitolCanaryPageInfo = {
  count: number
  current_page: number
  next_url: string
  per_page: number
}

export function formatCheckSMSOptInReplyRequest(request: CheckSMSOptInReplyPayloadRequirements) {
  if (!request.user.phoneNumber) {
    return new Error('phone number is required')
  }

  const formattedRequest: FetchAdvocatesFromCapitolCanaryRequest = {
    phone: request.user.phoneNumber,
  }
  if (request.campaignId) {
    formattedRequest.campaignid = request.campaignId
  }
  return formattedRequest
}

export function formatBackfillSMSOptInReplyRequest(
  request: BackfillSMSOptInReplyPayloadRequirements,
) {
  if (!request.page) {
    return new Error('page number is required')
  }

  const formattedRequest: FetchAdvocatesFromCapitolCanaryRequest = {
    page: request.page,
  }

  return formattedRequest
}

export async function fetchAdvocatesFromCapitolCanary(
  request: FetchAdvocatesFromCapitolCanaryRequest,
) {
  return await sendCapitolCanaryRequest<
    FetchAdvocatesFromCapitolCanaryRequest,
    FetchAdvocatesFromCapitolCanaryResponse
  >(request, 'GET', CAPITOL_CANARY_CREATE_ADVOCATE_API_URL)
}
