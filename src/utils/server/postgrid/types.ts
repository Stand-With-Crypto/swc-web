import type PostGrid from 'postgrid-node'

import type { PostgridStatusName } from '@/utils/server/postgrid/contants'
import type { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface PostGridAdvocateContact
  extends PostGrid.Contacts.ContactCreateParams.ContactCreateWithFirstName {
  metadata: {
    userId: string
  }
}

interface PostGridDTSIPersonContact
  extends PostGrid.Contacts.ContactCreateParams.ContactCreateWithFirstName {
  metadata: {
    dtsiSlug: string
  }
}

export interface PostGridOrderMetadata {
  userId: string
  campaignName: string
  countryCode: SupportedCountryCodes
  dtsiSlug: string
}

export interface SendLetterParams {
  to: PostGridDTSIPersonContact
  from: PostGridAdvocateContact
  templateId: string
  idempotencyKey: string
  metadata: PostGridOrderMetadata
}

export enum PostGridWebhookEventType {
  LETTER_CREATED = 'letter.created',
  LETTER_UPDATED = 'letter.updated',
  LETTER_CANCELLED = 'letter.cancelled',
}

export interface PostGridWebhookPayload {
  type: PostGridWebhookEventType
  data: {
    id: string
    live: boolean
    description: string | null
    from: PostGridAdvocateContact
    to: PostGridDTSIPersonContact
    metadata: PostGridOrderMetadata
    sendDate: string
    status: PostgridStatusName
    createdAt: string
    updatedAt: string
  }
}
