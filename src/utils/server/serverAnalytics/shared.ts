import mixpanelLib from 'mixpanel'

import { requiredEnv } from '@/utils/shared/requiredEnv'

const NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN = requiredEnv(
  process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN,
  'process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN',
)

export const mixpanel = mixpanelLib.init(NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN)

export const ANALYTICS_FLUSH_TIMEOUT_MS = 10000
