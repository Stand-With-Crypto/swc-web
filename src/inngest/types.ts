import { EventSchemas } from 'inngest'

import type { AirdropNftInngestSchema } from '@/inngest/functions/airdropNFT/airdropNFT'
import type { BackfillUsCongressionalDistrictsInngestCronJobSchema } from '@/inngest/functions/backfillCongressionalDistrictCronJob'
import type { BackfillFailedNftInngestSchema } from '@/inngest/functions/backfillFailedNFTCronJob'
import type { BackfillNftInngestSchema } from '@/inngest/functions/backfillNFT'
import type { BackfillNftInngestCronJobSchema } from '@/inngest/functions/backfillNFTCronJob'
import type { BackfillReactivationInngestSchema } from '@/inngest/functions/backfillReactivation'
import type { BackfillSessionIdInngestSchema } from '@/inngest/functions/backfillSessionId'
import type {
  CapitolCanaryBackfillSmsOptInReplySchema,
  CapitolCanaryBackfillSmsOptInReplyUpdateBatchOfUsersSchema,
} from '@/inngest/functions/capitolCanary/backfillSMSOptInReply'
import type { CapitolCanaryCheckSmsOptInReplySchema } from '@/inngest/functions/capitolCanary/checkSMSOptInReply'
import type { CapitolCanaryEmailInngestEventSchema } from '@/inngest/functions/capitolCanary/emailViaCapitolCanary'
import type { CapitolCanaryUpsertAdvocateInngestSchema } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import type { CleanupNftMintsEventSchema } from '@/inngest/functions/cleanupNFTMints'
import type { CleanupPostalCodesInngestEventSchema } from '@/inngest/functions/cleanupPostalCodes'
import type { InitialSignupUserCommunicationSchema } from '@/inngest/functions/initialSignupUserCommunicationJourney/initialSignupUserCommunicationJourney'
import type { MonitorBaseEthBalancesInngestEventSchema } from '@/inngest/functions/monitorBaseETHBalances'
import type { SetCryptoAddressOfUserInngestEventSchema } from '@/inngest/functions/setPrimaryCryptoAddressOfUser'
import type { BackfillPhoneNumberValidationInngestEventSchema } from '@/inngest/functions/sms/backfillPhoneNumberValidation'
import type { BulkSmsCommunicationJourneyInngestEventSchema } from '@/inngest/functions/sms/bulkSMSCommunicationJourney'
import type { EnqueueSMSInngestEventSchema } from '@/inngest/functions/sms/enqueueMessages'
import { UpdateMetricsCounterCacheCronJobSchema } from '@/inngest/functions/updateMeyticsCacheCronJob'
import type { DeleteUserActionsInngestEventSchema } from '@/inngest/functions/user/deleteUserActions'
import type { AuditUserBatchEventSchema } from '@/inngest/functions/usersTotalDonationAmountUsd/audit'
import type {
  BackfillUsersTotalDonationAmountUsdEventSchema,
  UpdateUserBatchEventSchema,
} from '@/inngest/functions/usersTotalDonationAmountUsd/backfill'

type EventTypes =
  | CapitolCanaryCheckSmsOptInReplySchema
  | AirdropNftInngestSchema
  | BackfillUsCongressionalDistrictsInngestCronJobSchema
  | BackfillFailedNftInngestSchema
  | BackfillNftInngestSchema
  | BackfillNftInngestCronJobSchema
  | BackfillReactivationInngestSchema
  | BackfillSessionIdInngestSchema
  | CapitolCanaryBackfillSmsOptInReplySchema
  | CapitolCanaryBackfillSmsOptInReplyUpdateBatchOfUsersSchema
  | CapitolCanaryEmailInngestEventSchema
  | CapitolCanaryUpsertAdvocateInngestSchema
  | CleanupNftMintsEventSchema
  | CleanupPostalCodesInngestEventSchema
  | SetCryptoAddressOfUserInngestEventSchema
  | BackfillPhoneNumberValidationInngestEventSchema
  | BulkSmsCommunicationJourneyInngestEventSchema
  | DeleteUserActionsInngestEventSchema
  | AuditUserBatchEventSchema
  | BackfillUsersTotalDonationAmountUsdEventSchema
  | UpdateUserBatchEventSchema
  | MonitorBaseEthBalancesInngestEventSchema
  | InitialSignupUserCommunicationSchema
  | EnqueueSMSInngestEventSchema
  | UpdateMetricsCounterCacheCronJobSchema

export const INNGEST_SCHEMAS = new EventSchemas().fromUnion<EventTypes>()
