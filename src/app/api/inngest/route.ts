import { serve } from 'inngest/next'

import { airdropNFTWithInngest } from '@/inngest/functions/airdropNFT/airdropNFT'
import { backfillCongressionalDistrictCronJob } from '@/inngest/functions/backfillCongressionalDistrictCronJob'
import { backfillCountryCodesInngest } from '@/inngest/functions/backfillCountryCodes'
import { backfillFailedNFT } from '@/inngest/functions/backfillFailedNFTCronJob'
import { backfillIntlUsersWithInngest } from '@/inngest/functions/backfillIntlUsers'
import { processIntlUsersBatch } from '@/inngest/functions/backfillIntlUsers/logic'
import { backfillNFTWithInngest } from '@/inngest/functions/backfillNFT'
import { backfillNFTInngestCronJob } from '@/inngest/functions/backfillNFTCronJob'
import { backfillSessionIdCronJob } from '@/inngest/functions/backfillSessionId'
import { backfillUserCommunicationMessageStatus } from '@/inngest/functions/backfillUserCommunicationMessageStatus'
import { backfillUserCountryCodeEmptyWithInngest } from '@/inngest/functions/backfillUserCountryCodeEmpty'
import {
  backfillSMSOptInReplyWithInngest,
  backfillSMSOptInReplyWithInngestUpdateBatchOfUsers,
} from '@/inngest/functions/capitolCanary/backfillSMSOptInReply'
import { checkSMSOptInReplyWithInngest } from '@/inngest/functions/capitolCanary/checkSMSOptInReply'
import { emailViaCapitolCanaryWithInngest } from '@/inngest/functions/capitolCanary/emailViaCapitolCanary'
import { upsertAdvocateInCapitolCanaryWithInngest } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { cleanupNFTMintsWithInngest } from '@/inngest/functions/cleanupNFTMints'
import { cleanupPostalCodesWithInngest } from '@/inngest/functions/cleanupPostalCodes'
import { cleanupDatadogSyntheticTestsWithInngest } from '@/inngest/functions/datadog/cleanup'
import { updateDistrictsRankings } from '@/inngest/functions/districtsRankings/updateRankings'
import { globalSendEventNotifications } from '@/inngest/functions/eventNotification'
import { initialSignUpUserCommunicationJourney } from '@/inngest/functions/initialSignupUserCommunicationJourney/initialSignupUserCommunicationJourney'
import { monitorBaseETHBalances } from '@/inngest/functions/monitorBaseETHBalances'
import { setPrimaryCryptoAddressOfUserWithInngest } from '@/inngest/functions/setPrimaryCryptoAddressOfUser'
import {
  backfillMissingCommunications,
  backfillOptedOutUsers,
  backfillPhoneNumberValidation,
  bulkSMSCommunicationJourney,
  enqueueSMS,
} from '@/inngest/functions/sms'
import { updateMetricsCacheInngestCronJob } from '@/inngest/functions/updateMeyticsCacheCronJob'
import { deleteUserActions } from '@/inngest/functions/user/deleteUserActions'
import {
  auditUsersTotalDonationAmountUsdInngest,
  auditUsersTotalDonationAmountUsdInngestAuditBatchOfUsers,
} from '@/inngest/functions/usersTotalDonationAmountUsd/audit'
import {
  backfillUsersTotalDonationAmountUsdInngest,
  backfillUsersTotalDonationAmountUsdInngestUpdateBatchOfUsers,
} from '@/inngest/functions/usersTotalDonationAmountUsd/backfill'
import { inngest } from '@/inngest/inngest'

export const maxDuration = 180 // 3 minutes

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    backfillSessionIdCronJob,
    upsertAdvocateInCapitolCanaryWithInngest,
    emailViaCapitolCanaryWithInngest,
    checkSMSOptInReplyWithInngest,
    backfillSMSOptInReplyWithInngest,
    backfillSMSOptInReplyWithInngestUpdateBatchOfUsers,
    airdropNFTWithInngest,
    backfillCountryCodesInngest,
    cleanupPostalCodesWithInngest,
    monitorBaseETHBalances,
    setPrimaryCryptoAddressOfUserWithInngest,
    backfillNFTWithInngest,
    backfillFailedNFT,
    backfillNFTInngestCronJob,
    cleanupNFTMintsWithInngest,
    backfillUsersTotalDonationAmountUsdInngest,
    backfillUsersTotalDonationAmountUsdInngestUpdateBatchOfUsers,
    auditUsersTotalDonationAmountUsdInngest,
    auditUsersTotalDonationAmountUsdInngestAuditBatchOfUsers,
    initialSignUpUserCommunicationJourney,
    backfillCongressionalDistrictCronJob,
    bulkSMSCommunicationJourney,
    backfillPhoneNumberValidation,
    ...globalSendEventNotifications,
    deleteUserActions,
    enqueueSMS,
    backfillUserCommunicationMessageStatus,
    updateMetricsCacheInngestCronJob,
    backfillOptedOutUsers,
    cleanupDatadogSyntheticTestsWithInngest,
    updateDistrictsRankings,
    backfillUserCountryCodeEmptyWithInngest,
    backfillIntlUsersWithInngest,
    processIntlUsersBatch,
    backfillMissingCommunications,
  ],
})
