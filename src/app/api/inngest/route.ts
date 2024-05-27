import { serve } from 'inngest/next'

import { airdropNFTWithInngest } from '@/inngest/functions/airdropNFT/airdropNFT'
import { backfillDonationActionWithInngest } from '@/inngest/functions/backfillDonationAction'
import { backfillNFTWithInngest } from '@/inngest/functions/backfillNFT'
import { backfillNFTInngestCronJob } from '@/inngest/functions/backfillNFTCronJob'
import {
  backfillSMSOptInReplyWithInngest,
  backfillSMSOptInReplyWithInngestUpdateBatchOfUsers,
} from '@/inngest/functions/capitolCanary/backfillSMSOptInReply'
import { checkSMSOptInReplyWithInngest } from '@/inngest/functions/capitolCanary/checkSMSOptInReply'
import { emailRepViaCapitolCanaryWithInngest } from '@/inngest/functions/capitolCanary/emailRepViaCapitolCanary'
import { upsertAdvocateInCapitolCanaryWithInngest } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { cleanupNFTMintsWithInngest } from '@/inngest/functions/cleanupNFTMints'
import { cleanupPostalCodesWithInngest } from '@/inngest/functions/cleanupPostalCodes'
import { monitorBaseETHBalances } from '@/inngest/functions/monitorBaseETHBalances'
import { setPrimaryCryptoAddressOfUserWithInngest } from '@/inngest/functions/setPrimaryCryptoAddressOfUser'
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
    upsertAdvocateInCapitolCanaryWithInngest,
    emailRepViaCapitolCanaryWithInngest,
    checkSMSOptInReplyWithInngest,
    backfillSMSOptInReplyWithInngest,
    backfillSMSOptInReplyWithInngestUpdateBatchOfUsers,
    airdropNFTWithInngest,
    cleanupPostalCodesWithInngest,
    monitorBaseETHBalances,
    setPrimaryCryptoAddressOfUserWithInngest,
    backfillNFTWithInngest,
    backfillNFTInngestCronJob,
    cleanupNFTMintsWithInngest,
    backfillUsersTotalDonationAmountUsdInngest,
    backfillUsersTotalDonationAmountUsdInngestUpdateBatchOfUsers,
    auditUsersTotalDonationAmountUsdInngest,
    auditUsersTotalDonationAmountUsdInngestAuditBatchOfUsers,
    backfillDonationActionWithInngest,
  ],
})
