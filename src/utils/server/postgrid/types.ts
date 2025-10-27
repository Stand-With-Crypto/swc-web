import type { PostgridStatusName } from '@/utils/server/postgrid/contants'
import type { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import type {
  PostGridRecipientContact,
  PostGridSenderContact,
} from '@/validation/fields/zodPostgridAddress'

export interface PostGridOrderMetadata {
  userId: string
  campaignName: string
  countryCode: SupportedCountryCodes
  dtsiSlug: string
}

export interface SendLetterParams {
  to: PostGridRecipientContact
  from: PostGridSenderContact
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
    from: PostGridSenderContact
    to: PostGridRecipientContact
    metadata: PostGridOrderMetadata
    sendDate: string
    status: PostgridStatusName
    createdAt: string
    updatedAt: string
  }
}
