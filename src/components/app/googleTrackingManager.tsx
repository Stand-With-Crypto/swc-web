import { GoogleTagManager } from '@next/third-parties/google'

import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

// even though locally we don't render GTM we still
// want to capture on sentry if ID not set
const googleTrackingManagerId = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
  'NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID',
)

export function GoogleTrackingManager() {
  if (NEXT_PUBLIC_ENVIRONMENT === 'local') {
    return null
  }

  return <GoogleTagManager gtmId={googleTrackingManagerId} />
}
