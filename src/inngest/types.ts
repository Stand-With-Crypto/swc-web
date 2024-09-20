import { EventSchemas } from 'inngest'

import type { AIRDROP_NFT_INNGEST_SCHEMA } from '@/inngest/functions/airdropNFT/airdropNFT'
import type { BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_SCHEMA } from '@/inngest/functions/backfillCongressionalDistrictCronJob'
import type { BACKFILL_FAILED_NFT_INNGEST_SCHEMA } from '@/inngest/functions/backfillFailedNFTCronJob'
import type { BACKFILL_NFT_INNGEST_SCHEMA } from '@/inngest/functions/backfillNFT'
import type { BACKFILL_NFT_INNGEST_CRON_JOB_SCHEMA } from '@/inngest/functions/backfillNFTCronJob'
import type { BACKFILL_REACTIVATION_INNGEST_SCHEMA } from '@/inngest/functions/backfillReactivation'
import type { BACKFILL_SESSION_ID_INNGEST_SCHEMA } from '@/inngest/functions/backfillSessionId'
import type {
  CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_SCHEMA,
  CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_SCHEMA,
} from '@/inngest/functions/capitolCanary/backfillSMSOptInReply'
import type { CAPITOL_CANARY_CHECK_SMS_OPT_IN_REPLY_SCHEMA } from '@/inngest/functions/capitolCanary/checkSMSOptInReply'
import type { CAPITOL_CANARY_EMAIL_INNGEST_EVENT_SCHEMA } from '@/inngest/functions/capitolCanary/emailViaCapitolCanary'
import type { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_SCHEMA } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import type { CLEANUP_NFT_MINTS_EVENT_SCHEMA } from '@/inngest/functions/cleanupNFTMints'
import type { CLEANUP_POSTAL_CODES_INNGEST_EVENT_SCHEMA } from '@/inngest/functions/cleanupPostalCodes'
import type { INITIAL_SIGNUP_USER_COMMUNICATION_SCHEMA } from '@/inngest/functions/initialSignupUserCommunicationJourney/initialSignupUserCommunicationJourney'
import type { MONITOR_BASE_ETH_BALANCES_INNGEST_EVENT_SCHEMA } from '@/inngest/functions/monitorBaseETHBalances'
import type { SET_CRYPTO_ADDRESS_OF_USER_INNGEST_EVENT_SCHEMA } from '@/inngest/functions/setPrimaryCryptoAddressOfUser'
import type { BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_SCHEMA } from '@/inngest/functions/sms/backfillPhoneNumberValidation'
import type { BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_SCHEMA } from '@/inngest/functions/sms/bulkSMSCommunicationJourney'
import type { GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_SCHEMA } from '@/inngest/functions/sms/goodbyeSMSCommunicationJourney'
import type { UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_SCHEMA } from '@/inngest/functions/sms/unstopConfirmationSMSCommunicationJourney'
import type { WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_SCHEMA } from '@/inngest/functions/sms/welcomeSMSCommunicationJourney'
import type { DELETE_USER_ACTIONS_INNGEST_EVENT_SCHEMA } from '@/inngest/functions/user/deleteUserActions'
import type { AUDIT_USER_BATCH_EVENT_SCHEMA } from '@/inngest/functions/usersTotalDonationAmountUsd/audit'
import type {
  BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_EVENT_SCHEMA,
  UPDATE_USER_BATCH_EVENT_SCHEMA,
} from '@/inngest/functions/usersTotalDonationAmountUsd/backfill'

type EventTypes =
  | CAPITOL_CANARY_CHECK_SMS_OPT_IN_REPLY_SCHEMA
  | AIRDROP_NFT_INNGEST_SCHEMA
  | BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_SCHEMA
  | BACKFILL_FAILED_NFT_INNGEST_SCHEMA
  | BACKFILL_NFT_INNGEST_SCHEMA
  | BACKFILL_NFT_INNGEST_CRON_JOB_SCHEMA
  | BACKFILL_REACTIVATION_INNGEST_SCHEMA
  | BACKFILL_SESSION_ID_INNGEST_SCHEMA
  | CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_SCHEMA
  | CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_SCHEMA
  | CAPITOL_CANARY_EMAIL_INNGEST_EVENT_SCHEMA
  | CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_SCHEMA
  | CLEANUP_NFT_MINTS_EVENT_SCHEMA
  | CLEANUP_POSTAL_CODES_INNGEST_EVENT_SCHEMA
  | SET_CRYPTO_ADDRESS_OF_USER_INNGEST_EVENT_SCHEMA
  | BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_SCHEMA
  | BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_SCHEMA
  | GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_SCHEMA
  | UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_SCHEMA
  | WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_SCHEMA
  | DELETE_USER_ACTIONS_INNGEST_EVENT_SCHEMA
  | AUDIT_USER_BATCH_EVENT_SCHEMA
  | BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_EVENT_SCHEMA
  | UPDATE_USER_BATCH_EVENT_SCHEMA
  | MONITOR_BASE_ETH_BALANCES_INNGEST_EVENT_SCHEMA
  | INITIAL_SIGNUP_USER_COMMUNICATION_SCHEMA

export const INNGEST_SCHEMAS = new EventSchemas().fromUnion<EventTypes>()
