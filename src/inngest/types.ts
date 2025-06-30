import { EventSchemas } from 'inngest'

import type { AirdropNftInngestSchema } from '@/inngest/functions/airdropNFT/airdropNFT'
import type { BackfillAddressElectoralZoneCoordinatorEventSchema } from '@/inngest/functions/backfillAddressElectoralZone'
import type { ProcessAddressElectoralZoneProcessorEventSchema } from '@/inngest/functions/backfillAddressElectoralZone/logic'
import type { BackfillUsCongressionalDistrictsInngestCronJobSchema } from '@/inngest/functions/backfillCongressionalDistrictCronJob'
import type { BackfillCountryCodesEventSchema } from '@/inngest/functions/backfillCountryCodes'
import type { BackfillFailedNftInngestSchema } from '@/inngest/functions/backfillFailedNFTCronJob'
import { BackfillIntlUsersSchema } from '@/inngest/functions/backfillIntlUsers'
import { ProcessBatchSchema } from '@/inngest/functions/backfillIntlUsers/logic'
import type { BackfillNftInngestSchema } from '@/inngest/functions/backfillNFT'
import type { BackfillNftInngestCronJobSchema } from '@/inngest/functions/backfillNFTCronJob'
import type { BackfillSessionIdInngestSchema } from '@/inngest/functions/backfillSessionId'
import { BackfillUserActionElectoralZoneCoordinatorEventSchema } from '@/inngest/functions/backfillUserActionElectoralZone'
import { ProcessUserActionElectoralZoneProcessorEventSchema } from '@/inngest/functions/backfillUserActionElectoralZone/logic'
import { BackfillUserCommunicationMessageStatusSchema } from '@/inngest/functions/backfillUserCommunicationMessageStatus'
import { BackfillUserCountryCodeEmptyInngestSchema } from '@/inngest/functions/backfillUserCountryCodeEmpty'
import type {
  CapitolCanaryBackfillSmsOptInReplySchema,
  CapitolCanaryBackfillSmsOptInReplyUpdateBatchOfUsersSchema,
} from '@/inngest/functions/capitolCanary/backfillSMSOptInReply'
import type { CapitolCanaryCheckSmsOptInReplySchema } from '@/inngest/functions/capitolCanary/checkSMSOptInReply'
import { CapitolCanaryDeleteNotSupportedCountryCodeAdvocatesInngestSchema } from '@/inngest/functions/capitolCanary/deleteNotSupportedCountryCodeAdvocates'
import type { CapitolCanaryEmailInngestEventSchema } from '@/inngest/functions/capitolCanary/emailViaCapitolCanary'
import type { CapitolCanaryUpsertAdvocateInngestSchema } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import type { CleanupNftMintsEventSchema } from '@/inngest/functions/cleanupNFTMints'
import type { CleanupPostalCodesInngestEventSchema } from '@/inngest/functions/cleanupPostalCodes'
import { UpdateDistrictsRankingsCronJobSchema } from '@/inngest/functions/districtsRankings/updateRankings'
import type { InitialSignupUserCommunicationSchema } from '@/inngest/functions/initialSignupUserCommunicationJourney/initialSignupUserCommunicationJourney'
import type { MonitorBaseEthBalancesInngestEventSchema } from '@/inngest/functions/monitorBaseETHBalances'
import { SyncSendgridContactsCoordinatorSchema } from '@/inngest/functions/sendgridContactsCronJob'
import { SyncSendgridContactsProcessorSchema } from '@/inngest/functions/sendgridContactsCronJob/logic'
import type { SetCryptoAddressOfUserInngestEventSchema } from '@/inngest/functions/setPrimaryCryptoAddressOfUser'
import type { BackfillMissingCommunicationsInngestEventSchema } from '@/inngest/functions/sms/backfillMissingCommunications'
import type { BackfillOptedOutUsersSchema } from '@/inngest/functions/sms/backfillOptedOutUsers'
import type { BackfillPhoneNumberValidationInngestEventSchema } from '@/inngest/functions/sms/backfillPhoneNumberValidation'
import type { BulkSmsCommunicationJourneyInngestEventSchema } from '@/inngest/functions/sms/bulkSMSCommunicationJourney'
import type { EnqueueSMSInngestEventSchema } from '@/inngest/functions/sms/enqueueMessages'
import type { UpdateMetricsCounterCacheCronJobSchema } from '@/inngest/functions/updateMeyticsCacheCronJob'
import type { DeleteUserActionsInngestEventSchema } from '@/inngest/functions/user/deleteUserActions'
import type { AuditUserBatchEventSchema } from '@/inngest/functions/usersTotalDonationAmountUsd/audit'
import type {
  BackfillUsersTotalDonationAmountUsdEventSchema,
  UpdateUserBatchEventSchema,
} from '@/inngest/functions/usersTotalDonationAmountUsd/backfill'

type EventTypes =
  | CapitolCanaryCheckSmsOptInReplySchema
  | AirdropNftInngestSchema
  | BackfillCountryCodesEventSchema
  | BackfillUsCongressionalDistrictsInngestCronJobSchema
  | BackfillFailedNftInngestSchema
  | BackfillNftInngestSchema
  | BackfillNftInngestCronJobSchema
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
  | BackfillUserCommunicationMessageStatusSchema
  | UpdateMetricsCounterCacheCronJobSchema
  | BackfillOptedOutUsersSchema
  | UpdateDistrictsRankingsCronJobSchema
  | BackfillUserCountryCodeEmptyInngestSchema
  | BackfillIntlUsersSchema
  | ProcessBatchSchema
  | BackfillMissingCommunicationsInngestEventSchema
  | CapitolCanaryDeleteNotSupportedCountryCodeAdvocatesInngestSchema
  | SyncSendgridContactsCoordinatorSchema
  | SyncSendgridContactsProcessorSchema
  | BackfillAddressElectoralZoneCoordinatorEventSchema
  | ProcessAddressElectoralZoneProcessorEventSchema
  | BackfillUserActionElectoralZoneCoordinatorEventSchema
  | ProcessUserActionElectoralZoneProcessorEventSchema

export const INNGEST_SCHEMAS = new EventSchemas().fromUnion<EventTypes>()
