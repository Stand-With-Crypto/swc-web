import { User, UserActionType } from '@prisma/client'
import { EventSchemas } from 'inngest'
import { z } from 'zod'

import { AIRDROP_NFT_INNGEST_EVENT_NAME } from '@/inngest/functions/airdropNFT/airdropNFT'
import { BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_EVENT_NAME } from '@/inngest/functions/backfillCongressionalDistrictCronJob'
import { BACKFILL_FAILED_NFT_INNGEST_EVENT_NAME } from '@/inngest/functions/backfillFailedNFTCronJob'
import { BACKFILL_NFT_INNGEST_EVENT_NAME } from '@/inngest/functions/backfillNFT'
import { BACKFILL_NFT_INNGEST_CRON_JOB_EVENT_NAME } from '@/inngest/functions/backfillNFTCronJob'
import { BACKFILL_REACTIVATION_INNGEST_EVENT_NAME } from '@/inngest/functions/backfillReactivation'
import { BACKFILL_SESSION_ID_INNGEST_EVENT_NAME } from '@/inngest/functions/backfillSessionId'
import {
  CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_EVENT_NAME,
  CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_EVENT_NAME,
} from '@/inngest/functions/capitolCanary/backfillSMSOptInReply'
import { CAPITOL_CANARY_CHECK_SMS_OPT_IN_REPLY_EVENT_NAME } from '@/inngest/functions/capitolCanary/checkSMSOptInReply'
import { CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/emailViaCapitolCanary'
import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { CLEANUP_NFT_MINTS_EVENT_NAME } from '@/inngest/functions/cleanupNFTMints'
import { CLEANUP_POSTAL_CODES_INNGEST_EVENT_NAME } from '@/inngest/functions/cleanupPostalCodes'
import { INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/initialSignupUserCommunicationJourney/initialSignupUserCommunicationJourney'
import { MONITOR_BASE_ETH_BALANCES_INNGEST_EVENT_NAME } from '@/inngest/functions/monitorBaseETHBalances'
import { SET_CRYPTO_ADDRESS_OF_USER_INNGEST_EVENT_NAME } from '@/inngest/functions/setPrimaryCryptoAddressOfUser'
import { BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/backfillPhoneNumberValidation'
import {
  BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
  BulkSMSPayload,
} from '@/inngest/functions/sms/bulkSMSCommunicationJourney'
import { GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/goodbyeSMSCommunicationJourney'
import { UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/unstopConfirmationSMSCommunicationJourney'
import { WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/welcomeSMSCommunicationJourney'
import { DELETE_USER_ACTIONS_INNGEST_EVENT_NAME } from '@/inngest/functions/user/deleteUserActions'
import { AUDIT_USER_BATCH_EVENT_NAME } from '@/inngest/functions/usersTotalDonationAmountUsd/audit'
import {
  BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_EVENT_NAME,
  UPDATE_USER_BATCH_EVENT_NAME,
} from '@/inngest/functions/usersTotalDonationAmountUsd/backfill'
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
  name: typeof CAPITOL_CANARY_CHECK_SMS_OPT_IN_REPLY_EVENT_NAME
  data: {
    campaignId?: CapitolCanaryCampaignId | SandboxCapitolCanaryCampaignId
    user: User
  }
}

type AIRDROP_NFT_INNGEST_PAYLOAD = {
  name: typeof AIRDROP_NFT_INNGEST_EVENT_NAME
  data: {
    nftMintId: string
    nftSlug: NFTSlug
    recipientWalletAddress: string
    userId: string
  }
}

type BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_PAYLOAD = {
  name: typeof BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_EVENT_NAME
}

type BACKFILL_FAILED_NFT_INNGEST_PAYLOAD = {
  name: typeof BACKFILL_FAILED_NFT_INNGEST_EVENT_NAME
  data: {
    limit?: number
    failed: boolean
    timedout: boolean
  }
}

type BACKFILL_NFT_INNGEST_PAYLOAD = {
  name: typeof BACKFILL_NFT_INNGEST_EVENT_NAME
  data: {
    limit?: number
    persist: boolean
  }
}

type BACKFILL_NFT_INNGEST_CRON_JOB_PAYLOAD = {
  name: typeof BACKFILL_NFT_INNGEST_CRON_JOB_EVENT_NAME
}

type BACKFILL_REACTIVATION_INNGEST_PAYLOAD = {
  name: typeof BACKFILL_REACTIVATION_INNGEST_EVENT_NAME
  data: {
    testEmail?: string
    persist?: boolean
    limit?: number
  }
}

type BACKFILL_SESSION_ID_INNGEST_PAYLOAD = {
  name: typeof BACKFILL_SESSION_ID_INNGEST_EVENT_NAME
}

type CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_PAYLOAD = {
  name: typeof CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_EVENT_NAME
}

type CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_PAYLOAD = {
  name: typeof CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_EVENT_NAME
  data: {
    page: number
  }
}

type CAPITOL_CANARY_EMAIL_INNGEST_EVENT_PAYLOAD = {
  name: typeof CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME
  data: EmailViaCapitolCanaryPayloadRequirements
}

type CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_PAYLOAD = {
  name: typeof CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME
  data: UpsertAdvocateInCapitolCanaryPayloadRequirements
}

type CLEANUP_NFT_MINTS_EVENT_PAYLOAD = {
  name: typeof CLEANUP_NFT_MINTS_EVENT_NAME
  data: {
    persist: boolean
  }
}

type CLEANUP_POSTAL_CODES_INNGEST_EVENT_PAYLOAD = {
  name: typeof CLEANUP_POSTAL_CODES_INNGEST_EVENT_NAME
  data: {
    persist: boolean
  }
}

type SET_CRYPTO_ADDRESS_OF_USER_INNGEST_EVENT_PAYLOAD = {
  name: typeof SET_CRYPTO_ADDRESS_OF_USER_INNGEST_EVENT_NAME
  data: {
    userId: string
    cryptoAddressId: string
    persist: boolean
  }
}

type BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_PAYLOAD = {
  name: typeof BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_NAME
  data: {
    persist?: boolean
  }
}

type BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_PAYLOAD = {
  name: typeof BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME
  data: BulkSMSPayload
}

type GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_PAYLOAD = {
  name: typeof GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME
  data: {
    phoneNumber: string
  }
}

type UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_PAYLOAD = {
  name: typeof UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME
  data: {
    phoneNumber: string
  }
}

type WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_PAYLOAD = {
  name: typeof WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME
  data: {
    phoneNumber: string
  }
}

type DELETE_USER_ACTIONS_INNGEST_EVENT_PAYLOAD = {
  name: typeof DELETE_USER_ACTIONS_INNGEST_EVENT_NAME
  data: {
    userId: string
    customActions?: Exclude<UserActionType, 'OPT_IN'>[]
    persist?: boolean
  }
}

type AUDIT_USER_BATCH_EVENT_PAYLOAD = {
  name: typeof AUDIT_USER_BATCH_EVENT_NAME
  data: {
    userCursor: string
  }
}

type BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_EVENT_PAYLOAD = {
  name: typeof BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_EVENT_NAME
  data: {
    userCursor: string
  }
}

type UPDATE_USER_BATCH_EVENT_PAYLOAD = {
  name: typeof UPDATE_USER_BATCH_EVENT_NAME
  data: {
    userCursor: string
  }
}

type MONITOR_BASE_ETH_BALANCES_INNGEST_EVENT_PAYLOAD = {
  name: typeof MONITOR_BASE_ETH_BALANCES_INNGEST_EVENT_NAME
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
  name: z.literal(INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME),
  data: z.object({
    userId: z.string(),
    sessionId: z.string().optional().nullable(),
    decreaseTimers: z.boolean().default(false).optional(),
  }),
})

export const INNGEST_SCHEMAS = new EventSchemas()
  .fromUnion<EventTypes>()
  .fromZod([INITIAL_SIGNUP_USER_COMMUNICATION_PAYLOAD])
