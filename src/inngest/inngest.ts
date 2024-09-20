import { GetEvents, Inngest } from 'inngest'

import { INNGEST_SCHEMAS } from '@/inngest/types'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('inngest')

export const inngest = new Inngest({
  id: 'swc-web',
  logger,
  schemas: INNGEST_SCHEMAS,
})

export type InngestEvents = GetEvents<typeof inngest>
