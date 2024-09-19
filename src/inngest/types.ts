import { User, UserActionType } from '@prisma/client'
import { EventSchemas } from 'inngest'
import { z } from 'zod'

import { BulkSMSPayload } from '@/inngest/functions/sms/types'
import {
  CapitolCanaryCampaignId,
  SandboxCapitolCanaryCampaignId,
} from '@/utils/server/capitolCanary/campaigns'
import {
  EmailViaCapitolCanaryPayloadRequirements,
  UpsertAdvocateInCapitolCanaryPayloadRequirements,
} from '@/utils/server/capitolCanary/payloadRequirements'
import { NFTSlug } from '@/utils/shared/nft'

type CAPITOL_CANARY_CHECK_SMS_OPT_IN_REPLY_PAYLOAD = {
  name: 'capitol.canary/check.sms.opt.in.reply'
  data: {
    campaignId?: CapitolCanaryCampaignId | SandboxCapitolCanaryCampaignId
    user: User
  }
}

type AIRDROP_NFT_INNGEST_PAYLOAD = {
  name: 'app/airdrop.request'
  data: {
    nftMintId: string
    nftSlug: NFTSlug
    recipientWalletAddress: string
    userId: string
  }
}

type BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_PAYLOAD = {
  name: 'script/backfill.us.congressional.districts.cron.job'
}

type BACKFILL_FAILED_NFT_INNGEST_PAYLOAD = {
  name: 'script/backfill.failed.nft'
  data: {
    limit?: number
    failed: boolean
    timedout: boolean
  }
}

type BACKFILL_NFT_INNGEST_PAYLOAD = {
  name: 'script/backfill-nft'
  data: {
    limit?: number
    persist: boolean
  }
}

type BACKFILL_NFT_INNGEST_CRON_JOB_PAYLOAD = {
  name: 'script/backfill.nft.cron.job'
}

type BACKFILL_REACTIVATION_INNGEST_PAYLOAD = {
  name: 'script/backfill-reactivation'
  data: {
    testEmail?: string
    persist?: boolean
    limit?: number
  }
}

type BACKFILL_SESSION_ID_INNGEST_PAYLOAD = {
  name: 'script/backfill.session.id'
}

type CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_PAYLOAD = {
  name: 'capitol.canary/backfill.sms.opt.in.reply'
}

type CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_PAYLOAD = {
  name: 'capitol.canary/backfill.sms.opt.in.reply/update.batch.of.users'
  data: {
    page: number
  }
}

type CAPITOL_CANARY_EMAIL_INNGEST_EVENT_PAYLOAD = {
  name: 'capitol.canary/email'
  data: EmailViaCapitolCanaryPayloadRequirements
}

type CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_PAYLOAD = {
  name: 'capitol.canary/upsert.advocate'
  data: UpsertAdvocateInCapitolCanaryPayloadRequirements
}

type CLEANUP_NFT_MINTS_EVENT_PAYLOAD = {
  name: 'script/cleanup.nft.mints'
  data: {
    persist: boolean
  }
}

type CLEANUP_POSTAL_CODES_INNGEST_EVENT_PAYLOAD = {
  name: 'script/cleanup-postal-codes'
  data: {
    persist: boolean
  }
}

type SET_CRYPTO_ADDRESS_OF_USER_INNGEST_EVENT_PAYLOAD = {
  name: 'script/set-primary-crypto-address-of-user'
  data: {
    userId: string
    cryptoAddressId: string
    persist: boolean
  }
}

type BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_PAYLOAD = {
  name: 'script.backfill-phone-number-validation'
  data: {
    persist?: boolean
  }
}

type BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_PAYLOAD = {
  name: 'app/user.communication/bulk.sms'
  data: BulkSMSPayload
}

type GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_PAYLOAD = {
  name: 'app/user.communication/goodbye.sms'
  data: {
    phoneNumber: string
  }
}

type UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_PAYLOAD = {
  name: 'app/user.communication/unstop-confirmation.sms'
  data: {
    phoneNumber: string
  }
}

type WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_PAYLOAD = {
  name: 'app/user.communication/welcome.sms'
  data: {
    phoneNumber: string
  }
}

type DELETE_USER_ACTIONS_INNGEST_EVENT_PAYLOAD = {
  name: 'script/delete-user-actions'
  data: {
    userId: string
    customActions?: Exclude<UserActionType, 'OPT_IN'>[]
    persist?: boolean
  }
}

type AUDIT_USER_BATCH_EVENT_PAYLOAD = {
  name: 'script/audit.users.total.donation.amount.usd/audit.batch.of.users'
  data: {
    userCursor: string
  }
}

type BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_EVENT_PAYLOAD = {
  name: 'script/backfill.users.total.donation.amount.usd'
  data: {
    userCursor: string
  }
}

type UPDATE_USER_BATCH_EVENT_PAYLOAD = {
  name: 'script/backfill.users.total.donation.amount.usd/update.batch.of.users'
  data: {
    userCursor: string
  }
}

type MONITOR_BASE_ETH_BALANCES_INNGEST_EVENT_PAYLOAD = {
  name: 'monitor.base.eth.balances'
}

type EventTypes =
  | CAPITOL_CANARY_CHECK_SMS_OPT_IN_REPLY_PAYLOAD
  | AIRDROP_NFT_INNGEST_PAYLOAD
  | BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_PAYLOAD
  | BACKFILL_FAILED_NFT_INNGEST_PAYLOAD
  | BACKFILL_NFT_INNGEST_PAYLOAD
  | BACKFILL_NFT_INNGEST_CRON_JOB_PAYLOAD
  | BACKFILL_REACTIVATION_INNGEST_PAYLOAD
  | BACKFILL_SESSION_ID_INNGEST_PAYLOAD
  | CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_PAYLOAD
  | CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_PAYLOAD
  | CAPITOL_CANARY_EMAIL_INNGEST_EVENT_PAYLOAD
  | CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_PAYLOAD
  | CLEANUP_NFT_MINTS_EVENT_PAYLOAD
  | CLEANUP_POSTAL_CODES_INNGEST_EVENT_PAYLOAD
  | SET_CRYPTO_ADDRESS_OF_USER_INNGEST_EVENT_PAYLOAD
  | BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_PAYLOAD
  | BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_PAYLOAD
  | GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_PAYLOAD
  | UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_PAYLOAD
  | WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_PAYLOAD
  | DELETE_USER_ACTIONS_INNGEST_EVENT_PAYLOAD
  | AUDIT_USER_BATCH_EVENT_PAYLOAD
  | BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_EVENT_PAYLOAD
  | UPDATE_USER_BATCH_EVENT_PAYLOAD
  | MONITOR_BASE_ETH_BALANCES_INNGEST_EVENT_PAYLOAD

export const INITIAL_SIGNUP_USER_COMMUNICATION_PAYLOAD = z.object({
  name: z.literal('app/user.communication/initial.signup'),
  data: z.object({
    userId: z.string(),
    sessionId: z.string().optional().nullable(),
    decreaseTimers: z.boolean().default(false).optional(),
  }),
})

export const INNGEST_SCHEMAS = new EventSchemas()
  .fromUnion<EventTypes>()
  .fromZod([INITIAL_SIGNUP_USER_COMMUNICATION_PAYLOAD])
