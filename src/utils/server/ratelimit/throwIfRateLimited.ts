import * as Sentry from '@sentry/nextjs'

import { getIPFromHeaders } from '@/utils/server/getIPFromHeaders'
import {
  authenticatedRateLimiter,
  unauthenticatedRatelimiter,
} from '@/utils/server/ratelimit/ratelimiter'
import { isCypress } from '@/utils/shared/executionEnvironment'

interface ThrowIfRateLimitedProps {
  context?: 'unauthenticated' | 'authenticated'
}

export async function throwIfRateLimited({
  context = 'unauthenticated',
}: ThrowIfRateLimitedProps = {}) {
  const ip = await getIPFromHeaders()
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

  if (isCypress) {
    return {
      triggerRateLimiterAtMostOnce: async () => {
        return
      },
    }
  }

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
