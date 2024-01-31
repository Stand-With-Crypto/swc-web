import { emailRepViaCapitolCanaryWithInngest } from '@/inngest/functions/emailRepViaCapitolCanary'
import { helloWorld } from '@/inngest/functions/helloWorld'
import { upsertAdvocateInCapitolCanaryWithInngest } from '@/inngest/functions/upsertAdvocateInCapitolCanary'
import { airdropNFTWithInngest } from '@/inngest/functions/airdropNFT'
import { inngest } from '@/inngest/inngest'
import { serve } from 'inngest/next'
import { updateNFTStatus } from '@/inngest/functions/updateNFTStatus'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    upsertAdvocateInCapitolCanaryWithInngest,
    emailRepViaCapitolCanaryWithInngest,
    airdropNFTWithInngest,
    updateNFTStatus,
  ],
})
