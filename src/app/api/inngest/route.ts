import { serve } from 'inngest/next'

import { airdropNFTWithInngest } from '@/inngest/functions/airdropNFT'
import { cleanupPostalCodesWithInngest } from '@/inngest/functions/cleanupPostalCodes'
import { emailRepViaCapitolCanaryWithInngest } from '@/inngest/functions/emailRepViaCapitolCanary'
import { monitorBaseETHBalances } from '@/inngest/functions/monitorBaseETHBalances'
import { upsertAdvocateInCapitolCanaryWithInngest } from '@/inngest/functions/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    upsertAdvocateInCapitolCanaryWithInngest,
    emailRepViaCapitolCanaryWithInngest,
    airdropNFTWithInngest,
    cleanupPostalCodesWithInngest,
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production' ? [monitorBaseETHBalances] : []),
  ],
})
