import { serve } from 'inngest/next'

import { airdropNFTWithInngest } from '@/inngest/functions/airdropNFT'
import { backfillNFTWithInngest } from '@/inngest/functions/backfillNFT'
import { backfillNFTInngestCronJob } from '@/inngest/functions/backfillNFTCronJob'
import { cleanupPostalCodesWithInngest } from '@/inngest/functions/cleanupPostalCodes'
import { emailRepViaCapitolCanaryWithInngest } from '@/inngest/functions/emailRepViaCapitolCanary'
import { monitorBaseETHBalances } from '@/inngest/functions/monitorBaseETHBalances'
import { setPrimaryCryptoAddressOfUserWithInngest } from '@/inngest/functions/setPrimaryCryptoAddressOfUser'
import { upsertAdvocateInCapitolCanaryWithInngest } from '@/inngest/functions/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'

export const maxDuration = 300 // 5 minutes - maximum duration for a serverless function to run.

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
  ],
})
