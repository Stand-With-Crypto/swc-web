import { serve } from 'inngest/next'

import { airdropNFTWithInngest } from '@/inngest/functions/airdropNFT/airdropNFT'
import { backfillCongressionalDistrictCronJob } from '@/inngest/functions/backfillCongressionalDistrictCronJob'
import { backfillFailedNFT } from '@/inngest/functions/backfillFailedNFTCronJob'
import { backfillNFTWithInngest } from '@/inngest/functions/backfillNFT'
import { backfillNFTInngestCronJob } from '@/inngest/functions/backfillNFTCronJob'
import {
  backfillReactivationCron,
  backfillReactivationWithInngest,
} from '@/inngest/functions/backfillReactivation'
import { backfillSessionIdCronJob } from '@/inngest/functions/backfillSessionId'
import {
  backfillSMSOptInReplyWithInngest,
  backfillSMSOptInReplyWithInngestUpdateBatchOfUsers,
} from '@/inngest/functions/capitolCanary/backfillSMSOptInReply'
import { checkSMSOptInReplyWithInngest } from '@/inngest/functions/capitolCanary/checkSMSOptInReply'
import { emailViaCapitolCanaryWithInngest } from '@/inngest/functions/capitolCanary/emailViaCapitolCanary'
import { upsertAdvocateInCapitolCanaryWithInngest } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { cleanupNFTMintsWithInngest } from '@/inngest/functions/cleanupNFTMints'
import { cleanupPostalCodesWithInngest } from '@/inngest/functions/cleanupPostalCodes'
import { sendEventNotificationWithInngest } from '@/inngest/functions/eventNotification'
import { initialSignUpUserCommunicationJourney } from '@/inngest/functions/initialSignupUserCommunicationJourney/initialSignupUserCommunicationJourney'
import { monitorBaseETHBalances } from '@/inngest/functions/monitorBaseETHBalances'
import { setPrimaryCryptoAddressOfUserWithInngest } from '@/inngest/functions/setPrimaryCryptoAddressOfUser'
import {
  backfillPhoneNumberValidation,
  bulkSMSCommunicationJourney,
  enqueueSMS,
} from '@/inngest/functions/sms'
import { updateVoterActionsCounterCacheInngestCronJob } from '@/inngest/functions/updateVoterActionsCountCacheCronJob'
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
    backfillReactivationWithInngest,
    backfillReactivationCron,
    sendEventNotificationWithInngest,
    deleteUserActions,
    enqueueSMS,
    updateVoterActionsCounterCacheInngestCronJob,
  ],
})
