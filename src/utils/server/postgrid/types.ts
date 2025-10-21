import type { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface PostGridLetterAddress {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  provinceOrState: string
  postalOrZip: string
  countryCode: string
}

export interface PostGridOrderMetadata {
  userId: string
  campaignName: string
  countryCode: SupportedCountryCodes
  dtsiSlug: string
}

export interface CreateLetterParams {
  to: PostGridLetterAddress
  from: PostGridLetterAddress
  templateId: string
  idempotencyKey: string
  metadata: PostGridOrderMetadata
}

export interface PostGridWebhookEvent {
  id: string
  type: string
  data: {
    id: string
    status: string
    metadata?: Record<string, string>
    [key: string]: any
  }
}
