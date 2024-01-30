import { createAdvocateInCapitolCanaryWithInngest } from '@/inngest/functions/createAdvocateInCapitolCanary'
import { emailRepViaCapitolCanaryWithInngest } from '@/inngest/functions/emailRepViaCapitolCanary'
import { helloWorld } from '@/inngest/functions/helloWorld'
import { inngest } from '@/inngest/inngest'
import { serve } from 'inngest/next'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    createAdvocateInCapitolCanaryWithInngest,
    emailRepViaCapitolCanaryWithInngest,
  ],
})
