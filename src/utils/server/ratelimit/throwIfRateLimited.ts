import * as Sentry from '@sentry/nextjs'

import { getIPFromHeaders } from '@/utils/server/getIPFromHeaders'
import {
  authenticatedRateLimiter,
  unauthenticatedRatelimiter,
} from '@/utils/server/ratelimit/ratelimiter'

interface ThrowIfRateLimitedProps {
  context?: 'unauthenticated' | 'authenticated'
}

export async function throwIfRateLimited({
  context = 'unauthenticated',
}: ThrowIfRateLimitedProps = {}) {
  const ip = getIPFromHeaders()
  if (!ip) {
    throw new Error('no ip')
  }

  const ratelimiter =
    context === 'authenticated' ? authenticatedRateLimiter : unauthenticatedRatelimiter

  const result = await ratelimiter.limit(ip)
  if (!result.success) {
    Sentry.captureException('Rate limit exceeded', {
      user: {
        ip_address: ip,
      },
      tags: {
        domain: 'throwIfRateLimited',
      },
      extra: {
        context,
        ip,
      },
    })
    throw new Error('Invalid request')
  }
}

export function getRequestRateLimiter({
  context = 'unauthenticated',
}: ThrowIfRateLimitedProps = {}) {
  let hasRegisteredTry = false

  return {
    triggerRateLimiterAtMostOnce: async () => {
      if (hasRegisteredTry) {
        return
      }

      await throwIfRateLimited({ context })
      hasRegisteredTry = true
    },
  }
}
