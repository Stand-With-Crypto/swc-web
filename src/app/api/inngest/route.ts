import { serve } from 'inngest/next'

import { airdropNFTWithInngest } from '@/inngest/functions/airdropNFT'
import { backfillNFTWithInngest } from '@/inngest/functions/backfillNFT'
import { backfillNFTInngestCronJob } from '@/inngest/functions/backfillNFTCronJob'
import { cleanupNFTMintsWithInngest } from '@/inngest/functions/cleanupNFTMints'
import { cleanupPostalCodesWithInngest } from '@/inngest/functions/cleanupPostalCodes'
import { emailRepViaCapitolCanaryWithInngest } from '@/inngest/functions/emailRepViaCapitolCanary'
import { monitorBaseETHBalances } from '@/inngest/functions/monitorBaseETHBalances'
import { setPrimaryCryptoAddressOfUserWithInngest } from '@/inngest/functions/setPrimaryCryptoAddressOfUser'
import { upsertAdvocateInCapitolCanaryWithInngest } from '@/inngest/functions/upsertAdvocateInCapitolCanary'
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
  ],
})
