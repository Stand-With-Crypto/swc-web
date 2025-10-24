import type PostGrid from 'postgrid-node'

import type { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface PostGridOrderMetadata {
  userId: string
  campaignName: string
  countryCode: SupportedCountryCodes
  dtsiSlug: string
}

export interface SendLetterParams {
  to: PostGrid.Contacts.ContactCreateParams.ContactCreateWithFirstName
  from: PostGrid.Contacts.ContactCreateParams.ContactCreateWithFirstName
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
