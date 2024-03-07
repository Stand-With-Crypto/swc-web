import { serve } from 'inngest/next'

import { airdropNFTWithInngest } from '@/inngest/functions/airdropNFT'
import { cleanPostalCodesWithInngest } from '@/inngest/functions/cleanPostalCodes'
import { emailRepViaCapitolCanaryWithInngest } from '@/inngest/functions/emailRepViaCapitolCanary'
import { upsertAdvocateInCapitolCanaryWithInngest } from '@/inngest/functions/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    upsertAdvocateInCapitolCanaryWithInngest,
    emailRepViaCapitolCanaryWithInngest,
    airdropNFTWithInngest,
    cleanPostalCodesWithInngest,
  ],
})
