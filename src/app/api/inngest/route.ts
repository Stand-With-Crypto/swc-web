import { helloWorld } from '@/inngest/functions/helloWorld'
import { inngest } from '@/inngest/inngest'
import { serve } from 'inngest/next'

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld],
})
