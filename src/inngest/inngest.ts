import { sentryMiddleware } from '@inngest/middleware-sentry'
import { GetEvents, Inngest } from 'inngest'

import { INNGEST_SCHEMAS } from '@/inngest/types'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('inngest')

export const inngest = new Inngest({
  id: 'swc-web',
  logger,
  schemas: INNGEST_SCHEMAS,
  middleware: [sentryMiddleware()],
})

export type InngestEvents = GetEvents<typeof inngest>
