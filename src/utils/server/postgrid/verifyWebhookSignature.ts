import { jwtDecode } from 'jwt-decode'

import type { PostGridWebhookPayload } from '@/utils/server/postgrid/types'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const POSTGRID_WEBHOOK_SECRET = requiredOutsideLocalEnv(
  process.env.POSTGRID_WEBHOOK_SECRET,
  'POSTGRID_WEBHOOK_SECRET',
  'PostGrid Webhook Events',
)

export function verifyPostgridWebhookSignature(payload: string | undefined) {
  if (!POSTGRID_WEBHOOK_SECRET || !payload) {
    return false
  }

  return jwtDecode<PostGridWebhookPayload>(payload)
}
