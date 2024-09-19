import { Inngest } from 'inngest'

import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('inngest')

export const inngest = new Inngest({ id: 'swc-web', logger })
