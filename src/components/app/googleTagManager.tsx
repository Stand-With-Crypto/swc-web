import { GoogleTagManager as GTM } from '@next/third-parties/google'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

// even though locally we don't render GTM we still
// want to capture on sentry if ID not set
const googleTagManagerId = requiredOutsideLocalEnv(
  process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
  'NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID',
  'Google Tag Manager environment variable not set',
)

export function GoogleTagManager() {
  if (NEXT_PUBLIC_ENVIRONMENT === 'local') {
    return null
  }

  return <GTM gtmId={googleTagManagerId ?? ''} />
}
